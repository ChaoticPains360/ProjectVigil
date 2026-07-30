-- =========================================================
-- VIGIL: notifications migration
-- Adds per-user notification settings and push subscription
-- storage. Run this AFTER schema.sql has already been applied.
-- =========================================================

-- Reminder time + timezone: nullable until the user opts in via
-- Settings. partner_notify_pref governs whether ALL logged urges
-- or only slips trigger a partner push (owner's own choice).
alter table public.profiles
  add column reminder_time time,
  add column reminder_timezone text not null default 'UTC',
  add column partner_notify_pref text not null default 'all'
    check (partner_notify_pref in ('all', 'slip_only')),
  -- Tracks the last local calendar date a nightly reminder was sent,
  -- so the reminder fires exactly once per day regardless of how
  -- often the cron job polls (see nightly-reminders Edge Function).
  add column last_reminded_on date;

-- One row per subscribed device/browser. A user can have several
-- (phone + laptop, etc). Endpoint is unique per browser subscription.
create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- A user can fully manage only their own subscriptions. There is
-- deliberately no policy letting anyone read another user's
-- subscriptions -- the Edge Functions that send pushes use the
-- service_role key server-side, which bypasses RLS entirely.
create policy "user can manage own push_subscriptions"
  on public.push_subscriptions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
