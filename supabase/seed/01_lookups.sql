-- ============================================================
-- Seed: Cities, Localities, Property Categories
-- Run this AFTER the migration in the Supabase SQL editor
-- ============================================================

-- Cities
insert into cities (name, slug) values
  ('Haridwar',  'haridwar')
on conflict (slug) do nothing;

-- Localities — Haridwar
insert into localities (city_id, name, slug)
select id, l.name, l.slug from cities, (values
  ('Jwalapur',      'jwalapur'),
  ('Shivalik Nagar','shivalik-nagar'),
  ('BHEL Township', 'bhel-township'),
  ('Kankhal',       'kankhal')
) as l(name, slug)
where cities.slug = 'haridwar'
on conflict (city_id, slug) do nothing;

-- Property Categories
insert into property_categories (name, slug) values
  ('Residential Properties', 'residential'),
  ('Rental Properties',      'rental'),
  ('Commercial Properties',  'commercial'),
  ('Plots / Land',           'plots-land'),
  ('New Projects',           'new-projects')
on conflict (slug) do nothing;
