import { useEffect, useRef } from 'react'
import { animate, useMotionValue, useTransform } from 'framer-motion'

// Tweens the displayed integer from its previous value to `value`
// whenever it changes, instead of just snapping -- makes streak
// updates feel earned rather than instant.
export default function AnimatedNumber({ value, className }) {
  const motionValue = useMotionValue(value)
  const rounded = useTransform(motionValue, (latest) => Math.round(latest))
  const ref = useRef(null)

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, ease: [0.16, 1, 0.3, 1] })
    return controls.stop
  }, [value, motionValue])

  useEffect(() => {
    return rounded.on('change', (latest) => {
      if (ref.current) ref.current.textContent = String(latest)
    })
  }, [rounded])

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  )
}
