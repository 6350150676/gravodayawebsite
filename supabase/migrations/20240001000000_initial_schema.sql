-- ============================================================
-- Gravodaya Developers — Initial Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for full-text search on properties

-- ============================================================
-- LOOKUP TABLES
-- ============================================================

create table cities (
  id   serial primary key,
  name text not null,
  slug text not null unique
);

create table localities (
  id      serial primary key,
  city_id integer not null references cities (id) on delete cascade,
  name    text not null,
  slug    text not null,
  unique (city_id, slug)
);

create table property_categories (
  id   serial primary key,
  name text not null,
  slug text not null unique
);

-- ============================================================
-- ADMINS
-- ============================================================

create table admins (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PROPERTIES
-- ============================================================

create table properties (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,
  title       text not null,
  description text not null,
  price       numeric(14, 2) not null check (price > 0),
  price_label text,                          -- e.g. "₹45 L onwards"
  category_id integer not null references property_categories (id),
  city_id     integer not null references cities (id),
  locality_id integer references localities (id),
  address     text,
  area_sqft   numeric(10, 2),
  bedrooms    smallint check (bedrooms >= 0),
  bathrooms   smallint check (bathrooms >= 0),
  amenities   text[] not null default '{}',
  is_for_rent boolean not null default false,
  is_featured boolean not null default false,
  status      text not null default 'active'
                check (status in ('active', 'sold', 'rented', 'inactive')),
  map_lat     double precision,
  map_lng     double precision,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table property_images (
  id           uuid primary key default uuid_generate_v4(),
  property_id  uuid not null references properties (id) on delete cascade,
  storage_path text not null,               -- path in Supabase Storage bucket
  is_cover     boolean not null default false,
  sort_order   smallint not null default 0,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- INQUIRIES (buyer contacts admin about a property)
-- ============================================================

create table inquiries (
  id          uuid primary key default uuid_generate_v4(),
  property_id uuid references properties (id) on delete set null,
  name        text not null,
  phone       text not null,
  email       text,
  message     text,
  status      text not null default 'new'
                check (status in ('new', 'contacted', 'closed')),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- SELLER SUBMISSIONS (seller submits their property to admin)
-- ============================================================

create table seller_submissions (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  phone         text not null,
  email         text,
  property_type text not null,
  city          text not null,
  locality      text,
  description   text,
  asking_price  numeric(14, 2),
  status        text not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected', 'published')),
  admin_notes   text,
  created_at    timestamptz not null default now()
);

create table submission_images (
  id            uuid primary key default uuid_generate_v4(),
  submission_id uuid not null references seller_submissions (id) on delete cascade,
  storage_path  text not null,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- CONTACT MESSAGES (general contact form)
-- ============================================================

create table contact_messages (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  phone      text not null,
  email      text,
  message    text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Properties: common filter columns
create index idx_properties_status      on properties (status);
create index idx_properties_city_id     on properties (city_id);
create index idx_properties_category_id on properties (category_id);
create index idx_properties_is_for_rent on properties (is_for_rent);
create index idx_properties_is_featured on properties (is_featured);
create index idx_properties_price       on properties (price);
create index idx_properties_slug        on properties (slug);

-- Full-text search on title + description
create index idx_properties_fts on properties
  using gin (to_tsvector('english', title || ' ' || description));

-- Property images: lookup by property
create index idx_property_images_property_id on property_images (property_id);

-- Inquiries: sort by newest, filter by status
create index idx_inquiries_status     on inquiries (status);
create index idx_inquiries_created_at on inquiries (created_at desc);

-- Submissions: filter by status
create index idx_submissions_status on seller_submissions (status);

-- ============================================================
-- AUTO-UPDATE updated_at ON properties
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_properties_updated_at
  before update on properties
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table admins              enable row level security;
alter table cities              enable row level security;
alter table localities          enable row level security;
alter table property_categories enable row level security;
alter table properties          enable row level security;
alter table property_images     enable row level security;
alter table inquiries           enable row level security;
alter table seller_submissions  enable row level security;
alter table submission_images   enable row level security;
alter table contact_messages    enable row level security;

-- Helper: is the caller a known admin?
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from admins where id = auth.uid()
  );
$$;

-- ---------- cities (public read, admin write) ----------
create policy "cities_public_read"
  on cities for select using (true);

create policy "cities_admin_all"
  on cities for all using (is_admin()) with check (is_admin());

-- ---------- localities (public read, admin write) ----------
create policy "localities_public_read"
  on localities for select using (true);

create policy "localities_admin_all"
  on localities for all using (is_admin()) with check (is_admin());

-- ---------- property_categories (public read, admin write) ----------
create policy "categories_public_read"
  on property_categories for select using (true);

create policy "categories_admin_all"
  on property_categories for all using (is_admin()) with check (is_admin());

-- ---------- properties (active ones public, all for admin) ----------
create policy "properties_public_read"
  on properties for select using (status = 'active');

create policy "properties_admin_all"
  on properties for all using (is_admin()) with check (is_admin());

-- ---------- property_images (public read if property is active) ----------
create policy "property_images_public_read"
  on property_images for select using (
    exists (
      select 1 from properties p
      where p.id = property_id and p.status = 'active'
    )
  );

create policy "property_images_admin_all"
  on property_images for all using (is_admin()) with check (is_admin());

-- ---------- inquiries (insert only for anon, full access for admin) ----------
create policy "inquiries_public_insert"
  on inquiries for insert with check (true);

create policy "inquiries_admin_all"
  on inquiries for all using (is_admin());

-- ---------- seller_submissions (insert only for anon, full access for admin) ----------
create policy "submissions_public_insert"
  on seller_submissions for insert with check (true);

create policy "submissions_admin_all"
  on seller_submissions for all using (is_admin());

-- ---------- submission_images (insert only for anon, full access for admin) ----------
create policy "submission_images_public_insert"
  on submission_images for insert with check (true);

create policy "submission_images_admin_all"
  on submission_images for all using (is_admin());

-- ---------- contact_messages (insert only for anon, full access for admin) ----------
create policy "contact_messages_public_insert"
  on contact_messages for insert with check (true);

create policy "contact_messages_admin_all"
  on contact_messages for all using (is_admin());

-- ---------- admins (only admins can read their own row) ----------
create policy "admins_self_read"
  on admins for select using (id = auth.uid());
