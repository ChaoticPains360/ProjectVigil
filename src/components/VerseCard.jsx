import { verseOfTheDay } from '../lib/verseOfDay'

export default function VerseCard({ verse }) {
  const v = verse ?? verseOfTheDay()
  return (
    <div className="verse-card">
      <p className="verse-text">&ldquo;{v.text}&rdquo;</p>
      <p className="verse-reference">{v.reference}</p>
    </div>
  )
}
