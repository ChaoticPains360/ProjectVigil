import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'

const easeSoft = [0.16, 1, 0.3, 1]

export default function AcceptInvitePage() {
  const { code: codeFromUrl } = useParams()
  const [code, setCode] = useState(codeFromUrl ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  async function accept(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const { error: err } = await supabase.rpc('accept_invite', { code: code.trim() })
      if (err) throw err
      setSuccess(true)
      setTimeout(() => navigate('/partner-view'), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeSoft }}
      >
        <h2>Accept invite</h2>
        <p className="muted">
          Enter the invite code an owner shared with you to become their accountability partner.
        </p>
        <form onSubmit={accept} className="auth-form">
          <label>
            Invite code
            <input value={code} onChange={(e) => setCode(e.target.value)} required />
          </label>
          {error && <p className="error">{error}</p>}
          {success && <p className="info">Linked! Redirecting to your partner view...</p>}
          <motion.button
            type="submit"
            disabled={busy || success}
            whileHover={{ scale: busy || success ? 1 : 1.03 }}
            whileTap={{ scale: busy || success ? 1 : 0.97 }}
          >
            Accept
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
