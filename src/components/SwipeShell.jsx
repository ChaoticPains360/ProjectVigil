import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const SWIPE_THRESHOLD = 70
const SWIPE_VELOCITY = 350

// Wraps a hub page (Home / Moment / Journey) so a horizontal drag
// past the threshold navigates to a neighboring zone. Purely a
// gesture detector -- it doesn't animate content in/out itself, so
// there's nothing here that can get stuck waiting on an animation
// to finish (see StopPage/RecoveryPage for why that matters).
export default function SwipeShell({ leftTo, rightTo, children, className }) {
  const navigate = useNavigate()

  function handleDragEnd(_e, info) {
    const { offset, velocity } = info
    if ((offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY) && leftTo) {
      navigate(leftTo)
    } else if ((offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY) && rightTo) {
      navigate(rightTo)
    }
  }

  return (
    <motion.div
      className={className}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.12}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  )
}
