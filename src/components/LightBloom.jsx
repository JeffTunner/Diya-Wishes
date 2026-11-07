import { motion, AnimatePresence } from 'framer-motion'

export default function LightBloom({ active = false, origin = { x: '50%', y: '50%' } }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="light-bloom-overlay"
          initial={{ opacity: 0, scale: 0.1 }}
          animate={{
            opacity: [0, 0.95, 0.9, 0],
            scale: [0.1, 1.8, 3.2, 4.5],
          }}
          transition={{
            duration: 1.1,
            times: [0, 0.35, 0.7, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            position: 'fixed',
            left: origin.x,
            top: origin.y,
            width: '600px',
            height: '600px',
            marginLeft: '-300px',
            marginTop: '-300px',
            pointerEvents: 'none',
            zIndex: 40,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(255,241,168,0.98) 0%, rgba(255,183,3,0.85) 30%, rgba(255,90,31,0.6) 55%, rgba(7,3,15,0) 80%)',
            mixBlendMode: 'screen',
          }}
        />
      )}
    </AnimatePresence>
  )
}

