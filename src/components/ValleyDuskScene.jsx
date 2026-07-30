// Full-bleed decorative illustration for the Slipped page. Bespoke
// inline SVG, same technique as MountainSunriseScene -- a quieter,
// cooler valley with rolling (not jagged) hills and exactly one
// small distant warm light, the visual anchor for "we get back up."
// Purely decorative, aria-hidden.
export default function ValleyDuskScene() {
  return (
    <div className="scene-bg" aria-hidden="true">
      <svg
        className="scene-svg"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="valleySky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--bg-0)" />
            <stop offset="60%" stopColor="var(--violet-600)" />
            <stop offset="100%" stopColor="var(--bg-1)" />
          </linearGradient>
          <radialGradient id="hearthGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--amber-200)" />
            <stop offset="100%" stopColor="var(--amber-400)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="800" height="600" fill="url(#valleySky)" />

        <path
          d="M0,420 Q200,380 400,410 T800,400 L800,600 L0,600 Z"
          fill="var(--bg-2)"
          opacity="0.7"
        />
        <path
          d="M0,500 Q200,450 400,490 T800,470 L800,600 L0,600 Z"
          fill="var(--bg-1)"
        />

        <ellipse className="scene-hearth-glow" cx="520" cy="485" rx="34" ry="24" fill="url(#hearthGlow)" />
        <circle cx="520" cy="485" r="4" fill="#fff4d6" />
      </svg>
    </div>
  )
}
