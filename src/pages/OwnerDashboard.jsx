import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { logUrge } from '../lib/urgeActions'
import Candle from '../components/Candle'
import VerseCard from '../components/VerseCard'

const easeSoft = [0.16, 1, 0.3, 1]

export default function OwnerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [streak, setStreak] = useState(null)
  const [trigger, setTrigger] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    const { data: streakRow } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    setStreak(streakRow)
  }, [user.id])

  useEffect(() => {
    load()
  }, [load])

  async function handleLog(outcome) {
    setBusy(true)
    setError(null)
    try {
      await logUrge(user.id, { trigger, outcome })
      navigate(outcome === 'slip' ? '/slipped' : '/resisted')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <motion.section
        className="streak-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeSoft }}
      >
        <Candle streak={streak?.streak ?? 0} size={180} />
        {streak?.last_good_day && <p className="muted">Last check-in: {streak.last_good_day}</p>}
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.03, ease: easeSoft }}
      >
        <VerseCard />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: easeSoft }}
      >
        <Link to="/toolkit" className="urge-help-banner urge-help-pulse">
          Having an urge right now? Get help →
        </Link>
      </motion.div>

      <motion.section
        className="log-urge-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: easeSoft }}
      >
        <h2>Log an urge</h2>
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
            Resisted
          </motion.button>
          <motion.button
            disabled={busy}
            className="danger"
            onClick={() => handleLog('slip')}
            whileHover={{ scale: busy ? 1 : 1.03 }}
            whileTap={{ scale: busy ? 1 : 0.96 }}
          >
            Slipped
          </motion.button>
        </div>
        {error && <p className="error">{error}</p>}
      </motion.section>
    </div>
  )
}
