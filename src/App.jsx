import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import AnimatedBackground from './components/AnimatedBackground'
import AuthPage from './pages/AuthPage'
import OwnerDashboard from './pages/OwnerDashboard'
import PartnersPage from './pages/PartnersPage'
import PartnerDashboard from './pages/PartnerDashboard'
import AcceptInvitePage from './pages/AcceptInvitePage'
import UrgeToolkitPage from './pages/UrgeToolkitPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import JournalPage from './pages/JournalPage'
import ResistedPage from './pages/ResistedPage'
import StopPage from './pages/StopPage'
import RecoveryPage from './pages/RecoveryPage'
import PrepPage from './pages/PrepPage'
import MomentHubPage from './pages/MomentHubPage'
import JourneyPage from './pages/JourneyPage'
import RestorePage from './pages/RestorePage'
import OnboardingPage from './pages/OnboardingPage'

// STOP/Recovery drop the normal chrome entirely -- no top bar, no
// bottom nav -- so the experience stays simple and distraction-free
// when someone is vulnerable right now.
const BARE_ROUTES = ['/stop', '/recover']

// Pages that "belong" to a zone and should switch the bottom nav to
// it. Shared destinations (Journal, People, Settings, Profile, etc.)
// are deliberately NOT listed here -- visiting them from inside the
// Moment or Journey shouldn't snap the bottom nav back to Home; it
// should only change when the user actually goes to one of these.
function zoneForPath(pathname) {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/moment') || pathname.startsWith('/prep')) return 'moment'
  if (pathname.startsWith('/journey') || pathname.startsWith('/restore')) return 'journey'
  return null
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  const bare = BARE_ROUTES.some((path) => location.pathname.startsWith(path))

  // Sticky bottom-nav zone: only changes on an "anchor" route (Home,
  // Moment, Journey/Restore). Navigating to a shared page like Journal
  // or People from inside the Journey keeps the Journey's bottom nav
  // showing, rather than reverting to Home's.
  const [zone, setZone] = useState('home')
  useEffect(() => {
    const next = zoneForPath(location.pathname)
    if (next) setZone(next)
  }, [location.pathname])

  if (loading) return <div className="page">Loading...</div>

  // Gate the whole app behind onboarding until it's done, rather than
  // wiring this into every individual route -- one place to reason
  // about, and it can't be bypassed by a direct URL to another page.
  // This branch owns BOTH showing /onboarding itself AND redirecting
  // any other path there, so the chrome-free shell always applies
  // while onboarding is incomplete -- not just during the redirect.
  const needsOnboarding = user && profile && !profile.onboarded_at
  if (needsOnboarding) {
    return (
      <div className="app-shell">
        <AnimatedBackground />
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <AnimatedBackground />
      {!bare && <TopBar />}
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <OnboardingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <OwnerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/moment"
          element={
            <RequireAuth>
              <MomentHubPage />
            </RequireAuth>
          }
        />
        <Route
          path="/journey"
          element={
            <RequireAuth>
              <JourneyPage />
            </RequireAuth>
          }
        />
        <Route
          path="/restore"
          element={
            <RequireAuth>
              <RestorePage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/stop"
          element={
            <RequireAuth>
              <StopPage />
            </RequireAuth>
          }
        />
        <Route
          path="/recover"
          element={
            <RequireAuth>
              <RecoveryPage />
            </RequireAuth>
          }
        />
        <Route
          path="/prep"
          element={
            <RequireAuth>
              <PrepPage />
            </RequireAuth>
          }
        />
        <Route
          path="/people"
          element={
            <RequireAuth>
              <PartnersPage />
            </RequireAuth>
          }
        />
        <Route path="/partners" element={<Navigate to="/people" replace />} />
        <Route path="/slipped" element={<Navigate to="/recover" replace />} />
        <Route
          path="/partner-view"
          element={
            <RequireAuth>
              <PartnerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/invite/:code"
          element={
            <RequireAuth>
              <AcceptInvitePage />
            </RequireAuth>
          }
        />
        <Route
          path="/invite"
          element={
            <RequireAuth>
              <AcceptInvitePage />
            </RequireAuth>
          }
        />
        <Route
          path="/toolkit"
          element={
            <RequireAuth>
              <UrgeToolkitPage />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <SettingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/journal"
          element={
            <RequireAuth>
              <JournalPage />
            </RequireAuth>
          }
        />
        <Route
          path="/resisted"
          element={
            <RequireAuth>
              <ResistedPage />
            </RequireAuth>
          }
        />
      </Routes>
      {!bare && <BottomNav zone={zone} />}
    </div>
  )
}
