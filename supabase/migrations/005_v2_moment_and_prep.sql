-- =========================================================
-- VIGIL V2: The Moment + PREP
--
-- Adds the personal-preparation data (warning signs, triggers,
-- if/then plans, reasons, commitments, "my why") that STOP and
-- Recovery draw on so they reflect the user's own words instead
-- of generic copy, plus append-only logs of Moment (STOP) and
-- Recovery sessions.
--
-- All of this is private-by-default: owner-only RLS, no partner
-- visibility. Accountability partners already see urge_logs /
-- streaks / journal via existing policies -- PREP content (what
-- makes someone vulnerable, their reasons, their plan) stays with
-- the owner unless a future pass decides otherwise.
-- =========================================================

-- ---------------------------------------------------------
-- PREP: simple label lists
-- ---------------------------------------------------------

create table public.warning_signs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  label      text not null,
  created_at timestamptz not null default now()
);

create table public.personal_triggers (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  label      text not null,
  created_at timestamptz not null default now()
);

create table public.prep_reasons (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  label      text not null,
  created_at timestamptz not null default now()
);

create table public.prep_commitments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  label      text not null,
  created_at timestamptz not null default now()
);

-- "When [warning sign / trigger], I'm going to [concrete action]."
create table public.prep_plans (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  when_text  text not null,
  then_text  text not null,
  created_at timestamptz not null default now()
);

-- One row per user: the deeper "who I want to become" statement.
create table public.prep_why (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  body       text not null default '',
  updated_at timestamptz not null default now()
);

create index warning_signs_user_idx on public.warning_signs (user_id);
create index personal_triggers_user_idx on public.personal_triggers (user_id);
create index prep_reasons_user_idx on public.prep_reasons (user_id);
create index prep_commitments_user_idx on public.prep_commitments (user_id);
create index prep_plans_user_idx on public.prep_plans (user_id);

-- ---------------------------------------------------------
-- The Moment: STOP sessions
-- ---------------------------------------------------------

create table public.moment_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  feeling           text,
  action_chosen     text,
  contacted_partner boolean not null default false,
  started_at        timestamptz not null default now(),
  completed_at      timestamptz
);

create index moment_sessions_user_idx on public.moment_sessions (user_id, started_at desc);

-- ---------------------------------------------------------
-- Recovery sessions (after a fall / difficult moment)
-- ---------------------------------------------------------

create table public.recovery_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  what_happened     text,
  feelings          text,
  before_context    text,
  learning          text,
  contacted_partner boolean not null default false,
  next_action       text,
  created_at        timestamptz not null default now()
);

create index recovery_sessions_user_idx on public.recovery_sessions (user_id, created_at desc);

-- ---------------------------------------------------------
-- Row Level Security -- owner-only on everything in this file
-- ---------------------------------------------------------

alter table public.warning_signs enable row level security;
alter table public.personal_triggers enable row level security;
alter table public.prep_reasons enable row level security;
alter table public.prep_commitments enable row level security;
alter table public.prep_plans enable row level security;
alter table public.prep_why enable row level security;
alter table public.moment_sessions enable row level security;
alter table public.recovery_sessions enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'warning_signs', 'personal_triggers', 'prep_reasons',
    'prep_commitments', 'prep_plans', 'prep_why',
    'moment_sessions', 'recovery_sessions'
  ]
  loop
    execute format(
      'create policy "owner full access" on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());',
      t
    );
  end loop;
end $$;
