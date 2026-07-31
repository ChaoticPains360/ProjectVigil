import { supabase } from '../supabaseClient'
import { logUrge } from './urgeActions'

// Recovery: fall/difficult_moment -> reflection -> learning -> connection -> next_action -> returned
export const RECOVERY_NEXT_ACTIONS = [
  'Eat something',
  'Go to class or work',
  'Go to Mass',
  'Call a friend',
  'Go outside',
  'Take a shower',
  'Go to bed',
  'Continue the day',
]

export async function saveRecoverySession(userId, {
  whatHappened,
  feelings,
  beforeContext,
  learning,
  contactedPartner,
  nextAction,
}) {
  const { error: insertErr } = await supabase.from('recovery_sessions').insert({
    user_id: userId,
    what_happened: whatHappened || null,
    feelings: feelings || null,
    before_context: beforeContext || null,
    learning: learning || null,
    contacted_partner: !!contactedPartner,
    next_action: nextAction || null,
  })
  if (insertErr) throw insertErr

  // Keeps the existing streak/history model (partner visibility, patterns)
  // intact -- a fall is still one entry in the log, not a separate system.
  await logUrge(userId, { trigger: beforeContext || null, outcome: 'slip' })
}

// A light pattern echo: does today's context match recent falls?
// Kept intentionally simple -- this is reflection, not analytics.
export async function findSimilarPastContext(userId, beforeContext) {
  if (!beforeContext?.trim()) return null
  const { data } = await supabase
    .from('recovery_sessions')
    .select('before_context, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  const words = beforeContext.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  if (!data || words.length === 0) return null

  const match = data.find((row) => {
    if (!row.before_context) return false
    const text = row.before_context.toLowerCase()
    return words.some((w) => text.includes(w))
  })
  return match ?? null
}
