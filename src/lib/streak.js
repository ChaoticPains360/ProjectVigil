// Recomputes streak state from the full urge_logs history for a user.
// Kept client-side (matching the original localStorage app's logic
// living entirely in JS) rather than as a DB trigger, so it's easy
// to tune without a migration.
export function computeStreak(logs) {
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const sorted = [...logs].sort((a, b) => new Date(b.ts) - new Date(a.ts))
  const lastSlip = sorted.find((l) => l.outcome === 'slip')

  const streakStart = lastSlip
    ? new Date(lastSlip.ts)
    : sorted.length
      ? new Date(sorted[sorted.length - 1].ts)
      : today

  const days = Math.max(
    Math.floor((today.getTime() - streakStart.getTime()) / 86400000),
    0
  )

  return { streak: days, lastGoodDay: todayStr }
}
