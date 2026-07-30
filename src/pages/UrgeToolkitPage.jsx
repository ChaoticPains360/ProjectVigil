import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { logUrge } from '../lib/urgeActions'

const easeSoft = [0.16, 1, 0.3, 1]

const HALT_ITEMS = [
  { key: 'hungry', label: 'Hungry', hint: 'Eat something, even something small.' },
  { key: 'angry', label: 'Angry', hint: 'Name what you’re actually upset about.' },
  { key: 'lonely', label: 'Lonely', hint: 'Reach out to someone — even a text helps.' },
  { key: 'tired', label: 'Tired', hint: 'Rest counts as progress. Consider lying down.' },
]

const QUICK_ACTIONS = [
  'Call or text your accountability partner',
  'Take a 5–10 minute walk',
  'Splash cold water on your face',
  'Do 10 push-ups or jumping jacks',
  'Physically leave the room or location',
  'Write down what triggered this (below)',
]

const BREATH_PHASES = [
  { phase: 'Breathe in', seconds: 4, scale: 1.4 },
  { phase: 'Hold', seconds: 4, scale: 1.4 },
  { phase: 'Breathe out', seconds: 8, scale: 1 },
]

const TOTAL_TIMER_SECONDS = 10 * 60

function useCountdown(initialSeconds) {
  const [secondsLeft, setSecondsLeft] = useState(null)
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [secondsLeft])

  return {
    secondsLeft,
    running: secondsLeft !== null && secondsLeft > 0,
    start: () => setSecondsLeft(initialSeconds),
    stop: () => setSecondsLeft(null),
  }
}

function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function CountdownRing({ secondsLeft, total }) {
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const progress = secondsLeft / total
  const offset = circumference * (1 - progress)

  return (
    <div className="ring-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.6, ease: 'linear' }}
          transform="rotate(-90 70 70)"
        />
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fdba74" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <span className="ring-label">{formatMMSS(secondsLeft)}</span>
    </div>
  )
}

function BreathingGuide() {
  const [active, setActive] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [cycle, setCycle] = useState(0)
  const totalCycles = 4
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const current = BREATH_PHASES[phaseIndex]
    timeoutRef.current = setTimeout(() => {
      if (phaseIndex === BREATH_PHASES.length - 1) {
        if (cycle + 1 >= totalCycles) {
          setActive(false)
          setPhaseIndex(0)
          setCycle(0)
          return
        }
        setCycle((c) => c + 1)
        setPhaseIndex(0)
      } else {
        setPhaseIndex((i) => i + 1)
      }
    }, current.seconds * 1000)
    return () => clearTimeout(timeoutRef.current)
  }, [active, phaseIndex, cycle])

  const phase = BREATH_PHASES[phaseIndex]

  function stop() {
    setActive(false)
    setPhaseIndex(0)
    setCycle(0)
  }

  return (
    <div className="breathing-guide-card">
      <div className="breath-circle-wrap">
        <motion.div
          className="breath-circle"
          animate={{ scale: active ? phase.scale : 1 }}
          transition={{ duration: active ? phase.seconds : 0.6, ease: 'easeInOut' }}
        />
      </div>
      {active ? (
        <>
          <p className="breath-phase">{phase.phase}...</p>
          <p className="muted">
            Cycle {cycle + 1} of {totalCycles}
          </p>
          <button className="link-button" onClick={stop}>
            Stop
          </button>
        </>
      ) : (
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setActive(true)}>
          Start 4-4-8 breathing
        </motion.button>
      )}
    </div>
  )
}

export default function UrgeToolkitPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [halt, setHalt] = useState({})
  const [trigger, setTrigger] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const timer = useCountdown(TOTAL_TIMER_SECONDS)

  async function handleLog(outcome) {
    setBusy(true)
    setError(null)
    try {
      await logUrge(user.id, { trigger, outcome })
      navigate(outcome === 'slip' ? '/slipped' : '/resisted')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const sections = [
    <motion.section
      key="intro"
      className="toolkit-intro"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeSoft }}
    >
      <h2>You're having an urge. That's okay.</h2>
      <p>
        Most urges peak and fade within 15–30 minutes if you don't act on them. You don't
        have to win the whole day — just the next ten minutes.
      </p>
    </motion.section>,

    <motion.section
      key="halt"
      className="halt-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05, ease: easeSoft }}
    >
      <h3>Quick check: HALT</h3>
      <p className="muted">Are you...</p>
      <ul className="halt-list">
        {HALT_ITEMS.map((item) => (
          <li key={item.key}>
            <label className="halt-item">
              <input
                type="checkbox"
                checked={!!halt[item.key]}
                onChange={(e) => setHalt({ ...halt, [item.key]: e.target.checked })}
              />
              {item.label}
            </label>
            {halt[item.key] && <p className="muted halt-hint">{item.hint}</p>}
          </li>
        ))}
      </ul>
    </motion.section>,

    <motion.section
      key="timer"
      className="delay-timer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: easeSoft }}
    >
      <h3>Delay 10 minutes</h3>
      {timer.running ? (
        <>
          <CountdownRing secondsLeft={timer.secondsLeft} total={TOTAL_TIMER_SECONDS} />
          <button className="link-button" onClick={timer.stop}>
            Cancel
          </button>
        </>
      ) : (
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={timer.start}>
          Start 10-minute timer
        </motion.button>
      )}
    </motion.section>,

    <motion.section
      key="breathe"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: easeSoft }}
    >
      <h3>Breathe</h3>
      <BreathingGuide />
    </motion.section>,

    <motion.section
      key="actions"
      className="quick-actions-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: easeSoft }}
    >
      <h3>Do something else</h3>
      <ul>
        {QUICK_ACTIONS.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ul>
    </motion.section>,

    <motion.section
      key="log"
      className="log-urge-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: easeSoft }}
    >
      <h3>Ready to log this?</h3>
      <input
        placeholder="What triggered this? (optional)"
        value={trigger}
        onChange={(e) => setTrigger(e.target.value)}
      />
      <div className="button-row">
        <motion.button
          disabled={busy}
          onClick={() => handleLog('resisted')}
          whileHover={{ scale: busy ? 1 : 1.03 }}
          whileTap={{ scale: busy ? 1 : 0.96 }}
        >
          I resisted
        </motion.button>
        <motion.button
          disabled={busy}
          className="danger"
          onClick={() => handleLog('slip')}
          whileHover={{ scale: busy ? 1 : 1.03 }}
          whileTap={{ scale: busy ? 1 : 0.96 }}
        >
          I slipped
        </motion.button>
      </div>
      {error && <p className="error">{error}</p>}
    </motion.section>,
  ]

  return <div className="page">{sections}</div>
}
