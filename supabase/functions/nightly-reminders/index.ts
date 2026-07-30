// Invoked on a schedule (see deployment notes below), not by the
// client. For every profile with a reminder_time set, checks
// whether it's currently at-or-past that time in the user's own
// timezone AND they haven't already been reminded today, then
// sends a push and stamps last_reminded_on so it only fires once
// per local calendar day no matter how often the cron polls.
//
// Deploy: supabase functions deploy nightly-reminders --no-verify-jwt
// Schedule (run every 15 min is a reasonable default) via Supabase's
// Cron Jobs (Dashboard -> Database -> Cron Jobs, or pg_cron + pg_net
// calling this function's URL with the service role key as a bearer
// token so verify-jwt isn't needed for a user, and setting the
// `--no-verify-jwt` flag above lets the cron caller in).
// Secrets required (same as notify-partners):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

function localDateAndTime(now: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value])
  )
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  }
}

Deno.serve(async () => {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, reminder_time, reminder_timezone, last_reminded_on')
    .not('reminder_time', 'is', null)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const now = new Date()
  let remindedCount = 0

  for (const profile of profiles ?? []) {
    const { date: localDate, time: localTime } = localDateAndTime(
      now,
      profile.reminder_timezone || 'UTC'
    )

    if (profile.last_reminded_on === localDate) continue
    if (localTime < profile.reminder_time.slice(0, 5)) continue

    const { data: subs } = await admin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', profile.id)

    const payload = JSON.stringify({
      title: 'Vigil',
      body: 'Time for your nightly check-in.',
      url: '/',
    })

    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await admin.from('push_subscriptions').delete().eq('id', sub.id)
        }
      }
    }

    await admin.from('profiles').update({ last_reminded_on: localDate }).eq('id', profile.id)
    remindedCount++
  }

  return new Response(JSON.stringify({ reminded: remindedCount }), { status: 200 })
})
