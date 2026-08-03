-- ============================================================
-- Projects — slug history, so renaming a project can move its URL.
--
-- The slug was frozen at creation time, so renaming "Ganga Vista"
-- to "Luxury Property" left the page sitting at /projects/ganga-vista-…
-- The admin action now regenerates the slug from the new name — but
-- a bare rename would 404 every link already out there (Google,
-- WhatsApp shares, the brochure). So every slug a project has ever
-- used is kept here, and the detail page 301s an old slug to the
-- current one instead of 404ing.
--
-- Public-readable: the redirect lookup happens on a public page,
-- and a retired slug is not sensitive.
-- ============================================================

create table if not exists project_slug_history (
  slug       text primary key,
  project_id uuid not null references projects (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_slug_history_project_id
  on project_slug_history (project_id);

alter table project_slug_history enable row level security;

drop policy if exists "project_slug_history_public_read" on project_slug_history;
create policy "project_slug_history_public_read"
  on project_slug_history for select using (true);

drop policy if exists "project_slug_history_admin_all" on project_slug_history;
create policy "project_slug_history_admin_all"
  on project_slug_history for all using (is_admin()) with check (is_admin());

comment on table project_slug_history is
  'Slugs a project used to live at; the detail page 301s them to the current slug';

-- ============================================================
-- Backfill the one rename that happened before this table existed:
-- "Ganga Vista" → "Luxury Property". Keyed on the project's current
-- slug so a re-run is a no-op.
-- ============================================================

insert into project_slug_history (slug, project_id)
select 'ganga-vista-1785413584091', id from projects where slug = 'luxury-property'
on conflict (slug) do nothing;
