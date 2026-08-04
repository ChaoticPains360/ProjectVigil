-- Tracks whether a user has completed the onboarding walkthrough
-- (mission, The Moment, The Journey). Null means "show onboarding".
alter table public.profiles
  add column onboarded_at timestamptz;
