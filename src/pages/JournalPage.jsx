import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { marked } from 'marked'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import EmotionPicker from '../components/EmotionPicker'

const easeSoft = [0.16, 1, 0.3, 1]

export default function JournalPage() {
  const { user } = useAuth()
  const [emotions, setEmotions] = useState([])
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [entries, setEntries] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [{ data: entryRows, error: entryErr }, { data: logRows, error: logErr }] =
      await Promise.all([
        supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('urge_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('ts', { ascending: false })
          .limit(50),
      ])
    if (entryErr) setError(entryErr.message)
    if (logErr) setError(logErr.message)
    setEntries(entryRows ?? [])
    setLogs(logRows ?? [])
    setLoading(false)
  }, [user.id])

  useEffect(() => {
    load()
  }, [load])

  async function saveEntry() {
    if (!body.trim()) return
    setBusy(true)
    setError(null)
    try {
      const { error: err } = await supabase.from('journal_entries').insert({
        user_id: user.id,
        emotions,
        body: body.trim(),
      })
      if (err) throw err
      setBody('')
      setEmotions([])
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <motion.section
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeSoft }}
      >
        <h2>How are you feeling right now?</h2>
        <p className="muted">Visible to your accountability partner, along with your entry.</p>
        <EmotionPicker values={emotions} onChange={setEmotions} />
      </motion.section>

      <AnimatePresence>
        {emotions.length > 0 && (
          <motion.section
            className="card journal-editor"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: easeSoft }}
          >
            <h3>Feeling {emotions.join(', ').toLowerCase()} — what's going on?</h3>
            <p className="muted">Markdown supported: **bold**, *italic*, lists, etc.</p>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write whatever's true right now..."
            />
            <div className="button-row">
              <motion.button
                disabled={busy || !body.trim()}
                onClick={saveEntry}
                whileHover={{ scale: busy ? 1 : 1.03 }}
                whileTap={{ scale: busy ? 1 : 0.96 }}
              >
                Save entry
              </motion.button>
              <button className="secondary" onClick={() => setEmotions([])}>
                Clear feelings
              </button>
            </div>
            {error && <p className="error">{error}</p>}
          </motion.section>
        )}
      </AnimatePresence>

      <motion.section
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: easeSoft }}
      >
        <h2>Past entries</h2>
        {!loading && entries.length === 0 && <p className="muted">Nothing written yet.</p>}
        <div className="journal-history">
          {entries.map((entry) => (
            <div key={entry.id} className="journal-entry">
              <div className="journal-entry-meta">
                {(entry.emotions ?? []).map((e) => (
                  <span key={e} className="journal-entry-emotion">
                    {e}
                  </span>
                ))}
                <span className="log-time">{new Date(entry.created_at).toLocaleString()}</span>
              </div>
              <div
                className="journal-entry-body"
                dangerouslySetInnerHTML={{ __html: marked.parse(entry.body) }}
              />
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="recent-log"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: easeSoft }}
      >
        <h2>Recent activity</h2>
        {!loading && logs.length === 0 && <p className="muted">Nothing logged yet.</p>}
        <ul>
          <AnimatePresence initial={false}>
            {logs.map((log, i) => (
              <motion.li
                key={log.id}
                className={log.outcome === 'slip' ? 'slip' : 'resisted'}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.03, ease: easeSoft }}
              >
                <span className="log-outcome">{log.outcome}</span>
                <span className="log-time">{new Date(log.ts).toLocaleString()}</span>
                {log.trigger && <span className="log-trigger">{log.trigger}</span>}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </motion.section>
    </div>
  )
}
