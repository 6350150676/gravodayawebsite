-- ============================================================
-- Seller submissions: approve / reject workflow
-- ============================================================
-- A seller's listing stays in seller_submissions until an admin approves it.
-- Approving copies it into `properties` as an ordinary active listing and
-- links the two through property_id. Nothing pending or rejected is ever
-- written to `properties`, so the existing anon RLS on that table (status =
-- 'active') remains the single rule for what the public site can see, and the
-- seller's name/phone/email never leave seller_submissions.
--
-- Safe to re-run.

-- ---------- seller_submissions ----------

alter table seller_submissions
  add column if not exists area_sqft        numeric(10, 2) check (area_sqft > 0),
  add column if not exists bedrooms         smallint check (bedrooms >= 0),
  add column if not exists bathrooms        smallint check (bathrooms >= 0),
  add column if not exists rejection_reason text,
  add column if not exists approved_at      timestamptz,
  add column if not exists rejected_at      timestamptz,
  add column if not exists property_id      uuid references properties (id) on delete set null;

-- 'published' was never a separate step from 'approved': approving now
-- publishes the listing.
update seller_submissions set status = 'approved' where status = 'published';

alter table seller_submissions drop constraint if exists seller_submissions_status_check;
alter table seller_submissions
  add constraint seller_submissions_status_check
  check (status in ('pending', 'approved', 'rejected'));

create index if not exists idx_submissions_property_id on seller_submissions (property_id);

-- The Sell form posts through a server action using the service-role key, so
-- the anon insert policies were never used. Left in place they let anyone with
-- the public anon key insert a row that is already 'approved'.
drop policy if exists "submissions_public_insert"       on seller_submissions;
drop policy if exists "submission_images_public_insert" on submission_images;

-- ---------- submission_images ----------

-- keeps the order the seller picked their photos in
alter table submission_images
  add column if not exists sort_order smallint not null default 0;

-- ---------- properties ----------

-- short pitch lines on a listing, e.g. "Corner plot", "5 min to Har Ki Pauri"
alter table properties
  add column if not exists selling_points text[] not null default '{}';

-- ---------- storage ----------

-- Seller photos are private until approval. No storage policies on purpose:
-- only the service role can read or write here, and the admin page shows the
-- photos through short-lived signed URLs. Approval copies them into the
-- public property-images bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submission-images', 'submission-images', false, 5242880, array['image/webp'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

notify pgrst, 'reload schema';
