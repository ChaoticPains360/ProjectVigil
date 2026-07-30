import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { enablePushNotifications } from '../lib/push'

const easeSoft = [0.16, 1, 0.3, 1]
const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

export default function SettingsPage() {
  const { user, profile } = useAuth()
  const [reminderTime, setReminderTime] = useState(profile?.reminder_time?.slice(0, 5) ?? '')
  const [notifyPref, setNotifyPref] = useState(profile?.partner_notify_pref ?? 'all')
  const [journalMorning, setJournalMorning] = useState(profile?.journal_remind_morning ?? false)
  const [journalMidday, setJournalMidday] = useState(profile?.journal_remind_midday ?? false)
  const [journalEvening, setJournalEvening] = useState(profile?.journal_remind_evening ?? false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [pushStatus, setPushStatus] = useState(null)

  async function saveSettings(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({
          reminder_time: reminderTime || null,
          reminder_timezone: detectedTimezone,
          partner_notify_pref: notifyPref,
          journal_remind_morning: journalMorning,
          journal_remind_midday: journalMidday,
          journal_remind_evening: journalEvening,
        })
        .eq('id', user.id)
      if (err) throw err
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleEnablePush() {
    setPushStatus(null)
    setError(null)
    try {
      await enablePushNotifications(user.id)
      setPushStatus('Notifications enabled on this device.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h2>Settings</h2>

      <motion.section
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeSoft }}
      >
        <h3>Notifications on this device</h3>
        <p className="muted">
          Enable push notifications to receive your nightly reminder and (if you're a partner)
          alerts when someone you support logs an urge.
        </p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleEnablePush}>
          Enable notifications
        </motion.button>
        {pushStatus && <p className="info">{pushStatus}</p>}
      </motion.section>

      <motion.form
        onSubmit={saveSettings}
        className="auth-form"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06, ease: easeSoft }}
      >
        <section className="card">
          <h3>Nightly reminder</h3>
          <label>
            Reminder time ({detectedTimezone})
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </label>
          <p className="muted">Leave blank to turn off the nightly reminder.</p>
        </section>

        <section className="card">
          <h3>Journal reminders</h3>
          <p className="muted">Optional nudges to check in with how you're feeling.</p>
          <label className="halt-item">
            <input
              type="checkbox"
              checked={journalMorning}
              onChange={(e) => setJournalMorning(e.target.checked)}
            />
            Morning (9:00 AM)
          </label>
          <label className="halt-item">
            <input
              type="checkbox"
              checked={journalMidday}
              onChange={(e) => setJournalMidday(e.target.checked)}
            />
            Midday (1:00 PM)
          </label>
          <label className="halt-item">
            <input
              type="checkbox"
              checked={journalEvening}
              onChange={(e) => setJournalEvening(e.target.checked)}
            />
            Evening (8:00 PM)
          </label>
        </section>

        <section className="card">
          <h3>Partner notifications</h3>
          <p className="muted">Choose when your accountability partner(s) get notified.</p>
          <label>
            <select value={notifyPref} onChange={(e) => setNotifyPref(e.target.value)}>
              <option value="all">Every logged urge (resisted or slip)</option>
              <option value="slip_only">Only when I slip</option>
            </select>
          </label>
        </section>

        {error && <p className="error">{error}</p>}
        {saved && <p className="info">Saved.</p>}
        <motion.button type="submit" disabled={busy} whileHover={{ scale: busy ? 1 : 1.03 }} whileTap={{ scale: busy ? 1 : 0.97 }}>
          Save settings
        </motion.button>
      </motion.form>
    </div>
  )
}
