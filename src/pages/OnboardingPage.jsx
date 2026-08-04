import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const easeSoft = [0.16, 1, 0.3, 1]

const SLIDES = [
  {
    eyebrow: 'Welcome to Vigil',
    title: "This isn't about never slipping again.",
    body: "It's about becoming the kind of person who doesn't need the crutch. Reveal the root. Restore the person. Strengthen the life.",
  },
  {
    eyebrow: 'When it’s hard, right now',
    title: 'The Moment',
    body: 'Prepare before temptation builds. Stop and regain agency while it’s happening. Recover and return to life afterward — without shame.',
    note: 'Stop is always one tap away, top-left, wherever you are in the app.',
  },
  {
    eyebrow: 'The long road to freedom',
    title: 'The Journey',
    body: 'Reveal what’s underneath. Restore the life around the struggle. Strengthen what you’ve built — there’s no finish line.',
    note: 'Swipe right from Home, anytime, to see where you are.',
  },
  {
    eyebrow: 'One step at a time',
    title: "You don't have to fix everything today.",
    body: 'Start with one small thing. Vigil will be here — quietly, not loudly — as you go.',
  },
]

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1

  async function finish() {
    setBusy(true)
    try {
      await supabase
        .from('profiles')
        .update({ onboarded_at: new Date().toISOString() })
        .eq('id', user.id)
      await refreshProfile()
    } catch {
      // Even if this write fails, don't trap the user on onboarding forever.
    } finally {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="onboarding-shell">
      <button type="button" className="onboarding-skip" onClick={finish} disabled={busy}>
        Skip
      </button>

      <motion.div
        key={index}
        className="onboarding-panel"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeSoft }}
      >
        <p className="scene-eyebrow">{slide.eyebrow}</p>
        <h1 className="onboarding-title">{slide.title}</h1>
        <p className="onboarding-body">{slide.body}</p>
        {slide.note && <p className="onboarding-note">{slide.note}</p>}
      </motion.div>

      <div className="onboarding-footer">
        <div className="onboarding-dots" role="presentation">
          {SLIDES.map((s, i) => (
            <span key={s.title} className={`onboarding-dot${i === index ? ' active' : ''}`} />
          ))}
        </div>
        <motion.button
          type="button"
          className="stop-primary-btn"
          whileHover={{ scale: busy ? 1 : 1.02 }}
          whileTap={{ scale: busy ? 1 : 0.97 }}
          disabled={busy}
          onClick={() => (isLast ? finish() : setIndex((i) => i + 1))}
        >
          {isLast ? 'Get started' : 'Continue'}
        </motion.button>
      </div>
    </div>
  )
}
