-- ============================================================
-- One-off cleanup: remove Dehradun / Rishikesh (and any other
-- non-Haridwar) cities, localities, and properties.
-- Run once in the Supabase SQL Editor after the Haridwar-only
-- pivot. Safe to re-run — it's a no-op once nothing matches.
-- ============================================================

-- 1. Property images are removed automatically via
--    "on delete cascade" when their property is deleted.
--    NOTE: this does NOT delete the actual files from the
--    property-images storage bucket — remove those manually
--    from Storage → property-images if you want to reclaim space.

-- 2. Delete properties belonging to any city that isn't Haridwar.
--    (Any inquiries pointing at these properties get property_id
--    set to null automatically — the inquiry rows themselves are kept.)
delete from properties
where city_id in (select id from cities where slug <> 'haridwar');

-- 3. Delete localities for any non-Haridwar city.
--    (Cascades automatically when the city row is deleted below,
--    but doing it explicitly first makes the run order clear.)
delete from localities
where city_id in (select id from cities where slug <> 'haridwar');

-- 4. Delete the non-Haridwar city rows themselves.
delete from cities
where slug <> 'haridwar';

-- ============================================================
-- Verify
-- ============================================================
-- Should return only Haridwar
select * from cities;

-- Should return 0
select count(*) from properties p
where not exists (select 1 from cities c where c.id = p.city_id and c.slug = 'haridwar');
