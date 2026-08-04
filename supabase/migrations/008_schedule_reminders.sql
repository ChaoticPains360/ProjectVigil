-- Schedules the nightly-reminders and journal-reminders Edge Functions
-- to actually run on their own, server-side, instead of requiring a
-- manual trigger. Both functions are deployed with --no-verify-jwt,
-- so no auth header is needed to invoke them; they check per-user
-- reminder times themselves and are safe to poll frequently.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'nightly-reminders-poll',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://ltghrqxvamwaypwmucil.supabase.co/functions/v1/nightly-reminders',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);

select cron.schedule(
  'journal-reminders-poll',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://ltghrqxvamwaypwmucil.supabase.co/functions/v1/journal-reminders',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
