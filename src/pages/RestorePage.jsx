import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { practices, SPIES_CATEGORIES } from '../lib/practices'

const easeSoft = [0.16, 1, 0.3, 1]

function CategorySection({ category, userId }) {
  const [items, setItems] = useState([])
  const [label, setLabel] = useState('')
  const [why, setWhy] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    practices.list(userId).then((all) => setItems(all.filter((p) => p.category === category.key)))
  }, [userId, category.key])

  useEffect(() => {
    load()
  }, [load])

  async function add() {
    if (!label.trim()) return
    setBusy(true)
    try {
      await practices.add(userId, category.key, label, why)
      setLabel('')
      setWhy('')
      setExpanded(false)
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function remove(id) {
    await practices.remove(id)
    await load()
  }

  return (
    <motion.section
      className="card prep-section"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeSoft }}
    >
      <h3>{category.label}</h3>
      <p className="muted">{category.hint}</p>

      <div className="practice-list">
        <AnimatePresence initial={false}>
          {items.map((p) => (
            <motion.div
              key={p.id}
              className="practice-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25, ease: easeSoft }}
            >
              <div>
                <p className="practice-label">{p.label}</p>
                {p.why && <p className="practice-why">{p.why}</p>}
              </div>
              <button type="button" className="link-button" onClick={() => remove(p.id)}>
                Remove
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && <p className="muted">Nothing here yet.</p>}
      </div>

      {expanded ? (
        <div className="practice-add-form">
          <label>
            Practice
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Dinner with family 3x/week" />
          </label>
          <label>
            Why it matters <span className="muted">(optional)</span>
            <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="So I'm actually present with the people I love" />
          </label>
          <div className="button-row">
            <button type="button" disabled={busy || !label.trim()} onClick={add}>
              Add
            </button>
            <button type="button" className="secondary" onClick={() => setExpanded(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="secondary" onClick={() => setExpanded(true)}>
          + Add a practice
        </button>
      )}
    </motion.section>
  )
}

export default function RestorePage() {
  const { user } = useAuth()

  return (
    <div className="page">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeSoft }}
      >
        <p className="scene-eyebrow">Restore</p>
        <h1>Build a life you want to live.</h1>
        <p className="muted">
          Not a plan to fight the old life — a start on the new one. One small practice per area
          is enough for today.
        </p>
      </motion.section>

      {SPIES_CATEGORIES.map((category) => (
        <CategorySection key={category.key} category={category} userId={user.id} />
      ))}
    </div>
  )
}
