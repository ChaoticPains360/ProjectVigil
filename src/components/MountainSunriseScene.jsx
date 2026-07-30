// Full-bleed decorative illustration for the Resisted page. Bespoke
// inline SVG (same technique as Candle.jsx), not a photo -- layered
// silhouette ridges + a glowing sunrise disc, standing at the summit
// looking out. Purely decorative, aria-hidden.
export default function MountainSunriseScene() {
  return (
    <div className="scene-bg" aria-hidden="true">
      <svg
        className="scene-svg"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="mountainSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--violet-600)" />
            <stop offset="55%" stopColor="var(--amber-600)" />
            <stop offset="100%" stopColor="var(--amber-300)" />
          </linearGradient>
          <radialGradient id="mountainSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7e8" />
            <stop offset="55%" stopColor="var(--amber-200)" />
            <stop offset="100%" stopColor="var(--amber-400)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="800" height="600" fill="url(#mountainSky)" />

        <ellipse className="scene-sun-glow" cx="660" cy="210" rx="130" ry="130" fill="url(#mountainSun)" />
        <circle cx="660" cy="210" r="54" fill="url(#mountainSun)" />

        <path
          d="M0,380 L80,320 L160,360 L260,290 L340,350 L430,300 L520,360 L620,310 L720,355 L800,330 L800,600 L0,600 Z"
          fill="var(--violet-500)"
          opacity="0.35"
        />
        <path
          d="M0,430 L100,360 L200,410 L300,340 L400,400 L500,350 L600,420 L700,370 L800,410 L800,600 L0,600 Z"
          fill="var(--bg-2)"
          opacity="0.85"
        />
        <path
          d="M0,560 L120,460 L220,520 L340,420 L420,480 L520,410 L620,490 L720,440 L800,500 L800,600 L0,600 Z"
          fill="var(--bg-1)"
        />
      </svg>
    </div>
  )
}
