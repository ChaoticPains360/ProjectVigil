import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import NavBar from './components/NavBar'
import StruggleButton from './components/StruggleButton'
import AnimatedBackground from './components/AnimatedBackground'
import AuthPage from './pages/AuthPage'
import OwnerDashboard from './pages/OwnerDashboard'
import PartnersPage from './pages/PartnersPage'
import PartnerDashboard from './pages/PartnerDashboard'
import AcceptInvitePage from './pages/AcceptInvitePage'
import UrgeToolkitPage from './pages/UrgeToolkitPage'
import SettingsPage from './pages/SettingsPage'
import JournalPage from './pages/JournalPage'
import ResistedPage from './pages/ResistedPage'
import StopPage from './pages/StopPage'
import RecoveryPage from './pages/RecoveryPage'
import PrepPage from './pages/PrepPage'

// The Moment (STOP/Recovery) drops the normal chrome -- no nav, no
// competing "I'm struggling" button -- so the experience stays simple
// when someone is vulnerable right now.
const BARE_ROUTES = ['/stop', '/recover']

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { loading } = useAuth()
  const location = useLocation()
  const bare = BARE_ROUTES.some((path) => location.pathname.startsWith(path))

  if (loading) return <div className="page">Loading...</div>

  return (
    <div className="app-shell">
      <AnimatedBackground />
      {!bare && <NavBar />}
      {!bare && <StruggleButton />}
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <OwnerDashboard />
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
    </div>
  )
}
