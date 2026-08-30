-- ============================================================
-- Projects — structured content for the redesigned detail page.
--
-- The detail page used to be "description + payment_plan", two
-- free-text blobs an admin had to hand-format. The redesign needs
-- real sections — highlights, amenity groups, location advantages,
-- a payment table — each with a variable number of entries that the
-- page lays out on its own.
--
-- These are jsonb arrays rather than child tables on purpose:
--   • they are only ever read as a whole, with the project;
--   • they are edited as a whole, by one admin form;
--   • an empty array is a hidden section, which is exactly the
--     "adapt to whatever this project has" behaviour we want.
--
-- Every column defaults to an empty array, so existing projects
-- keep rendering (their sections simply don't appear) until an
-- admin fills them in. The old `description` / `payment_plan`
-- text columns are untouched and still rendered.
--
-- Shapes (extra keys are ignored by the reader, missing keys
-- fall back to ""):
--   highlights          [{ icon, title, description }]
--   amenity_groups      [{ icon, title, items: [text, …] }]
--   location_advantages [{ icon, place, distance }]
--   payment_plans       [{ unit_type, tower, area, price,
--                          availability, charges, notes }]
--   additional_charges  [{ label, value, note }]
--   key_specs           [{ label, value }]
-- ============================================================

alter table projects
  add column if not exists highlights          jsonb not null default '[]'::jsonb,
  add column if not exists amenity_groups      jsonb not null default '[]'::jsonb,
  add column if not exists location_advantages jsonb not null default '[]'::jsonb,
  add column if not exists payment_plans       jsonb not null default '[]'::jsonb,
  add column if not exists additional_charges  jsonb not null default '[]'::jsonb,
  add column if not exists key_specs           jsonb not null default '[]'::jsonb;

-- Free-text bits the redesigned page needs that aren't lists.
alter table projects
  add column if not exists overview        text,   -- short intro under the project name
  add column if not exists payment_note    text,   -- fine print under the payment table
  add column if not exists rera_number     text,   -- shown in the trust strip when set
  add column if not exists contact_phone   text,   -- per-project CTA override
  add column if not exists contact_whatsapp text;  -- digits with country code, e.g. 919368446069

-- Each of the six must be a json ARRAY — an object or scalar would make the
-- page's `.map()` throw at render time, so reject it at write time instead.
alter table projects drop constraint if exists projects_content_arrays_check;
alter table projects
  add constraint projects_content_arrays_check check (
    jsonb_typeof(highlights)          = 'array'
    and jsonb_typeof(amenity_groups)      = 'array'
    and jsonb_typeof(location_advantages) = 'array'
    and jsonb_typeof(payment_plans)       = 'array'
    and jsonb_typeof(additional_charges)  = 'array'
    and jsonb_typeof(key_specs)           = 'array'
  );

comment on column projects.highlights is
  'Key highlights: [{icon, title, description}] — rendered as the highlight grid';
comment on column projects.amenity_groups is
  'Amenity categories: [{icon, title, items:[text]}] — one card per category';
comment on column projects.location_advantages is
  'Nearby places: [{icon, place, distance}] — the location advantage list';
comment on column projects.payment_plans is
  'Unit/payment rows: [{unit_type, tower, area, price, availability, charges, notes}]';
comment on column projects.additional_charges is
  'Charges beyond the base price: [{label, value, note}] — PLC, floor rise, etc.';
comment on column projects.key_specs is
  'Quick facts shown in the overview: [{label, value}]';
comment on column projects.overview is
  'Short intro paragraph shown beside the gallery; falls back to tagline/description';
comment on column projects.payment_note is
  'Fine print under the payment table (taxes, validity, terms)';
comment on column projects.rera_number is
  'RERA registration number; the trust strip only claims RERA when this is set';
comment on column projects.contact_phone is
  'Per-project phone for the CTAs; falls back to the site-wide number';
comment on column projects.contact_whatsapp is
  'Per-project WhatsApp number, digits + country code; falls back to site-wide';
