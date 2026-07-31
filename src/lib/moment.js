import { supabase } from '../supabaseClient'
import { logUrge } from './urgeActions'

// The Moment (STOP): idle -> struggling -> stop -> action_selected -> returned
export const MOMENT_STEPS = ['stop', 'feeling', 'action', 'done']

export const FEELINGS = [
  { key: 'bored', label: "I'm bored" },
  { key: 'stressed', label: "I'm stressed" },
  { key: 'lonely', label: "I'm lonely" },
  { key: 'angry', label: "I'm angry" },
  { key: 'anxious', label: "I'm anxious" },
  { key: 'tired', label: "I'm tired" },
  { key: 'tempted', label: "I'm tempted" },
  { key: 'unsure', label: "I don't know" },
]

export const DEFAULT_ACTIONS = [
  'Go outside',
  'Take a walk',
  'Do pushups',
  'Take a shower',
  'Pray',
  'Read something',
  'Go sit with someone',
]

export async function startMomentSession(userId) {
  const { data, error } = await supabase
    .from('moment_sessions')
    .insert({ user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function completeMomentSession(userId, sessionId, { feeling, actionChosen, contactedPartner }) {
  const { error } = await supabase
    .from('moment_sessions')
    .update({
      feeling,
      action_chosen: actionChosen,
      contacted_partner: !!contactedPartner,
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
  if (error) throw error

  // A completed STOP session is, by definition, a resisted moment --
  // it feeds the same history the Journey uses for pattern reflection.
  await logUrge(userId, { trigger: feeling || null, outcome: 'resisted' }).catch(() => {})
}
