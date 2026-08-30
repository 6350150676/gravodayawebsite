-- ============================================================
-- Shorter public URLs.
--
-- Slugs used to be built as "<name>-<Date.now()>" so they'd be unique,
-- which left every link 13 digits of noise longer than it needed to be:
--   /projects/divine-touch-1784899386197
-- Creation now derives a clean slug and only appends a small numeric
-- suffix on a real collision, so this migration cleans up the rows that
-- were created under the old scheme.
--
-- A project's old slug is retired into project_slug_history, so links
-- already out there (Google, WhatsApp, the ads) 301 to the short URL
-- instead of 404ing. Re-running is a no-op — nothing matches the
-- timestamp pattern a second time.
-- ============================================================

do $$
declare
  r      record;
  target text;
begin
  for r in
    select id, slug, regexp_replace(slug, '-\d{10,}$', '') as base
    from projects
    where slug ~ '-\d{10,}$'
  loop
    target := r.base;

    -- Leave the row alone if the short slug is already spoken for, either by
    -- another live project or by a slug retired from an earlier rename.
    if target = ''
       or exists (select 1 from projects where slug = target and id <> r.id)
       or exists (select 1 from project_slug_history
                   where slug = target and project_id <> r.id) then
      continue;
    end if;

    update projects set slug = target where id = r.id;

    insert into project_slug_history (slug, project_id)
    values (r.slug, r.id)
    on conflict (slug) do nothing;

    -- The slug we just moved onto must not also be listed as a redirect.
    delete from project_slug_history where slug = target;
  end loop;
end $$;

-- Properties have no slug-history table (their URL is frozen at creation), so
-- legacy rows just take the short slug. Any that would collide keep the long
-- one and can be renamed by hand from the admin portal.
update properties p
   set slug = regexp_replace(p.slug, '-\d{10,}$', '')
 where p.slug ~ '-\d{10,}$'
   and regexp_replace(p.slug, '-\d{10,}$', '') <> ''
   and not exists (
     select 1 from properties other
      where other.id <> p.id
        and other.slug = regexp_replace(p.slug, '-\d{10,}$', '')
   );
