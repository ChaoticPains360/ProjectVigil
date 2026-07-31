import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/journal', label: 'Journal' },
  { to: '/prep', label: 'Prep' },
  { to: '/people', label: 'People' },
  { to: '/partner-view', label: 'Partner View' },
  { to: '/settings', label: 'Settings' },
]

export default function NavBar() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()

  if (!user) return null

  return (
    <nav className="navbar">
      <div className="navbar-links">
        {LINKS.map((link) => {
          const active = location.pathname === link.to
          return (
            <Link key={link.to} to={link.to} className={`nav-link${active ? ' active' : ''}`}>
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="nav-link-bg"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              {link.label}
            </Link>
          )
        })}
      </div>
      <div className="navbar-user">
        <span>{profile?.display_name ?? user.email}</span>
        <button className="secondary" onClick={signOut}>
          Sign out
        </button>
      </div>
    </nav>
  )
}
