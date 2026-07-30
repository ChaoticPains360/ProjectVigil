import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ValleyDuskScene from '../components/ValleyDuskScene'
import VerseCard from '../components/VerseCard'
import { randomVerseFrom } from '../lib/randomVerse'

const easeSoft = [0.16, 1, 0.3, 1]

const VERSE_REFS = [
  'Micah 7:8',
  '1 John 1:9',
  'Psalm 51:12',
  'Romans 8:1',
  'Lamentations 3:22-23',
  'Psalm 34:19',
]

const NEXT_STEPS = [
  "Call or text your accountability partner — you don't have to carry this alone.",
  'Consider going to Confession this week. Mercy is always available.',
  'Put your phone in another room for the next hour.',
  'Write honestly about what led here in your journal — no judgment.',
  'Need a moment to reset? The Urge Toolkit has a breathing guide and a delay timer.',
]

export default function SlippedPage() {
  const [verse] = useState(() => randomVerseFrom(VERSE_REFS))

  return (
    <>
      <ValleyDuskScene />
      <div className="page">
        <motion.section
          className="scene-copy-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeSoft }}
        >
          <p className="scene-eyebrow">Grace, not shame</p>
          <h1>We fall. We get back up.</h1>
          <p className="scene-subhead">Keep on keeping on — you can still be a Type 2 man.</p>
          <p>
            This moment doesn't define you. If you're linked with an accountability partner,
            they've already been notified — you don't have to carry this alone. Return to the
            Lord and His sacraments: confession isn't about shame, it's about mercy. Take a real
            step back from your phone right now, and give yourself a few honest minutes of
            self-reflection.
          </p>
        </motion.section>

        <motion.section
          className="card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: easeSoft }}
        >
          <h2>What is a Type 2 man?</h2>
          <p>
            <strong>Type 1:</strong> "Those who go from mortal sin to mortal sin."
          </p>
          <p>
            <strong>Type 2:</strong> "Those who are earnestly purging away their sins, and who
            are progressing from good to better in the service of God our Lord."
          </p>
          <p className="muted">
            One slip doesn't make you Type 1 — that's a pattern of never resisting. Getting back
            up, right now, is what makes you Type 2.
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: easeSoft }}
        >
          {verse && <VerseCard verse={verse} />}
        </motion.div>

        <motion.section
          className="card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: easeSoft }}
        >
          <h2>Next steps</h2>
          <ul>
            {NEXT_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </motion.section>

        <motion.div
          className="button-row"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26, ease: easeSoft }}
        >
          <Link to="/journal" className="button-link">
            Reflect in journal
          </Link>
          <Link to="/partners" className="button-link secondary">
            Message your partner
          </Link>
          <Link to="/" className="button-link secondary">
            Back to home
          </Link>
        </motion.div>
      </div>
    </>
  )
}
