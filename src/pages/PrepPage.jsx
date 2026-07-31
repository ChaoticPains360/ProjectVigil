import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  warningSigns,
  personalTriggers,
  prepReasons,
  prepCommitments,
  prepPlans,
  prepWhy,
} from '../lib/prep'

const easeSoft = [0.16, 1, 0.3, 1]

function LabelListSection({ title, hint, placeholder, store, userId }) {
  const [items, setItems] = useState([])
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    store.list(userId).then(setItems)
  }, [store, userId])

  useEffect(() => {
    load()
  }, [load])

  async function add() {
    if (!value.trim()) return
    setBusy(true)
    try {
      await store.add(userId, value)
      setValue('')
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function remove(id) {
    await store.remove(id)
    await load()
  }

  return (
    <motion.section
      className="card prep-section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeSoft }}
    >
      <h3>{title}</h3>
      <p className="muted">{hint}</p>
      <div className="prep-chip-wrap">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.span
              key={item.id}
              className="prep-chip"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: easeSoft }}
            >
              {item.label}
              <button type="button" className="prep-chip-remove" onClick={() => remove(item.id)} aria-label={`Remove ${item.label}`}>
                ×
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        {items.length === 0 && <p className="muted">Nothing added yet.</p>}
      </div>
      <div className="prep-add-row">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button type="button" disabled={busy || !value.trim()} onClick={add}>
          Add
        </button>
      </div>
    </motion.section>
  )
}

function PlanSection({ userId }) {
  const [plans, setPlans] = useState([])
  const [whenText, setWhenText] = useState('')
  const [thenText, setThenText] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    prepPlans.list(userId).then(setPlans)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  async function add() {
    if (!whenText.trim() || !thenText.trim()) return
    setBusy(true)
    try {
      await prepPlans.add(userId, whenText, thenText)
      setWhenText('')
      setThenText('')
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function remove(id) {
    await prepPlans.remove(id)
    await load()
  }

  return (
    <motion.section
      className="card prep-section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05, ease: easeSoft }}
    >
      <h3>My Plan</h3>
      <p className="muted">Specific beats vague. "When X happens, I'm going to do Y."</p>
      <div className="prep-plan-list">
        <AnimatePresence initial={false}>
          {plans.map((p) => (
            <motion.div
              key={p.id}
              className="prep-plan-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25, ease: easeSoft }}
            >
              <p>
                <strong>When</strong> {p.when_text}, <strong>I'm going to</strong> {p.then_text}.
              </p>
              <button type="button" className="link-button" onClick={() => remove(p.id)}>
                Remove
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {plans.length === 0 && <p className="muted">No plans yet — add your first below.</p>}
      </div>
      <label>
        When...
        <input value={whenText} onChange={(e) => setWhenText(e.target.value)} placeholder="I'm alone, tired, and scrolling at 11:30pm" />
      </label>
      <label>
        I'm going to...
        <input value={thenText} onChange={(e) => setThenText(e.target.value)} placeholder="Put my phone down, leave the room, and text John" />
      </label>
      <button type="button" disabled={busy || !whenText.trim() || !thenText.trim()} onClick={add}>
        Add plan
      </button>
    </motion.section>
  )
}

function WhySection({ userId }) {
  const [body, setBody] = useState('')
  const [saved, setSaved] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    prepWhy.get(userId).then((row) => setBody(row?.body ?? ''))
  }, [userId])

  async function save() {
    setBusy(true)
    try {
      await prepWhy.save(userId, body)
      setSaved(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.section
      className="card prep-section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: easeSoft }}
    >
      <h3>My Why</h3>
      <p className="muted">Not the behavior you're avoiding — the person you're becoming.</p>
      <textarea
        value={body}
        onChange={(e) => {
          setBody(e.target.value)
          setSaved(false)
        }}
        placeholder="I want to become someone who..."
      />
      <button type="button" disabled={busy || saved} onClick={save}>
        {saved ? 'Saved' : 'Save'}
      </button>
    </motion.section>
  )
}

export default function PrepPage() {
  const { user } = useAuth()

  return (
    <div className="page">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeSoft }}
      >
        <p className="scene-eyebrow">Prepare</p>
        <h1>What am I going to do instead?</h1>
        <p className="muted">
          Build this when you're steady, so it's ready when you're not. Everything here is
          private to you.
        </p>
      </motion.section>

      <LabelListSection
        title="My Warning Signs"
        hint="What tells you vulnerability is increasing?"
        placeholder="Staying up too late"
        store={warningSigns}
        userId={user.id}
      />
      <LabelListSection
        title="My Triggers"
        hint="Situations that commonly lead toward temptation."
        placeholder="Boredom after school"
        store={personalTriggers}
        userId={user.id}
      />
      <PlanSection userId={user.id} />
      <LabelListSection
        title="My Reasons"
        hint="Why you want this freedom."
        placeholder="To be fully present with my family"
        store={prepReasons}
        userId={user.id}
      />
      <LabelListSection
        title="My Commitments"
        hint="Specific practices you've chosen."
        placeholder="Phone stays outside the bedroom"
        store={prepCommitments}
        userId={user.id}
      />
      <WhySection userId={user.id} />

      <motion.section
        className="card prep-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: easeSoft }}
      >
        <h3>My People</h3>
        <p className="muted">Accountability partners you can reach out to.</p>
        <Link to="/people" className="button-link secondary">
          Manage my people
        </Link>
      </motion.section>
    </div>
  )
}
