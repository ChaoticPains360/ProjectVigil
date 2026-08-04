-- Restore: practices across the SPIES categories (Social, Physical,
-- Intellectual, Emotional, Spiritual). Deliberately simple -- a label
-- and a "why", no scheduling engine. The philosophy is "build a life
-- you want to live," not another productivity tracker with due dates.
create table public.practices (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  category   text not null check (category in ('social', 'physical', 'intellectual', 'emotional', 'spiritual')),
  label      text not null,
  why        text,
  created_at timestamptz not null default now()
);

create index practices_user_idx on public.practices (user_id);

alter table public.practices enable row level security;

create policy "owner full access"
  on public.practices for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
