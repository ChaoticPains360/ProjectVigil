import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { startMomentSession, completeMomentSession, FEELINGS, DEFAULT_ACTIONS } from '../lib/moment'

const easeSoft = [0.16, 1, 0.3, 1]

export default function StopPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('stop')
  const [session, setSession] = useState(null)
  const [feeling, setFeeling] = useState(null)
  const [action, setAction] = useState(null)
  const [partner, setPartner] = useState(null)
  const [contactedPartner, setContactedPartner] = useState(false)

  useEffect(() => {
    startMomentSession(user.id).then(setSession).catch(() => {})
    supabase
      .from('partner_links')
      .select('*, partner:profiles!partner_links_partner_id_fkey(display_name)')
      .eq('owner_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPartner(data?.partner ?? null))
  }, [user.id])

  function chooseFeeling(f) {
    setFeeling(f)
    setStep('action')
  }

  async function chooseAction(a) {
    setAction(a)
    setStep('done')
    if (session) {
      try {
        await completeMomentSession(user.id, session.id, {
          feeling: feeling?.label ?? null,
          actionChosen: a,
          contactedPartner,
        })
      } catch {
        // Best-effort. The user's next step in real life matters more
        // than this write succeeding.
      }
    }
  }

  return (
    <div className="stop-shell">
      {/* No mode="wait" here on purpose: STOP must never be stuck waiting on
          an exit animation to finish before the next step can appear. */}
      <AnimatePresence>
        {step === 'stop' && (
          <motion.div
            key="stop"
            className="stop-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: easeSoft }}
          >
            <p className="stop-eyebrow">The Moment</p>
            <h1 className="stop-word">Stop.</h1>
            <ul className="stop-instructions">
              <li>Put the phone down.</li>
              <li>Breathe.</li>
              <li>Stand up.</li>
              <li>Leave the room.</li>
            </ul>
            <motion.button
              className="stop-primary-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep('feeling')}
            >
              I'm here
            </motion.button>
            <Link to="/" className="stop-quiet-link">
              I'm okay now
            </Link>
            <Link to="/toolkit" className="stop-quiet-link stop-quiet-link-secondary">
              Need more time? Breathing &amp; delay timer
            </Link>
          </motion.div>
        )}

        {step === 'feeling' && (
          <motion.div
            key="feeling"
            className="stop-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: easeSoft }}
          >
            <p className="stop-eyebrow">Step 2</p>
            <h2 className="stop-question">What's happening right now?</h2>
            <div className="stop-choice-grid">
              {FEELINGS.map((f) => (
                <motion.button
                  key={f.key}
                  className="stop-choice"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => chooseFeeling(f)}
                >
                  {f.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'action' && (
          <motion.div
            key="action"
            className="stop-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: easeSoft }}
          >
            <p className="stop-eyebrow">Step 3</p>
            <h2 className="stop-question">What's one thing you can do for the next 10 minutes?</h2>
            <div className="stop-choice-grid">
              {DEFAULT_ACTIONS.map((a) => (
                <motion.button
                  key={a}
                  className="stop-choice"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => chooseAction(a)}
                >
                  {a}
                </motion.button>
              ))}
              {partner && (
                <motion.button
                  key="contact-partner"
                  className="stop-choice stop-choice-accent"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setContactedPartner(true)
                    chooseAction(`Contact ${partner.display_name}`)
                  }}
                >
                  Contact {partner.display_name}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div
            key="done"
            className="stop-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: easeSoft }}
          >
            <p className="stop-eyebrow">You have what you need</p>
            <h2 className="stop-question">{action}.</h2>
            <p className="stop-closing">
              You don't need to solve your whole life right now. Just take the next step.
            </p>
            <p className="stop-closing-strong">Go. Do the next thing.</p>
            <Link to="/" className="stop-quiet-link" onClick={() => navigate('/')}>
              Back to Vigil, later
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
