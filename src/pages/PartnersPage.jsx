import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const easeSoft = [0.16, 1, 0.3, 1]

export default function PartnersPage() {
  const { user } = useAuth()
  const [links, setLinks] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [newInviteUrl, setNewInviteUrl] = useState(null)

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('partner_links')
      .select('*, partner:profiles!partner_links_partner_id_fkey(display_name)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    setLinks(data ?? [])
  }, [user.id])

  useEffect(() => {
    load()
  }, [load])

  async function createInvite() {
    setBusy(true)
    setError(null)
    setNewInviteUrl(null)
    try {
      const { data, error: err } = await supabase
        .from('partner_links')
        .insert({ owner_id: user.id })
        .select()
        .single()
      if (err) throw err
      setNewInviteUrl(`${window.location.origin}/invite/${data.invite_code}`)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function revoke(linkId) {
    setBusy(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('partner_links')
        .update({ status: 'revoked' })
        .eq('id', linkId)
      if (err) throw err
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
        <h2>Invite an accountability partner</h2>
        <motion.button
          disabled={busy}
          onClick={createInvite}
          whileHover={{ scale: busy ? 1 : 1.03 }}
          whileTap={{ scale: busy ? 1 : 0.97 }}
        >
          Generate invite link
        </motion.button>
        <AnimatePresence>
          {newInviteUrl && (
            <motion.p
              className="invite-url"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: easeSoft }}
            >
              Share this link: <code>{newInviteUrl}</code>
            </motion.p>
          )}
        </AnimatePresence>
        {error && <p className="error">{error}</p>}
      </motion.section>

      <motion.section
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: easeSoft }}
      >
        <h2>Your links</h2>
        {links.length === 0 && <p className="muted">No invites yet.</p>}
        <ul className="link-list">
          <AnimatePresence initial={false}>
            {links.map((link) => (
              <motion.li
                key={link.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3, ease: easeSoft }}
              >
                <span className={`status-badge status-${link.status}`}>{link.status}</span>
                <span>
                  {link.status === 'active'
                    ? link.partner?.display_name ?? 'Partner'
                    : link.status === 'pending'
                      ? 'Waiting for partner to accept'
                      : 'Revoked'}
                </span>
                {link.status !== 'revoked' && (
                  <button className="link-button" disabled={busy} onClick={() => revoke(link.id)}>
                    Revoke
                  </button>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </motion.section>
    </div>
  )
}
