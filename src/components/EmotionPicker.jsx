import { motion } from 'framer-motion'

// A simplified take on the "mood meter" framework (energy level x
// pleasantness) -- four quadrants of emotion words rather than one
// long undifferentiated list, so picking is quick and specific.
const QUADRANTS = [
  {
    key: 'red',
    label: 'High energy, unpleasant',
    className: 'quadrant-red',
    emotions: ['Angry', 'Anxious', 'Stressed', 'Frustrated', 'Overwhelmed', 'Irritated'],
  },
  {
    key: 'yellow',
    label: 'High energy, pleasant',
    className: 'quadrant-yellow',
    emotions: ['Happy', 'Excited', 'Hopeful', 'Motivated', 'Proud', 'Energized'],
  },
  {
    key: 'blue',
    label: 'Low energy, unpleasant',
    className: 'quadrant-blue',
    emotions: ['Sad', 'Lonely', 'Tired', 'Bored', 'Discouraged', 'Numb'],
  },
  {
    key: 'green',
    label: 'Low energy, pleasant',
    className: 'quadrant-green',
    emotions: ['Calm', 'Relaxed', 'Content', 'Peaceful', 'Grateful', 'Safe'],
  },
]

const MAX_EMOTIONS = 3

// `values`: array of currently-selected emotion strings (0-3).
// `onChange`: called with the next array whenever a chip is toggled.
export default function EmotionPicker({ values = [], onChange }) {
  const atMax = values.length >= MAX_EMOTIONS

  function toggle(emotion) {
    if (values.includes(emotion)) {
      onChange(values.filter((v) => v !== emotion))
    } else if (!atMax) {
      onChange([...values, emotion])
    }
  }

  return (
    <div className="emotion-picker">
      <p className="muted emotion-picker-hint">
        Pick up to {MAX_EMOTIONS} ({values.length}/{MAX_EMOTIONS})
      </p>
      <div className="emotion-grid">
        {QUADRANTS.map((q) => (
          <div key={q.key} className={`emotion-quadrant ${q.className}`}>
            <p className="emotion-quadrant-label">{q.label}</p>
            <div className="emotion-chip-wrap">
              {q.emotions.map((emotion) => {
                const selected = values.includes(emotion)
                const disabled = !selected && atMax
                return (
                  <motion.button
                    key={emotion}
                    type="button"
                    className={`emotion-chip${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`}
                    onClick={() => toggle(emotion)}
                    disabled={disabled}
                    whileHover={disabled ? {} : { scale: 1.05 }}
                    whileTap={disabled ? {} : { scale: 0.95 }}
                  >
                    {emotion}
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
