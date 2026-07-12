-- ============================================================
-- Projects — colony/villa developments that group multiple
-- properties (plots, villas, units) under one rich detail page.
-- ============================================================

create table projects (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text not null unique,
  name                text not null,
  tagline             text,
  location            text,                      -- free-text, e.g. "Near Roorkee, Haridwar region"
  city_id             integer references cities (id),
  description         text not null,             -- colony overview, specs, amenities
  payment_plan        text,                       -- payment milestones / price breakup, formatted text
  brochure_url        text,
  is_featured         boolean not null default false,
  status              text not null default 'active'
                        check (status in ('active', 'inactive')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table project_images (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references projects (id) on delete cascade,
  storage_path text not null,
  is_cover     boolean not null default false,
  sort_order   smallint not null default 0,
  created_at   timestamptz not null default now()
);

-- Link properties (units) to the project/colony they belong to.
alter table properties
  add column project_id uuid references projects (id) on delete set null;

create index idx_properties_project_id on properties (project_id);
create index idx_projects_status       on projects (status);
create index idx_projects_city_id      on projects (city_id);
create index idx_project_images_project_id on project_images (project_id);

create trigger trg_projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table projects       enable row level security;
alter table project_images enable row level security;

create policy "projects_public_read"
  on projects for select using (status = 'active');

create policy "projects_admin_all"
  on projects for all using (is_admin()) with check (is_admin());

create policy "project_images_public_read"
  on project_images for select using (
    exists (
      select 1 from projects p
      where p.id = project_id and p.status = 'active'
    )
  );

create policy "project_images_admin_all"
  on project_images for all using (is_admin()) with check (is_admin());

-- ============================================================
-- STORAGE: project-images bucket
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  true,
  5242880,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy "project_images_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'project-images');

create policy "project_images_bucket_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'project-images' and is_admin());

create policy "project_images_bucket_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'project-images' and is_admin());
