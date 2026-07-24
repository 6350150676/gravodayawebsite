-- Ties inquiries to a project (colony/villa listing) directly, so the
-- "enquire about this project" form on project detail pages shows up
-- tagged in the admin panel — not just inquiries about a single unit.

alter table inquiries
  add column project_id uuid references projects (id) on delete set null;

create index idx_inquiries_project_id on inquiries (project_id);
