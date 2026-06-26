-- ============================================================
-- Gravodaya Developers — Editable Site Content
-- ------------------------------------------------------------
-- Moves the landing-page marketing content (hero, stats, "why
-- us" points, prime-location cities, intent cards, contact info)
-- out of the code and into the database so it can be edited from
-- the admin panel without a deploy.
--
-- Safe to run more than once (idempotent).
-- Run AFTER 20240001000000_initial_schema.sql.
-- ============================================================

-- ── 1. City presentation columns (Prime Locations section) ──
alter table cities add column if not exists tagline    text;
alter table cities add column if not exists image_url  text;
alter table cities add column if not exists sort_order integer not null default 0;

-- ── 2. Key/value settings (singletons: hero, contact, brand) ──
create table if not exists site_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

-- ── 3. Stats counters (the "15+ years / 500+ families" strip) ──
create table if not exists site_stats (
  id         serial primary key,
  label      text not null,
  value      integer not null default 0,
  suffix     text not null default '',
  sort_order integer not null default 0
);

-- ── 4. "Why choose us" bullet points ──
create table if not exists site_features (
  id         serial primary key,
  text       text not null,
  sort_order integer not null default 0
);

-- ── 5. Intent cards ("Buy / Rent / Sell" promo cards) ──
create table if not exists intent_cards (
  id          serial primary key,
  title       text not null,
  subtitle    text,
  description text,
  cta         text,
  href        text not null default '/properties',
  image_url   text,
  accent      text not null default 'var(--color-brand)',
  sort_order  integer not null default 0
);

-- ── updated_at trigger on settings (reuses set_updated_at) ──
drop trigger if exists trg_site_settings_updated_at on site_settings;
create trigger trg_site_settings_updated_at
  before update on site_settings
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY  (public read · admin write)
-- ============================================================
alter table site_settings enable row level security;
alter table site_stats    enable row level security;
alter table site_features enable row level security;
alter table intent_cards  enable row level security;

do $$
begin
  -- site_settings
  if not exists (select 1 from pg_policies where tablename='site_settings' and policyname='site_settings_public_read') then
    create policy "site_settings_public_read" on site_settings for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='site_settings' and policyname='site_settings_admin_all') then
    create policy "site_settings_admin_all" on site_settings for all using (is_admin()) with check (is_admin());
  end if;
  -- site_stats
  if not exists (select 1 from pg_policies where tablename='site_stats' and policyname='site_stats_public_read') then
    create policy "site_stats_public_read" on site_stats for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='site_stats' and policyname='site_stats_admin_all') then
    create policy "site_stats_admin_all" on site_stats for all using (is_admin()) with check (is_admin());
  end if;
  -- site_features
  if not exists (select 1 from pg_policies where tablename='site_features' and policyname='site_features_public_read') then
    create policy "site_features_public_read" on site_features for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='site_features' and policyname='site_features_admin_all') then
    create policy "site_features_admin_all" on site_features for all using (is_admin()) with check (is_admin());
  end if;
  -- intent_cards
  if not exists (select 1 from pg_policies where tablename='intent_cards' and policyname='intent_cards_public_read') then
    create policy "intent_cards_public_read" on intent_cards for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='intent_cards' and policyname='intent_cards_admin_all') then
    create policy "intent_cards_admin_all" on intent_cards for all using (is_admin()) with check (is_admin());
  end if;
end $$;

-- ============================================================
-- SEED DEFAULTS  (matches the current hard-coded landing page)
-- ============================================================

-- ── City presentation (Dehradun / Haridwar / Rishikesh) ──
update cities set
  tagline    = 'Capital City · Gateway to the Hills',
  image_url  = 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80&auto=format&fit=crop',
  sort_order = 1
where slug = 'dehradun';

update cities set
  tagline    = 'Spiritual Hub · High Rental Demand',
  image_url  = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80&auto=format&fit=crop',
  sort_order = 2
where slug = 'haridwar';

update cities set
  tagline    = 'Scenic Beauty · Premium Retreats',
  image_url  = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format&fit=crop',
  sort_order = 3
where slug = 'rishikesh';

-- ── Settings ──
insert into site_settings (key, value) values
  ('phone_display',  '+91 98765 43210'),
  ('phone_tel',      '+919876543210'),
  ('whatsapp_number','919876543210'),
  ('contact_email',  'info@gravodaya.com'),
  ('contact_address','Race Course Road, Dehradun, Uttarakhand — 248001'),
  ('hero_badge',     'Uttarakhand''s Most Trusted Real Estate'),
  ('hero_title',     'Find Your Dream Home in the Himalayas'),
  ('hero_subtitle',  'Apartments, villas, plots & commercial spaces across Dehradun · Haridwar · Rishikesh'),
  ('hero_image_url', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=85&auto=format&fit=crop'),
  ('whyus_image_url','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80&auto=format&fit=crop'),
  ('company_tagline','Trusted Since 2008 · Dehradun'),
  ('rating_value',   '5.0'),
  ('rating_count',   '120+')
on conflict (key) do nothing;

-- ── Stats (only seed when empty, so re-running won't duplicate) ──
insert into site_stats (label, value, suffix, sort_order)
select * from (values
  ('Years of Experience', 15,  '+', 1),
  ('Happy Families',      500,  '+', 2),
  ('Prime Locations',       3,  '',  3),
  ('Transparency',        100,  '%', 4)
) as v(label, value, suffix, sort_order)
where not exists (select 1 from site_stats);

-- ── "Why choose us" features (only seed when empty) ──
insert into site_features (text, sort_order)
select * from (values
  ('RERA registered & legally compliant properties',                1),
  ('Dedicated relationship manager for every buyer',                2),
  ('Transparent pricing — no hidden charges',                       3),
  ('Expert knowledge of Dehradun, Haridwar & Rishikesh markets',    4),
  ('End-to-end support from search to registration',                5),
  ('Trusted by 500+ families across Uttarakhand',                   6)
) as v(text, sort_order)
where not exists (select 1 from site_features);

-- ── Intent cards / Buy · Rent · Sell (only seed when empty) ──
insert into intent_cards (title, subtitle, description, cta, href, image_url, accent, sort_order)
select * from (values
  ('Buy a Home', 'Own your dream property',
   'Browse apartments, villas, plots & more for sale across Dehradun, Haridwar and Rishikesh.',
   'Explore for Sale →', '/properties',
   'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&auto=format&fit=crop',
   'var(--color-brand)', 1),
  ('Rent a Property', 'Comfortable living spaces',
   'Find fully furnished or semi-furnished homes & offices at fair monthly rentals.',
   'Browse Rentals →', '/properties?type=rent',
   'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&auto=format&fit=crop',
   'var(--color-gold)', 2),
  ('Sell Your Property', 'Get the best value',
   'List with us and reach thousands of qualified buyers. Free valuation & expert assistance.',
   'Get Free Valuation →', '/contact',
   'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&auto=format&fit=crop',
   'var(--color-moss)', 3)
) as v(title, subtitle, description, cta, href, image_url, accent, sort_order)
where not exists (select 1 from intent_cards);
