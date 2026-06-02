import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Link } from 'lucide-react';
import { exportPng } from '../lib/exportPng';
import { toUrl } from '../lib/urlState';
import { useDriftStore } from '../store/useDriftStore';
import { useToast } from './Toast';

const SIZES = [
  { key: 'viewport', label: 'Viewport' },
  { key: '1080p', label: '1080p' },
  { key: '1440p', label: '1440p' },
  { key: '4k', label: '4K' },
];

export function ExportDialog({ open, onClose, glRef }) {
  const [size, setSize] = useState('viewport');
  const [exporting, setExporting] = useState(false);
  const toast = useToast();
  const { sceneName, seed, count, flow, drift, forceMode, forceRadius, forceStrength,
          haze, focus, bokeh, bloom } = useDriftStore();

  async function handleDownload() {
    setExporting(true);
    try {
      await exportPng(glRef, size, sceneName, seed);
      const seedHex = (seed >>> 0).toString(16).padStart(8,'0').slice(0,6).toUpperCase();
      toast(`Saved drift-${sceneName.toLowerCase()}-${seedHex}.png`);
      onClose();
    } catch (e) {
      toast('Export failed — try viewport size');
    } finally {
      setExporting(false);
    }
  }

  function handleCopyLink() {
    const url = toUrl({ count, flow, drift, forceMode, forceRadius, forceStrength,
                        haze, focus, bokeh, bloom, seed, sceneName });
    navigator.clipboard.writeText(url).then(() => {
      toast('Link copied');
      onClose();
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Export this dream"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-white/[0.08] p-6"
              style={{
                background: 'rgba(16,13,28,0.92)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-fraunces text-haze-50" style={{ fontSize: '1.1rem', fontWeight: 340 }}>
                  Export this dream
                </h2>
                <button onClick={onClose} className="text-haze-400 hover:text-haze-200 transition-colors" aria-label="Close">
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="font-hanken text-haze-400 uppercase" style={{ fontSize: 10, letterSpacing: '0.18em' }}>
                    Size
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {SIZES.map(s => (
                      <button
                        key={s.key}
                        onClick={() => setSize(s.key)}
                        className="py-1.5 rounded-lg font-hanken text-xs border transition-colors"
                        style={{
                          fontSize: 11,
                          background: size === s.key ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                          color: size === s.key ? '#0A0813' : '#C3BFD6',
                          borderColor: size === s.key ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                          fontWeight: size === s.key ? 600 : 400,
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={exporting}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-hanken font-medium transition-opacity"
                  style={{
                    background: 'var(--accent)',
                    color: '#0A0813',
                    fontSize: 13,
                    opacity: exporting ? 0.6 : 1,
                  }}
                >
                  <Download size={14} />
                  {exporting ? 'Rendering…' : 'Download PNG'}
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-hanken border border-white/10 text-haze-200 transition-colors hover:border-white/20"
                  style={{ fontSize: 13 }}
                >
                  <Link size={14} />
                  Copy link
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
