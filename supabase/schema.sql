-- =========================================================
-- VIGIL: Supabase schema (Postgres)
-- Auth: relies on Supabase Auth (auth.users). No custom
-- passwords/accounts table -- auth.uid() is the source of truth.
--
-- This is a pornography-addiction recovery / accountability app.
-- "urge_logs" and "streaks" hold sensitive behavioral data, so
-- RLS here is intentionally conservative -- nothing is readable
-- by anyone other than its owner and their *actively* linked
-- accountability partner(s).
--
-- Layout: all tables are created first, then all RLS policies
-- are added afterward -- the profiles policy needs to reference
-- partner_links, and partner_links needs to reference profiles,
-- so table creation and policy creation can't be interleaved
-- table-by-table.
-- =========================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- Tables
-- ---------------------------------------------------------

-- 1. profiles
--    Minimal public-facing info about a user (display name).
--    Keyed 1:1 to auth.users.
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at   timestamptz not null default now()
);

-- 2. partner_links
--    Invite/accept flow between an "owner" (the person logging
--    urges) and a "partner" (accountability partner, read-only).
--
--    Lifecycle:
--      owner creates row: status='pending', partner_id=null,
--        invite_code=<random>
--      partner redeems the code via accept_invite() RPC:
--        status='active', partner_id=auth.uid()
--      either side can set status='revoked' to cut access
--
--    owner_id / partner_id reference public.profiles rather than
--    auth.users directly (profiles.id -> auth.users.id, created by
--    the trigger below). This is what lets PostgREST embed profiles
--    via a partner_links query (e.g.
--    `select=*,partner:profiles!partner_links_partner_id_fkey(...)`),
--    and the cascade chain (auth.users -> profiles -> partner_links)
--    still deletes cleanly.
create type public.partner_link_status as enum ('pending', 'active', 'revoked');

create table public.partner_links (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  partner_id   uuid references public.profiles(id) on delete cascade,
  invite_code  text not null unique default encode(gen_random_bytes(9), 'base64'),
  status       public.partner_link_status not null default 'pending',
  created_at   timestamptz not null default now(),
  accepted_at  timestamptz,

  constraint owner_partner_distinct check (partner_id is distinct from owner_id)
);

create index partner_links_owner_idx on public.partner_links (owner_id);
create index partner_links_partner_idx on public.partner_links (partner_id);

-- 3. urge_logs
--    Append-only event log. One row per urge event.
create table public.urge_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  ts         timestamptz not null default now(),
  trigger    text,
  outcome    text not null check (outcome in ('resisted', 'slip')),
  created_at timestamptz not null default now()
);

create index urge_logs_user_idx on public.urge_logs (user_id, ts desc);

-- 4. streaks
--    One row per user; current streak + last good day.
create table public.streaks (
  user_id       uuid primary key references public.profiles(id) on delete cascade,
  streak        integer not null default 0,
  last_good_day date,
  updated_at    timestamptz not null default now()
);


-- ---------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.partner_links enable row level security;
alter table public.urge_logs enable row level security;
alter table public.streaks enable row level security;

-- --- profiles ---
-- Visibility is deliberately narrow: a profile is readable only
-- by its owner, or by someone with an ACTIVE partner_link to that
-- owner (in either direction). A pending invite does NOT expose
-- the inviter's name -- the accept_invite RPC below is the only
-- way to redeem a code, and profile visibility only opens up once
-- the link is active.
create policy "profile visible to self or active partner"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1 from public.partner_links pl
      where pl.status = 'active'
        and (
          (pl.owner_id = auth.uid() and pl.partner_id = profiles.id)
          or (pl.partner_id = auth.uid() and pl.owner_id = profiles.id)
        )
    )
  );

create policy "users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- --- partner_links ---
-- Note: there is intentionally NO select policy exposing pending,
-- unclaimed rows to arbitrary authenticated users. Redeeming a
-- code goes through the security-definer accept_invite() RPC
-- instead, so a partner never needs direct SELECT access to a row
-- before it's theirs.
create policy "owner can view own partner_links"
  on public.partner_links for select
  to authenticated
  using (owner_id = auth.uid());

create policy "partner can view links they are party to"
  on public.partner_links for select
  to authenticated
  using (partner_id = auth.uid());

create policy "owner can create invite"
  on public.partner_links for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "owner can update own partner_links"
  on public.partner_links for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- A partner can revoke their own side of an active link.
-- (Accepting is handled exclusively via accept_invite() below,
-- not via a direct UPDATE policy, to keep pending rows opaque.)
create policy "partner can revoke own link"
  on public.partner_links for update
  to authenticated
  using (partner_id = auth.uid())
  with check (partner_id = auth.uid());

-- --- urge_logs ---
create policy "user can read own urge_logs"
  on public.urge_logs for select
  to authenticated
  using (user_id = auth.uid());

create policy "user can insert own urge_logs"
  on public.urge_logs for insert
  to authenticated
  with check (user_id = auth.uid());

-- Deliberately no UPDATE or DELETE policy -- the log is append-only.
-- RLS defaults to deny when no policy matches.

create policy "partner can read linked user's urge_logs"
  on public.urge_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.partner_links pl
      where pl.owner_id = urge_logs.user_id
        and pl.partner_id = auth.uid()
        and pl.status = 'active'
    )
  );

-- --- streaks ---
create policy "user can read own streak"
  on public.streaks for select
  to authenticated
  using (user_id = auth.uid());

create policy "user can insert own streak"
  on public.streaks for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "user can update own streak"
  on public.streaks for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "partner can read linked user's streak"
  on public.streaks for select
  to authenticated
  using (
    exists (
      select 1 from public.partner_links pl
      where pl.owner_id = streaks.user_id
        and pl.partner_id = auth.uid()
        and pl.status = 'active'
    )
  );


-- ---------------------------------------------------------
-- Functions
-- ---------------------------------------------------------

-- accept_invite RPC
-- Lets a partner redeem an invite code without needing a standing
-- SELECT policy on other people's pending rows. Returns the
-- now-active link row; the caller can then separately fetch the
-- owner's profile (now readable, since the link is active).
create or replace function public.accept_invite(code text)
returns public.partner_links
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.partner_links;
begin
  update public.partner_links
     set partner_id = auth.uid(),
         status = 'active',
         accepted_at = now()
   where invite_code = code
     and status = 'pending'
     and partner_id is null
     and owner_id <> auth.uid()
  returning * into result;

  if result.id is null then
    raise exception 'Invite not found or already used';
  end if;

  return result;
end;
$$;

revoke all on function public.accept_invite(text) from public;
grant execute on function public.accept_invite(text) to authenticated;

-- handle_new_user trigger
-- Auto-create a profiles row when someone signs up, using metadata
-- passed at signup (display_name) with a fallback.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ---------------------------------------------------------
-- Notes / TODOs
-- ---------------------------------------------------------
-- TODO(notifications): trigger point for push notifications goes
-- here -- e.g. an AFTER INSERT trigger on urge_logs that enqueues
-- a notification job for every active partner_links row where
-- owner_id = NEW.user_id, so the partner is notified when an urge
-- is logged or a slip happens. Left as a TODO per scope for this pass.
