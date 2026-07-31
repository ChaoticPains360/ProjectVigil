import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { saveRecoverySession, findSimilarPastContext, RECOVERY_NEXT_ACTIONS } from '../lib/recovery'

const easeSoft = [0.16, 1, 0.3, 1]

const STEPS = ['what', 'feelings', 'before', 'learn', 'connect', 'next', 'done']

export default function RecoveryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [partner, setPartner] = useState(null)
  const [similar, setSimilar] = useState(null)

  const [whatHappened, setWhatHappened] = useState('')
  const [feelings, setFeelings] = useState('')
  const [beforeContext, setBeforeContext] = useState('')
  const [learning, setLearning] = useState('')
  const [contactedPartner, setContactedPartner] = useState(false)
  const [nextAction, setNextAction] = useState(null)

  const step = STEPS[stepIndex]

  useEffect(() => {
    supabase
      .from('partner_links')
      .select('*, partner:profiles!partner_links_partner_id_fkey(display_name)')
      .eq('owner_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPartner(data?.partner ?? null))
  }, [user.id])

  function goNext() {
    if (step === 'before') {
      findSimilarPastContext(user.id, beforeContext).then(setSimilar)
    }
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
  }

  async function finish(action) {
    setNextAction(action)
    setBusy(true)
    setError(null)
    try {
      await saveRecoverySession(user.id, {
        whatHappened,
        feelings,
        beforeContext,
        learning,
        contactedPartner,
        nextAction: action,
      })
      setStepIndex(STEPS.length - 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="recovery-shell">
      {/* No mode="wait": Recovery must never stall waiting on an exit
          animation before the next step can render. */}
      <AnimatePresence>
        {step === 'what' && (
          <motion.div
            key="what"
            className="recovery-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: easeSoft }}
          >
            <p className="recovery-eyebrow">Come back</p>
            <h1 className="recovery-title">You're here. That's what matters.</h1>
            <p className="recovery-sub">
              This moment doesn't erase the ground you've already gained. Let's understand it,
              together, and then get back to your life.
            </p>
            <label>
              What happened?
              <textarea
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value)}
                placeholder="A few honest sentences is enough."
              />
            </label>
            <button className="recovery-next-btn" onClick={goNext}>
              Continue
            </button>
          </motion.div>
        )}

        {step === 'feelings' && (
          <motion.div
            key="feelings"
            className="recovery-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: easeSoft }}
          >
            <p className="recovery-eyebrow">Step 2</p>
            <h2 className="recovery-question">What were you feeling?</h2>
            <label>
              <textarea
                value={feelings}
                onChange={(e) => setFeelings(e.target.value)}
                placeholder="Lonely, numb, anxious, restless..."
              />
            </label>
            <button className="recovery-next-btn" onClick={goNext}>
              Continue
            </button>
          </motion.div>
        )}

        {step === 'before' && (
          <motion.div
            key="before"
            className="recovery-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: easeSoft }}
          >
            <p className="recovery-eyebrow">Step 3</p>
            <h2 className="recovery-question">What happened immediately beforehand?</h2>
            <p className="recovery-sub">Where were you? What time was it? What led up to it?</p>
            <label>
              <textarea
                value={beforeContext}
                onChange={(e) => setBeforeContext(e.target.value)}
                placeholder="Alone, tired, scrolling late at night..."
              />
            </label>
            <button className="recovery-next-btn" onClick={goNext}>
              Continue
            </button>
          </motion.div>
        )}

        {step === 'learn' && (
          <motion.div
            key="learn"
            className="recovery-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: easeSoft }}
          >
            <p className="recovery-eyebrow">Step 4</p>
            <h2 className="recovery-question">What can you learn?</h2>
            {similar && (
              <p className="recovery-pattern-note">
                This looks similar to something you described before — worth noticing, not
                judging.
              </p>
            )}
            <label>
              <textarea
                value={learning}
                onChange={(e) => setLearning(e.target.value)}
                placeholder="What would help next time?"
              />
            </label>
            <button className="recovery-next-btn" onClick={goNext}>
              Continue
            </button>
          </motion.div>
        )}

        {step === 'connect' && (
          <motion.div
            key="connect"
            className="recovery-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: easeSoft }}
          >
            <p className="recovery-eyebrow">Step 5</p>
            <h2 className="recovery-question">Do you need to reach out to someone?</h2>
            <p className="recovery-sub">Freedom isn't meant to be carried alone.</p>
            {partner ? (
              <motion.button
                type="button"
                className={`recovery-choice${contactedPartner ? ' selected' : ''}`}
                whileTap={{ scale: 0.97 }}
                onClick={() => setContactedPartner((v) => !v)}
              >
                {contactedPartner ? `Reaching out to ${partner.display_name}` : `Contact ${partner.display_name}`}
              </motion.button>
            ) : (
              <p className="muted">
                No accountability partner linked yet. <Link to="/people">Add one</Link> when you're ready.
              </p>
            )}
            <button className="recovery-next-btn" onClick={goNext}>
              Continue
            </button>
          </motion.div>
        )}

        {step === 'next' && (
          <motion.div
            key="next"
            className="recovery-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: easeSoft }}
          >
            <p className="recovery-eyebrow">Step 6</p>
            <h2 className="recovery-question">What's one thing you're going to do next?</h2>
            <div className="stop-choice-grid">
              {RECOVERY_NEXT_ACTIONS.map((a) => (
                <motion.button
                  key={a}
                  type="button"
                  className="stop-choice"
                  disabled={busy}
                  whileHover={{ scale: busy ? 1 : 1.03 }}
                  whileTap={{ scale: busy ? 1 : 0.96 }}
                  onClick={() => finish(a)}
                >
                  {a}
                </motion.button>
              ))}
            </div>
            {error && <p className="error">{error}</p>}
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div
            key="done"
            className="recovery-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: easeSoft }}
          >
            <p className="recovery-eyebrow">{nextAction}.</p>
            <h2 className="recovery-title">Learn. Reconnect. Reset. Return to life.</h2>
            <p className="recovery-sub">
              This didn't undo who you're becoming. Go live the rest of your day.
            </p>
            <Link to="/" className="stop-primary-btn" onClick={() => navigate('/')} style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
              Back to Vigil
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
