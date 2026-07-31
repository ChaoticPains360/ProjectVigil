import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

// Global entry point into the Moment. Visible from anywhere in the
// authenticated app except inside the Moment/Recovery flows themselves,
// where it would be redundant or distracting.
const HIDDEN_ON = ['/login', '/stop', '/recover']

export default function StruggleButton() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) return null
  if (HIDDEN_ON.some((path) => location.pathname.startsWith(path))) return null

  return (
    <motion.button
      type="button"
      className="struggle-button"
      onClick={() => navigate('/stop')}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      aria-label="I'm struggling right now — get help"
    >
      I'm struggling
    </motion.button>
  )
}
