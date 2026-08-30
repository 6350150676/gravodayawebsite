-- Run in project zklajorxhofjilmytlbp -> SQL Editor -> Run.
-- Safe to run more than once.

alter table projects
  add column if not exists highlights          jsonb not null default '[]'::jsonb,
  add column if not exists amenity_groups      jsonb not null default '[]'::jsonb,
  add column if not exists location_advantages jsonb not null default '[]'::jsonb,
  add column if not exists payment_plans       jsonb not null default '[]'::jsonb,
  add column if not exists additional_charges  jsonb not null default '[]'::jsonb,
  add column if not exists key_specs           jsonb not null default '[]'::jsonb,
  add column if not exists overview            text,
  add column if not exists payment_note        text,
  add column if not exists rera_number         text,
  add column if not exists contact_phone       text,
  add column if not exists contact_whatsapp    text;

alter table projects drop constraint if exists projects_content_arrays_check;
alter table projects
  add constraint projects_content_arrays_check check (
    jsonb_typeof(highlights)              = 'array'
    and jsonb_typeof(amenity_groups)      = 'array'
    and jsonb_typeof(location_advantages) = 'array'
    and jsonb_typeof(payment_plans)       = 'array'
    and jsonb_typeof(additional_charges)  = 'array'
    and jsonb_typeof(key_specs)           = 'array'
  );

notify pgrst, 'reload schema';

-- Must print 11.
select count(*) as columns_added
from information_schema.columns
where table_schema = 'public' and table_name = 'projects'
  and column_name in ('highlights','amenity_groups','location_advantages',
                      'payment_plans','additional_charges','key_specs',
                      'overview','payment_note','rera_number',
                      'contact_phone','contact_whatsapp');
