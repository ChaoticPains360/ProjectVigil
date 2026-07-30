-- =========================================================
-- VIGIL: journal sharing + multi-emotion migration
-- Run AFTER 003_journal.sql.
--
-- Two changes, both explicitly requested by the app owner:
--  1. Journal entries become visible to ACTIVE accountability
--     partners, same visibility model as urge_logs/streaks (this
--     reverses the "private by default" choice from 003_journal.sql
--     -- flagged and confirmed with the owner before this migration
--     was written).
--  2. A journal entry can carry up to 3 emotion tags instead of 1.
-- =========================================================

-- --- emotion -> emotions[] --------------------------------
alter table public.journal_entries
  add column emotions text[] not null default '{}';

update public.journal_entries
  set emotions = case when emotion is not null then array[emotion] else '{}' end;

alter table public.journal_entries
  drop column emotion;

alter table public.journal_entries
  add constraint journal_entries_emotions_max_three
  check (array_length(emotions, 1) is null or array_length(emotions, 1) <= 3);

-- --- partner read access -----------------------------------
create policy "partner can read linked user's journal_entries"
  on public.journal_entries for select
  to authenticated
  using (
    exists (
      select 1 from public.partner_links pl
      where pl.owner_id = journal_entries.user_id
        and pl.partner_id = auth.uid()
        and pl.status = 'active'
    )
  );
