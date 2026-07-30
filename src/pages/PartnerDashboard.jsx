import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { marked } from 'marked'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import Candle from '../components/Candle'

const easeSoft = [0.16, 1, 0.3, 1]

export default function PartnerDashboard() {
  const { user } = useAuth()
  const [linkedOwners, setLinkedOwners] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data: links, error: linkErr } = await supabase
      .from('partner_links')
      .select('id, owner:profiles!partner_links_owner_id_fkey(id, display_name)')
      .eq('partner_id', user.id)
      .eq('status', 'active')

    if (linkErr) {
      setError(linkErr.message)
      setLoading(false)
      return
    }

    const owners = await Promise.all(
      (links ?? []).map(async (link) => {
        const [{ data: streak }, { data: logs }, { data: journalEntries }] = await Promise.all([
          supabase.from('streaks').select('*').eq('user_id', link.owner.id).maybeSingle(),
          supabase
            .from('urge_logs')
            .select('*')
            .eq('user_id', link.owner.id)
            .order('ts', { ascending: false })
            .limit(10),
          supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', link.owner.id)
            .order('created_at', { ascending: false })
            .limit(10),
        ])
        return {
          linkId: link.id,
          owner: link.owner,
          streak,
          logs: logs ?? [],
          journalEntries: journalEntries ?? [],
        }
      })
    )

    setLinkedOwners(owners)
    setLoading(false)
  }, [user.id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <div className="page">Loading...</div>

  return (
    <div className="page">
      <h2>People you support</h2>
      {error && <p className="error">{error}</p>}
      {linkedOwners.length === 0 && (
        <p className="muted">
          No one has linked you as a partner yet. Ask them to send you an invite link.
        </p>
      )}
      {linkedOwners.map(({ linkId, owner, streak, logs, journalEntries }, i) => (
        <motion.section
          key={linkId}
          className="partner-owner-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.06, ease: easeSoft }}
        >
          <div className="partner-owner-header">
            <Candle streak={streak?.streak ?? 0} size={90} />
            <div>
              <h3>{owner.display_name}</h3>
              {streak?.last_good_day && (
                <p className="muted">Last check-in: {streak.last_good_day}</p>
              )}
            </div>
          </div>

          <h4>Recent activity</h4>
          <ul>
            {logs.length === 0 && <li className="muted">No activity yet.</li>}
            {logs.map((log) => (
              <li key={log.id} className={log.outcome === 'slip' ? 'slip' : 'resisted'}>
                <span className="log-outcome">{log.outcome}</span>
                <span className="log-time">{new Date(log.ts).toLocaleString()}</span>
                {log.trigger && <span className="log-trigger">{log.trigger}</span>}
              </li>
            ))}
          </ul>

          <h4>Recent journal entries</h4>
          {journalEntries.length === 0 && <p className="muted">Nothing written yet.</p>}
          <div className="journal-history">
            {journalEntries.map((entry) => (
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
      ))}
    </div>
  )
}
