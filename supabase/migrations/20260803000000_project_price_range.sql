-- ============================================================
-- Projects — indicative price range.
--
-- Projects group many units (plots, villas) at different sizes,
-- so a single price makes no sense; we store the "from" and "to"
-- of the range instead. Both are optional — a project with
-- neither simply renders no price. Rupees, not lakhs/crores:
-- the UI formats them for display.
-- ============================================================

alter table projects
  add column if not exists price_min bigint,
  add column if not exists price_max bigint;

alter table projects
  drop constraint if exists projects_price_range_check;

alter table projects
  add constraint projects_price_range_check check (
    (price_min is null or price_min > 0)
    and (price_max is null or price_max > 0)
    and (price_min is null or price_max is null or price_max >= price_min)
  );

comment on column projects.price_min is 'Indicative starting price in rupees (e.g. 8000000 = 80 lakh)';
comment on column projects.price_max is 'Indicative top-end price in rupees (e.g. 20000000 = 2 crore)';

-- Current ranges, keyed by slug so a re-run is safe.
update projects set price_min =  8000000, price_max = 20000000  -- ₹80 L – ₹2 Cr
  where slug = 'ganga-vista-1785413584091';

update projects set price_min =  3000000, price_max = 15000000  -- ₹30 L – ₹1.5 Cr
  where slug = 'divine-touch-1784899386197';

update projects set price_min =  3500000, price_max = 10000000  -- ₹35 L – ₹1 Cr
  where slug = 'residential-community-near-roorkee';
