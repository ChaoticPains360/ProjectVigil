import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import SwipeShell from '../components/SwipeShell'
import { JOURNEY_STAGES } from '../lib/resources'

const easeSoft = [0.16, 1, 0.3, 1]

export default function JourneyPage() {
  const { user, profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [pickerOpen, setPickerOpen] = useState(false)
  const activeKey = searchParams.get('stage') || profile?.journey_stage || 'reveal'
  const stage = JOURNEY_STAGES.find((s) => s.key === activeKey) ?? JOURNEY_STAGES[0]

  function selectStage(key) {
    setSearchParams({ stage: key })
    setPickerOpen(false)
    // Best-effort: lets the nightly reminder speak to whichever stage
    // someone is actually focused on. Never blocks the UI on this.
    supabase.from('profiles').update({ journey_stage: key }).eq('id', user.id).then(() => {})
  }

  return (
    <SwipeShell rightTo="/" className="page">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeSoft }}
      >
        <div className="journey-header-row">
          <p className="scene-eyebrow">The Journey</p>
          <button
            type="button"
            className="journey-change-stage-btn"
            onClick={() => setPickerOpen((v) => !v)}
          >
            {pickerOpen ? 'Cancel' : 'Change stage'}
          </button>
        </div>
        {!pickerOpen && <h1>Reveal the root. Restore the person. Strengthen the life.</h1>}
      </motion.section>

      {pickerOpen ? (
        <motion.div
          className="journey-picker"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeSoft }}
        >
          <p className="muted">Where are you right now? This is a focus, not a grade.</p>
          {JOURNEY_STAGES.map((s, i) => (
            <motion.button
              key={s.key}
              type="button"
              className={`journey-picker-item${s.key === activeKey ? ' active' : ''}`}
              onClick={() => selectStage(s.key)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: easeSoft }}
            >
              <span className="journey-stage-dot" aria-hidden="true" />
              <span className="journey-stage-body">
                <span className="journey-stage-label">{s.label}</span>
                <span className="journey-stage-tagline">{s.tagline}</span>
              </span>
            </motion.button>
          ))}
        </motion.div>
      ) : (
        <motion.section
          className="card journey-stage-detail"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: easeSoft }}
        >
          <p className="journey-stage-detail-eyebrow">Currently focused on</p>
          <h2 className="journey-stage-detail-label">{stage.label}</h2>
          <p className="journey-stage-detail-tagline">{stage.tagline}</p>
          <p className="journey-stage-detail-goal">{stage.goal}</p>

          <div className="home-action-list journey-stage-links">
            {stage.links.map((link) => (
              <Link key={link.label} to={link.to} className="home-action-row">
                <span>{link.label}</span>
                <span className="home-action-arrow">→</span>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      <p className="home-quiet-link">Swipe right, or use the menu, to go back home.</p>
    </SwipeShell>
  )
}
