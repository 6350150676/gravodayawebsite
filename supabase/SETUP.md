# Supabase Setup Guide

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Name: `gravodaya-website` | Region: `ap-south-1` (Mumbai, closest to Haridwar)
3. Set a strong database password and save it

## 2. Get your API keys

Dashboard → Settings → API:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (keep secret!) |

Copy these into a `.env.local` file (never commit it).

## 3. Run the migrations

Go to **Supabase Dashboard → SQL Editor** and run **every file in
`supabase/migrations/`, in filename order**. Every migration is written to be
safe to re-run, so when in doubt run the whole folder again — that is also how
you bring an existing database up to date after pulling new code.

1. `20240001000000_initial_schema.sql`
2. `20240001000001_storage.sql`
3. `20240002000000_site_content.sql` — editable homepage content (hero, stats,
   "why us", city cards, intent cards, contact info). Seeds the defaults the
   site already ships with. After this, manage it all from **Admin → Site Content**.
4. `20250712000000_projects.sql` — projects (whole developments) + their images
5. `20260720000000_feedback.sql` — customer testimonials
6. `20260725000000_inquiries_project_id.sql` — lets an inquiry point at a project
7. `20260729000000_whyus_image.sql` — swaps the seeded stock photo for a local one
8. `20260803000000_project_price_range.sql` — `price_min` / `price_max` on projects
9. `20260803000001_project_categories.sql` — `category_ids` on projects

> **Skipping a migration breaks the admin portal, not just the feature.** The
> project edit form always submits every column, so a database missing (say)
> `price_min` rejects the whole update with `column projects.price_min does not
> exist` — and nothing on that project can be saved, not even its name.

## 4. Seed lookup data

Still in the SQL Editor, run:

1. `supabase/seed/01_lookups.sql` — adds cities, localities, categories

## 5. Create the admin user

1. Dashboard → Authentication → Users → **Add user**
2. Enter your admin email + strong password → Create
3. Copy the UUID of the newly created user
4. Open `supabase/seed/02_admin_user.sql`
5. Replace `<YOUR_ADMIN_USER_UUID>` and `<YOUR_ADMIN_EMAIL>`
6. Run it in the SQL Editor

## 6. Verify RLS is working

In the SQL Editor run:
```sql
-- Should return rows
select * from cities;
select * from property_categories;

-- Should return 1 row
select * from admins;
```

## 7. Storage bucket

The `property-images` bucket is created by migration `20240001000001_storage.sql`.
Verify it appears under **Storage** in the dashboard.
