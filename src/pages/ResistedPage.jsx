import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MountainSunriseScene from '../components/MountainSunriseScene'
import VerseCard from '../components/VerseCard'
import { randomVerseFrom } from '../lib/randomVerse'

const easeSoft = [0.16, 1, 0.3, 1]

const VERSE_REFS = [
  'Isaiah 40:31',
  'Philippians 4:13',
  'Galatians 6:9',
  '2 Timothy 1:7',
  'Zephaniah 3:17',
  'Joshua 1:9',
]

const NEXT_STEPS = [
  'Say a quick prayer of thanks — gratitude locks in the win.',
  'Journal what helped you resist, so you can reach for it again.',
  'Let your accountability partner know — give them something to celebrate with you.',
  "Stay watchful. Don't let your guard down just because this moment passed.",
]

export default function ResistedPage() {
  const [verse] = useState(() => randomVerseFrom(VERSE_REFS))

  return (
    <>
      <MountainSunriseScene />
      <div className="page">
        <motion.section
          className="scene-copy-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeSoft }}
        >
          <p className="scene-eyebrow">Well done</p>
          <h1>Keep keeping up.</h1>
          <p className="scene-subhead">This is what it looks like to be a Type 2 man.</p>
          <p>
            Your strength today didn't come from willpower alone — it came from the Lord. This
            is how it should be: watchful, steady, standing your ground. Stay vigilant. The next
            moment matters just as much as this one did.
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
            <strong>Type 2:</strong> "Those who are earnestly purging away their sins, and who
            are progressing from good to better in the service of God our Lord."
          </p>
          <p className="muted">
            The alternative — Type 1 — drifts from mortal sin to mortal sin without resisting.
            Today, you didn't.
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
            Journal this moment
          </Link>
          <Link to="/" className="button-link secondary">
            Back to home
          </Link>
        </motion.div>
      </div>
    </>
  )
}
