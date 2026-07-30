-- =========================================================
-- VIGIL: journaling migration
-- Adds a private journal (emotion tag + markdown body) and
-- journal reminder settings. Run AFTER 002_notifications.sql.
--
-- Journal entries are intentionally NOT visible to accountability
-- partners -- unlike urge_logs/streaks, there is no partner-read
-- policy here. Journaling tends to hold more vulnerable material
-- than a resisted/slip tally, so it stays owner-only unless a
-- future pass adds an explicit opt-in to share it.
-- =========================================================

create table public.journal_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  emotion    text,
  body       text not null,
  created_at timestamptz not null default now()
);

create index journal_entries_user_idx on public.journal_entries (user_id, created_at desc);

alter table public.journal_entries enable row level security;

create policy "user can manage own journal_entries"
  on public.journal_entries for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Fixed reminder slots (morning/midday/evening) rather than
-- arbitrary custom times -- keeps the scheduler simple. Each is
-- an independent opt-in toggle.
alter table public.profiles
  add column journal_remind_morning boolean not null default false,
  add column journal_remind_midday boolean not null default false,
  add column journal_remind_evening boolean not null default false,
  -- Tracks which slots have already fired today (in the user's own
  -- timezone), e.g. {"date": "2026-07-30", "slots": ["morning"]}.
  -- Reset implicitly whenever the stored date != today's local date.
  add column journal_reminded_on jsonb not null default '{}'::jsonb;
