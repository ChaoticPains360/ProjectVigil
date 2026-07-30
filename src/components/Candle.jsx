import AnimatedNumber from './AnimatedNumber'

const MILESTONES = [
  { days: 0, label: 'Just getting started' },
  { days: 3, label: 'Building momentum' },
  { days: 7, label: 'One week strong' },
  { days: 30, label: 'One month strong' },
  { days: 90, label: 'Three months strong' },
  { days: 365, label: 'One year strong' },
]

function currentMilestone(streak) {
  return [...MILESTONES].reverse().find((m) => streak >= m.days) ?? MILESTONES[0]
}

// A candle whose wax height grows (capped) with the streak, and
// whose flame flickers continuously via CSS. Meant to make "streak"
// feel like something tended and grown, not a scoreboard number.
export default function Candle({ streak = 0, size = 160 }) {
  const waxHeight = Math.min(30 + streak * 1.6, 92)
  const milestone = currentMilestone(streak)

  return (
    <div className="candle-wrap" style={{ width: size }}>
      <svg
        viewBox="0 0 100 140"
        width={size}
        height={size * 1.35}
        className="candle-svg"
        role="img"
        aria-label={`Candle representing a ${streak} day streak`}
      >
        <ellipse cx="50" cy="128" rx="26" ry="6" fill="rgba(0,0,0,0.35)" />

        <g className="candle-flame-group">
          <ellipse className="flame-glow" cx="50" cy="52" rx="26" ry="30" />
          <path
            className="flame-outer"
            d="M50 30c8 12 14 20 14 30a14 14 0 1 1-28 0c0-10 6-18 14-30z"
          />
          <path
            className="flame-inner"
            d="M50 44c4 6 7 10 7 15a7 7 0 1 1-14 0c0-5 3-9 7-15z"
          />
        </g>

        <rect x="4" y="4" width="1" height="1" opacity="0" />
        <line x1="50" y1="60" x2="50" y2="66" stroke="#4b2e0f" strokeWidth="2" />

        <rect
          x="32"
          y={128 - waxHeight}
          width="36"
          height={waxHeight}
          rx="6"
          fill="url(#waxGradient)"
        />
        <ellipse cx="50" cy={128 - waxHeight} rx="18" ry="5" fill="#fff7e8" opacity="0.5" />

        <defs>
          <linearGradient id="waxGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff1d6" />
            <stop offset="100%" stopColor="#f3c877" />
          </linearGradient>
        </defs>
      </svg>

      <AnimatedNumber value={streak} className="streak-number candle-count" />
      <p className="streak-label">{streak === 1 ? 'day' : 'days'}</p>
      <p className="candle-milestone muted">{milestone.label}</p>
    </div>
  )
}
