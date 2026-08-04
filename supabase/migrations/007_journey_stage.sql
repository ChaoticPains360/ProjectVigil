-- Tracks which Journey stage a user is currently focused on (set from
-- the Journey timeline in the app). Lets the nightly reminder speak
-- to where someone actually is instead of a single generic message.
alter table public.profiles
  add column journey_stage text not null default 'reveal'
    check (journey_stage in ('reveal', 'restore', 'strengthen'));
