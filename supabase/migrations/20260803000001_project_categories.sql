-- ============================================================
-- Projects — searchable property types.
--
-- The home page's "Browse by Type" tiles and the filter sidebar
-- both filter by property_categories. Projects had no category
-- at all, so every one of those filters excluded them.
--
-- A project spans more than one type: a plotted colony that also
-- sells built villas is both "Plots / Land" and "Residential",
-- and anything currently selling is also a "New Project". So this
-- is an array of category ids, not a single foreign key.
--
-- Integrity is enforced by trigger rather than a foreign key —
-- Postgres has no per-element FK for array columns.
-- ============================================================

alter table projects
  add column if not exists category_ids integer[] not null default '{}';

create or replace function projects_check_category_ids()
returns trigger language plpgsql as $$
begin
  if exists (
    select 1
    from unnest(new.category_ids) as cid
    where not exists (select 1 from property_categories pc where pc.id = cid)
  ) then
    raise exception 'category_ids contains an id with no matching property_categories row';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_projects_category_ids on projects;
create trigger trg_projects_category_ids
  before insert or update of category_ids on projects
  for each row execute function projects_check_category_ids();

-- Containment lookups (`category_ids @> '{5}'`) use GIN.
create index if not exists idx_projects_category_ids on projects using gin (category_ids);

comment on column projects.category_ids is
  'property_categories ids this project sells under; drives the type filter';

-- ============================================================
-- Backfill the current three projects, keyed by slug so a
-- re-run is safe. Ids: 1 = Residential, 4 = Plots / Land,
-- 5 = New Projects.
-- ============================================================

-- Nine-storey apartment development, 1/2/3 BHK units.
update projects set category_ids = '{1,5}'
  where slug = 'ganga-vista-1785413584091';

-- Apartment development, 1/2/3 BHK + penthouses.
update projects set category_ids = '{1,5}'
  where slug = 'divine-touch-1784899386197';

-- Plotted colony that also delivers ready-to-build villas.
update projects set category_ids = '{1,4,5}'
  where slug = 'residential-community-near-roorkee';
