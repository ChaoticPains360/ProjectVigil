import { VERSES } from '../data/verses'

// Deterministic per local calendar day, so the verse stays put across
// reloads/re-visits within the same day rather than jumping around.
export function verseOfTheDay(date = new Date()) {
  const dateStr = date.toLocaleDateString('en-CA') // YYYY-MM-DD, local time
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0
  }
  return VERSES[hash % VERSES.length]
}
