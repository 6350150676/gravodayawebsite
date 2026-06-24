-- ============================================================
-- Seed: Register the first admin
-- ============================================================
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → enter your admin email + a strong password
-- 3. Copy the user's UUID from the Users table
-- 4. Replace <YOUR_ADMIN_USER_UUID> and <YOUR_ADMIN_EMAIL> below
-- 5. Run this in the Supabase SQL editor
-- ============================================================

insert into admins (id, email) values
  ('db02252c-7697-484d-9c2e-052f24733d2e', 'garvodaydevelopers@gmail.com')
on conflict (id) do nothing;
