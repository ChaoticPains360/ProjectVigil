import { supabase } from '../supabaseClient'
import { computeStreak } from './streak'

// Shared by OwnerDashboard and the Urge Toolkit page. Inserts the log
// row, recomputes + persists the streak from full history, and makes
// a best-effort call to notify any linked partners (per the owner's
// partner_notify_pref) -- notification failure never blocks logging.
export async function logUrge(userId, { trigger, outcome }) {
  const { error: insertErr } = await supabase.from('urge_logs').insert({
    user_id: userId,
    trigger: trigger || null,
    outcome,
  })
  if (insertErr) throw insertErr

  const { data: allLogs, error: allErr } = await supabase
    .from('urge_logs')
    .select('ts, outcome')
    .eq('user_id', userId)
  if (allErr) throw allErr

  const { streak, lastGoodDay } = computeStreak(allLogs)
  const { error: upsertErr } = await supabase
    .from('streaks')
    .upsert({ user_id: userId, streak, last_good_day: lastGoodDay })
  if (upsertErr) throw upsertErr

  supabase.functions.invoke('notify-partners', { body: { outcome } }).catch(() => {})
}
