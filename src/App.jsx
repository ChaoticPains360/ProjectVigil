import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import NavBar from './components/NavBar'
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
import SlippedPage from './pages/SlippedPage'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="page">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { loading } = useAuth()

  if (loading) return <div className="page">Loading...</div>

  return (
    <div className="app-shell">
      <AnimatedBackground />
      <NavBar />
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
          path="/partners"
          element={
            <RequireAuth>
              <PartnersPage />
            </RequireAuth>
          }
        />
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
        <Route
          path="/slipped"
          element={
            <RequireAuth>
              <SlippedPage />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  )
}
