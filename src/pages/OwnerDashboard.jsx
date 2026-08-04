import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { prepCommitments } from '../lib/prep'
import Candle from '../components/Candle'
import VerseCard from '../components/VerseCard'
import SwipeShell from '../components/SwipeShell'

const easeSoft = [0.16, 1, 0.3, 1]

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function dayOfYear() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now - start) / 86400000)
}

export default function OwnerDashboard() {
  const { user, profile } = useAuth()
  const [streak, setStreak] = useState(null)
  const [todaysPractice, setTodaysPractice] = useState(null)

  const load = useCallback(async () => {
    const [{ data: streakRow }, commitments] = await Promise.all([
      supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle(),
      prepCommitments.list(user.id).catch(() => []),
    ])
    setStreak(streakRow)
    if (commitments?.length) {
      setTodaysPractice(commitments[dayOfYear() % commitments.length])
    }
  }, [user.id])

  useEffect(() => {
    load()
  }, [load])

  return (
    <SwipeShell leftTo="/moment" rightTo="/journey" className="page">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeSoft }}
      >
        <p className="scene-eyebrow">
          {greeting()}{profile?.display_name ? `, ${profile.display_name}` : ''}
        </p>
        <h1 className="home-headline">Where are you today?</h1>
      </motion.section>

      <motion.section
        className="streak-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.03, ease: easeSoft }}
      >
        <Candle streak={streak?.streak ?? 0} size={160} />
        <p className="muted">A light, not a scoreboard. Consistency matters more than any single number.</p>
      </motion.section>

      {todaysPractice && (
        <motion.section
          className="card today-practice-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.045, ease: easeSoft }}
        >
          <p className="today-practice-label">Today's practice</p>
          <p className="today-practice-body">{todaysPractice.label}</p>
        </motion.section>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06, ease: easeSoft }}
      >
        <VerseCard />
      </motion.div>

      <motion.section
        className="card home-next-actions"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: easeSoft }}
      >
        <h2>Today</h2>
        <div className="home-action-list">
          <Link to="/journal" className="home-action-row">
            <span>Reflect for a minute</span>
            <span className="home-action-arrow">→</span>
          </Link>
          <Link to="/journey" className="home-action-row">
            <span>See your Journey</span>
            <span className="home-action-arrow">→</span>
          </Link>
          <Link to="/people" className="home-action-row">
            <span>Stay connected to your people</span>
            <span className="home-action-arrow">→</span>
          </Link>
        </div>
      </motion.section>

      <motion.p
        className="home-quiet-link"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: easeSoft }}
      >
        Had a difficult moment already? <Link to="/recover">Come back →</Link>
      </motion.p>
      <p className="home-swipe-hint muted">
        Swipe left for The Moment · Swipe right for your Journey
      </p>
    </SwipeShell>
  )
}
