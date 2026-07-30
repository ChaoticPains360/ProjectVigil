// Slow-moving ambient glow, fixed behind all page content. Purely
// decorative -- aria-hidden, and pauses itself under
// prefers-reduced-motion via the .bg-blob CSS animation being
// disabled in that media query (see index.css).
export default function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">
      <div className="bg-blob bg-blob-amber" />
      <div className="bg-blob bg-blob-violet" />
      <div className="bg-blob bg-blob-rose" />
      <div className="bg-grain" />
    </div>
  )
}
