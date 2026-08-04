// Small inline icon set -- no icon library dependency. All icons are
// 24x24, stroke-based, currentColor, so they inherit nav text color.
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function HomeIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3.5a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

export function JournalIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3.5h9.5A2.5 2.5 0 0 1 18 6v14.5H8.5A2.5 2.5 0 0 1 6 18V3.5Z" />
      <path d="M6 18a2.5 2.5 0 0 1 2.5-2.5H18" />
      <path d="M9.5 8h5M9.5 11h5" />
    </svg>
  )
}

export function PeopleIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="8.5" r="2.4" />
      <path d="M15.8 12.2A4.6 4.6 0 0 1 20.5 17" />
    </svg>
  )
}

export function PrepIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 5 6.5v5c0 5 3 8.3 7 9 4-.7 7-4 7-9v-5L12 3.5Z" />
      <path d="M9.2 12.2l2 2 3.6-4.2" />
    </svg>
  )
}

export function StopIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8.2 3.5h7.6l4.7 4.7v7.6l-4.7 4.7H8.2l-4.7-4.7V8.2l4.7-4.7Z" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  )
}

export function RestoreIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20.5c-4-2.5-4-7-4-9.5 1.5 1 3 1 4-1 1 2 2.5 2 4 1 0 2.5 0 7-4 9.5" />
      <path d="M12 11v9.5" />
    </svg>
  )
}

export function RecoverIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20.3s-7-4.4-7-10a4.3 4.3 0 0 1 7-3.3 4.3 4.3 0 0 1 7 3.3c0 5.6-7 10-7 10Z" />
    </svg>
  )
}

export function MenuIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6.5h16M4 12h16M4 17.5h16" />
    </svg>
  )
}

export function BackHomeIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M19 12H5" />
      <path d="M10.5 6.5 5 12l5.5 5.5" />
    </svg>
  )
}

export function UserIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  )
}

export function GearIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2M12 18.5v2M4.9 6.9l1.4 1.4M17.7 15.7l1.4 1.4M3.5 12h2M18.5 12h2M4.9 17.1l1.4-1.4M17.7 8.3l1.4-1.4" />
    </svg>
  )
}
