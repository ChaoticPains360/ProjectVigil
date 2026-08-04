import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SwipeShell from '../components/SwipeShell'
import { MOMENT_PARTS } from '../lib/resources'

const easeSoft = [0.16, 1, 0.3, 1]

export default function MomentHubPage() {
  return (
    <SwipeShell leftTo="/" className="page">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeSoft }}
      >
        <p className="scene-eyebrow">The Moment</p>
        <h1>Prepare. Stop. Recover.</h1>
        <p className="muted">
          Everything you need when temptation is close, happening now, or just happened.
        </p>
      </motion.section>

      {MOMENT_PARTS.map((part, i) => (
        <motion.div
          key={part.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 + i * 0.05, ease: easeSoft }}
        >
          <Link to={part.to} className="card moment-hub-tile">
            <h2>{part.label}</h2>
            <p className="moment-hub-tagline">{part.tagline}</p>
            <p className="muted">{part.description}</p>
          </Link>
        </motion.div>
      ))}

      <p className="home-quiet-link">Swipe left, or use the menu, to go back home.</p>
    </SwipeShell>
  )
}
