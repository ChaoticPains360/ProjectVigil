import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { AuthProvider } from './context/AuthContext.jsx'
import App from './App.jsx'
import './index.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => console.error('SW registration failed', err))
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* reducedMotion="user" makes every motion.* component in the app
        automatically honor the OS-level prefers-reduced-motion setting
        -- animations still run but are stripped to opacity-only, no
        per-component wiring needed. */}
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>
)
