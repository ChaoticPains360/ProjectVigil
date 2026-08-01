import { useCallback, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { JournalIcon, HomeIcon, PeopleIcon, PrepIcon, StopIcon, RecoverIcon } from './icons'
import { JOURNEY_STAGES } from '../lib/resources'
import { useAuth } from '../context/AuthContext'

const HOLD_MS = 3000

function zoneFor(pathname) {
  if (pathname.startsWith('/moment') || pathname.startsWith('/prep')) return 'moment'
  if (pathname.startsWith('/journey')) return 'journey'
  return 'home'
}

const ICONS = { journal: JournalIcon, prep: PrepIcon, people: PeopleIcon, stop: StopIcon }

function NavButton({ active, onClick, label, Icon, holdProps }) {
  return (
    <button
      type="button"
      className={`bottom-nav-item${active ? ' active' : ''}`}
      onClick={onClick}
      {...holdProps}
    >
      <Icon className="bottom-nav-icon" aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}

export default function BottomNav() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const zone = zoneFor(location.pathname)
  const [holding, setHolding] = useState(false)
  const timerRef = useRef(null)
  const firedRef = useRef(false)

  const startHold = useCallback(() => {
    firedRef.current = false
    setHolding(true)
    timerRef.current = setTimeout(() => {
      firedRef.current = true
      setHolding(false)
      navigate('/stop')
    }, HOLD_MS)
  }, [navigate])

  const endHold = useCallback(
    (triggerTap) => {
      clearTimeout(timerRef.current)
      setHolding(false)
      if (triggerTap && !firedRef.current) navigate('/')
    },
    [navigate]
  )

  const homeHoldProps = {
    onPointerDown: startHold,
    onPointerUp: () => endHold(true),
    onPointerLeave: () => endHold(false),
    onContextMenu: (e) => e.preventDefault(),
    'aria-label': "Home. Press and hold 3 seconds for I'm struggling.",
  }

  if (!user) return null

  if (zone === 'moment') {
    return (
      <nav className="bottom-nav" aria-label="The Moment">
        <NavButton
          active={location.pathname.startsWith('/prep')}
          onClick={() => navigate('/prep')}
          label="Prep"
          Icon={PrepIcon}
        />
        <NavButton
          active={false}
          onClick={() => navigate('/stop')}
          label="Stop"
          Icon={StopIcon}
        />
        <NavButton
          active={false}
          onClick={() => navigate('/recover')}
          label="Recover"
          Icon={RecoverIcon}
        />
      </nav>
    )
  }

  if (zone === 'journey') {
    const stageKey = searchParams.get('stage') || 'reveal'
    const stage = JOURNEY_STAGES.find((s) => s.key === stageKey) ?? JOURNEY_STAGES[0]
    return (
      <nav className="bottom-nav" aria-label={`${stage.label} resources`}>
        {stage.links.map((link) => {
          const Icon = ICONS[link.icon] ?? JournalIcon
          return (
            <NavButton
              key={link.label}
              active={location.pathname === link.to}
              onClick={() => navigate(link.to)}
              label={link.label}
              Icon={Icon}
            />
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="bottom-nav" aria-label="Home">
      <NavButton
        active={location.pathname === '/journal'}
        onClick={() => navigate('/journal')}
        label="Journal"
        Icon={JournalIcon}
      />
      <button
        type="button"
        className={`bottom-nav-item bottom-nav-home${location.pathname === '/' ? ' active' : ''}`}
        {...homeHoldProps}
      >
        <motion.span
          className="bottom-nav-home-ring"
          initial={false}
          animate={{ scale: holding ? 1 : 0, opacity: holding ? 1 : 0 }}
          transition={{ duration: holding ? HOLD_MS / 1000 : 0.15, ease: 'linear' }}
        />
        <HomeIcon className="bottom-nav-icon" aria-hidden="true" />
        <span>Home</span>
      </button>
      <NavButton
        active={location.pathname === '/people'}
        onClick={() => navigate('/people')}
        label="People"
        Icon={PeopleIcon}
      />
    </nav>
  )
}
