import { motion } from 'framer-motion';

export function Wordmark() {
  return (
    <motion.div
      className="fixed top-6 left-8 z-10 select-none pointer-events-none"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    >
      <motion.h1
        className="font-fraunces text-haze-50 leading-none"
        style={{
          fontSize: 'clamp(2rem, 5vw, 3.25rem)',
          fontWeight: 340,
          letterSpacing: '-0.02em',
          fontOpticalSizing: 'auto',
        }}
      >
        Drift
      </motion.h1>
      <motion.p
        className="font-fraunces text-haze-200 mt-1"
        style={{ fontSize: '1rem', fontStyle: 'italic', fontWeight: 300 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        A dream you can move through.
      </motion.p>
    </motion.div>
  );
}
