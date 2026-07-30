// Invoked on a schedule (same cron pattern as nightly-reminders --
// see that function's comments for setup). For every profile with
// at least one journal reminder slot enabled, checks whether it's
// at-or-past that slot's time in the user's own timezone AND that
// slot hasn't already fired today, then sends a push and records
// the slot in journal_reminded_on so it only fires once per slot
// per local calendar day.
//
// Deploy: supabase functions deploy journal-reminders --no-verify-jwt
// Secrets required (same as the other push functions):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const SLOTS = [
  { key: 'morning', time: '09:00', column: 'journal_remind_morning' },
  { key: 'midday', time: '13:00', column: 'journal_remind_midday' },
  { key: 'evening', time: '20:00', column: 'journal_remind_evening' },
] as const

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
    .select(
      'id, reminder_timezone, journal_remind_morning, journal_remind_midday, journal_remind_evening, journal_reminded_on'
    )
    .or('journal_remind_morning.eq.true,journal_remind_midday.eq.true,journal_remind_evening.eq.true')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const now = new Date()
  let sentCount = 0

  for (const profile of profiles ?? []) {
    const { date: localDate, time: localTime } = localDateAndTime(
      now,
      profile.reminder_timezone || 'UTC'
    )

    const trackedToday =
      profile.journal_reminded_on?.date === localDate ? profile.journal_reminded_on.slots ?? [] : []

    const slotsToSend = SLOTS.filter(
      (slot) =>
        profile[slot.column] && !trackedToday.includes(slot.key) && localTime >= slot.time
    )

    if (slotsToSend.length === 0) continue

    const { data: subs } = await admin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', profile.id)

    const payload = JSON.stringify({
      title: 'Vigil',
      body: "How are you feeling? Take a minute to check in.",
      url: '/journal',
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

    const updatedSlots = [...trackedToday, ...slotsToSend.map((s) => s.key)]
    await admin
      .from('profiles')
      .update({ journal_reminded_on: { date: localDate, slots: updatedSlots } })
      .eq('id', profile.id)

    sentCount++
  }

  return new Response(JSON.stringify({ reminded: sentCount }), { status: 200 })
})
