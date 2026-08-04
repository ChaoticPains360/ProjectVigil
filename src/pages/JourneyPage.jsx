import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import SwipeShell from '../components/SwipeShell'
import { JOURNEY_STAGES } from '../lib/resources'

const easeSoft = [0.16, 1, 0.3, 1]

export default function JourneyPage() {
  const { user, profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeKey = searchParams.get('stage') || profile?.journey_stage || 'reveal'

  function selectStage(key) {
    setSearchParams({ stage: key })
    // Best-effort: lets the nightly reminder speak to whichever stage
    // someone is actually focused on. Never blocks the UI on this.
    supabase.from('profiles').update({ journey_stage: key }).eq('id', user.id).then(() => {})
  }

  return (
    <SwipeShell leftTo="/" className="page">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeSoft }}
      >
        <p className="scene-eyebrow">The Journey</p>
        <h1>Reveal the root. Restore the person. Strengthen the life.</h1>
        <p className="muted">Select a stage to see what it's for and what to do next there.</p>
      </motion.section>

      <div className="journey-timeline">
        <div className="journey-timeline-line" aria-hidden="true" />
        {JOURNEY_STAGES.map((stage, i) => {
          const active = stage.key === activeKey
          return (
            <motion.button
              key={stage.key}
              type="button"
              className={`journey-stage${active ? ' active' : ''}`}
              onClick={() => selectStage(stage.key)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.06, ease: easeSoft }}
            >
              <span className="journey-stage-dot" aria-hidden="true" />
              <span className="journey-stage-body">
                <span className="journey-stage-label">{stage.label}</span>
                <span className="journey-stage-tagline">{stage.tagline}</span>
                {active && <span className="journey-stage-goal">{stage.goal}</span>}
              </span>
            </motion.button>
          )
        })}
      </div>

      <p className="home-quiet-link">Swipe left, or use the menu, to go back home.</p>
    </SwipeShell>
  )
}
