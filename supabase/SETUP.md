# Supabase Setup Guide

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Name: `gravodaya-website` | Region: `ap-south-1` (Mumbai, closest to Dehradun)
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

Go to **Supabase Dashboard → SQL Editor** and run these files **in order**:

1. `supabase/migrations/20240001000000_initial_schema.sql`
2. `supabase/migrations/20240001000001_storage.sql`

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
