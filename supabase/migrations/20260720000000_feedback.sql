-- ============================================================
-- FEEDBACK (customer rates their experience after submitting a form)
-- ============================================================

create table feedback (
  id         uuid primary key default uuid_generate_v4(),
  source     text not null
               check (source in ('contact', 'inquiry', 'submission')),
  rating     int not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now()
);

alter table feedback enable row level security;

create policy "feedback_public_insert"
  on feedback for insert with check (true);

create policy "feedback_admin_all"
  on feedback for all using (is_admin());
