import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dices, Pause, Play, Maximize, EyeOff, Download, HelpCircle } from 'lucide-react';
import { useDriftStore } from '../store/useDriftStore';

function ActionBtn({ onClick, title, children, active }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/15 text-haze-400 hover:text-haze-200 hover:border-white/25 transition-all"
      style={{
        background: active ? 'rgba(255,255,255,0.14)' : 'rgba(16,13,28,0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: active ? 'var(--accent)' : undefined,
      }}
    >
      {children}
    </button>
  );
}

export function ActionBar({ glRef, onExport, isMobile }) {
  const [showHint, setShowHint] = useState(false);
  const { randomize, togglePause, toggleUI, paused } = useDriftStore();

  function handleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  return (
    <motion.div
      className={
        isMobile
          ? 'fixed top-6 right-6 z-30 flex flex-row gap-1.5'
          : 'fixed bottom-6 right-6 z-20 flex flex-col gap-1.5'
      }
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <ActionBtn onClick={randomize} title="Randomize (R)">
        <Dices size={14} />
      </ActionBtn>
      <ActionBtn onClick={togglePause} title={paused ? 'Play (Space)' : 'Pause (Space)'} active={paused}>
        {paused ? <Play size={14} /> : <Pause size={14} />}
      </ActionBtn>
      <ActionBtn onClick={handleFullscreen} title="Fullscreen (F)">
        <Maximize size={14} />
      </ActionBtn>
      <ActionBtn onClick={toggleUI} title="Hide UI (H)">
        <EyeOff size={14} />
      </ActionBtn>
      <ActionBtn onClick={onExport} title="Export (E)">
        <Download size={14} />
      </ActionBtn>
      <ActionBtn onClick={() => setShowHint(h => !h)} title="Keyboard shortcuts" active={showHint}>
        <HelpCircle size={14} />
      </ActionBtn>

      {showHint && (
        <motion.div
          className={
            (isMobile ? 'top-10 right-0' : 'bottom-0 right-10') +
            ' absolute rounded-xl border border-white/10 p-3 whitespace-nowrap'
          }
          style={{
            background: 'rgba(16,13,28,0.92)',
            backdropFilter: 'blur(16px)',
            fontSize: 11,
          }}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {[['R','Randomize'],['Space','Pause'],['F','Fullscreen'],['H','Hide UI'],['E','Export'],['1–6','Scene']].map(([k,v]) => (
            <div key={k} className="flex gap-3 items-center mb-1 last:mb-0">
              <span className="font-hanken text-haze-400 w-12 text-right">{k}</span>
              <span className="font-hanken text-haze-200">{v}</span>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
