// Gentle, non-nagging check-in copy for the nightly reminder push.
// No streak numbers, no guilt, no exclamation points -- a quiet nod,
// not a notification demanding attention. Picked deterministically by
// day-of-year so the same person doesn't get the same line back to
// back, without needing any extra state to track "already used."

export const GENERAL_MESSAGES = [
  'How are you doing tonight?',
  'A quiet moment to check in with yourself.',
  'No pressure -- just noticing how today went.',
  'Whatever today held, you are still here.',
]

export const STAGE_MESSAGES: Record<string, string[]> = {
  reveal: [
    'What stood out today? Even one word is enough.',
    'Anything worth noticing before the day ends?',
  ],
  restore: [
    'How did today\'s practices go? No grade attached.',
    'Small and consistent still counts as real.',
  ],
  strengthen: [
    'Just a quiet check-in -- you do not need this every day anymore.',
    'Still here, still with you, whenever you need it.',
  ],
}

export function pickMessage(stage: string | null | undefined, dayOfYear: number) {
  const stageList = (stage && STAGE_MESSAGES[stage]) || []
  const pool = [...GENERAL_MESSAGES, ...stageList]
  return pool[dayOfYear % pool.length]
}
