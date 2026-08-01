import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const easeSoft = [0.16, 1, 0.3, 1]

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  async function save(e) {
    e.preventDefault()
    if (!displayName.trim()) return
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() })
        .eq('id', user.id)
      if (err) throw err
      await refreshProfile()
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeSoft }}
      >
        <h1>Profile</h1>
      </motion.section>

      <motion.form
        onSubmit={save}
        className="card auth-form"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: easeSoft }}
      >
        <label>
          Display name
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </label>
        <label>
          Email
          <input value={user.email} disabled />
        </label>
        {error && <p className="error">{error}</p>}
        {saved && <p className="info">Saved.</p>}
        <button type="submit" disabled={busy || !displayName.trim()}>
          Save
        </button>
      </motion.form>
    </div>
  )
}
