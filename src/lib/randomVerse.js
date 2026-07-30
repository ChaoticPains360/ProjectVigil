import { VERSES } from '../data/verses'

// Uniformly random pick from VERSES restricted to `refs` -- unlike
// verseOfTheDay() this intentionally re-rolls on every call, for
// pages that want a fresh verse per visit rather than per day.
export function randomVerseFrom(refs) {
  const pool = VERSES.filter((v) => refs.includes(v.reference))
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}
