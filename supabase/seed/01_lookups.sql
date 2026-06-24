-- ============================================================
-- Seed: Cities, Localities, Property Categories
-- Run this AFTER the migration in the Supabase SQL editor
-- ============================================================

-- Cities
insert into cities (name, slug) values
  ('Dehradun',  'dehradun'),
  ('Haridwar',  'haridwar'),
  ('Rishikesh', 'rishikesh')
on conflict (slug) do nothing;

-- Localities — Dehradun (city_id = 1)
insert into localities (city_id, name, slug) values
  (1, 'Rajpur Road',        'rajpur-road'),
  (1, 'Sahastradhara Road', 'sahastradhara-road'),
  (1, 'Mussoorie Road',     'mussoorie-road'),
  (1, 'Prem Nagar',         'prem-nagar'),
  (1, 'Ballupur',           'ballupur'),
  (1, 'Dharampur',          'dharampur'),
  (1, 'GMS Road',           'gms-road'),
  (1, 'Karanpur',           'karanpur'),
  (1, 'Vasant Vihar',       'vasant-vihar'),
  (1, 'Niranjanpur',        'niranjanpur')
on conflict (city_id, slug) do nothing;

-- Localities — Haridwar (city_id = 2)
insert into localities (city_id, name, slug) values
  (2, 'Jwalapur',      'jwalapur'),
  (2, 'Shivalik Nagar','shivalik-nagar'),
  (2, 'BHEL Township', 'bhel-township'),
  (2, 'Kankhal',       'kankhal')
on conflict (city_id, slug) do nothing;

-- Localities — Rishikesh (city_id = 3)
insert into localities (city_id, name, slug) values
  (3, 'Tapovan',       'tapovan'),
  (3, 'Laxman Jhula',  'laxman-jhula'),
  (3, 'Muni Ki Reti',  'muni-ki-reti'),
  (3, 'Swarg Ashram',  'swarg-ashram')
on conflict (city_id, slug) do nothing;

-- Property Categories
insert into property_categories (name, slug) values
  ('Residential Properties', 'residential'),
  ('Rental Properties',      'rental'),
  ('Commercial Properties',  'commercial'),
  ('Plots / Land',           'plots-land'),
  ('New Projects',           'new-projects')
on conflict (slug) do nothing;
