import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function Readout({ fpsRef, sceneName, count, seed, isMobile }) {
  const [fps, setFps] = useState(60);
  const seedHex = (seed >>> 0).toString(16).padStart(8, '0').slice(0, 6).toUpperCase();

  useEffect(() => {
    const id = setInterval(() => {
      if (fpsRef?.current) setFps(fpsRef.current);
    }, 600);
    return () => clearInterval(id);
  }, [fpsRef]);

  const item = { initial: { opacity: 0 }, animate: { opacity: 1 } };

  return (
    <motion.div
      className="fixed right-8 z-10 text-right select-none pointer-events-none"
      style={{ top: isMobile ? '4.25rem' : '1.5rem' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    >
      <ReadoutRow label="SCENE" value={sceneName} />
      <ReadoutRow label="FPS" value={fps} />
      <ReadoutRow label="FORMS" value={count} />
      <ReadoutRow label="SEED" value={seedHex} />
    </motion.div>
  );
}

function ReadoutRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-end gap-3 mb-0.5">
      <span
        className="font-hanken text-haze-400 uppercase"
        style={{ fontSize: 11, letterSpacing: '0.16em' }}
      >
        {label}
      </span>
      <span
        className="font-hanken tabular-nums"
        style={{ fontSize: 13, color: 'var(--accent)' }}
      >
        {value}
      </span>
    </div>
  );
}
