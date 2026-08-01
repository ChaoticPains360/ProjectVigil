import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { MenuIcon, BackHomeIcon, UserIcon, GearIcon } from './icons'

const easeSoft = [0.16, 1, 0.3, 1]

export default function TopBar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const showHomeReturn = location.pathname !== '/'

  if (!user) return null

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        {showHomeReturn && (
          <button
            type="button"
            className="top-bar-icon-btn"
            onClick={() => navigate('/')}
            aria-label="Back to home"
          >
            <BackHomeIcon width={22} height={22} />
          </button>
        )}
      </div>

      <div className="top-bar-right">
        <button
          type="button"
          className="top-bar-icon-btn"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="true"
          aria-expanded={open}
          aria-label="Menu"
        >
          <MenuIcon width={22} height={22} />
        </button>
        {/* Plain conditional render, not AnimatePresence -- a full-screen
            click-catching scrim must never be able to get stuck in the DOM
            waiting on an exit animation that fails to resolve. */}
        {open && (
          <button
            type="button"
            className="top-bar-scrim"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
        )}
        <AnimatePresence>
          {open && (
            <motion.div
              className="top-bar-dropdown"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: easeSoft }}
            >
              <p className="top-bar-dropdown-name">{profile?.display_name ?? 'Account'}</p>
              <button
                type="button"
                className="top-bar-dropdown-item"
                onClick={() => {
                  setOpen(false)
                  navigate('/profile')
                }}
              >
                <UserIcon width={18} height={18} /> Profile
              </button>
              <button
                type="button"
                className="top-bar-dropdown-item"
                onClick={() => {
                  setOpen(false)
                  navigate('/settings')
                }}
              >
                <GearIcon width={18} height={18} /> Settings
              </button>
              <button
                type="button"
                className="top-bar-dropdown-item top-bar-dropdown-signout"
                onClick={signOut}
              >
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
