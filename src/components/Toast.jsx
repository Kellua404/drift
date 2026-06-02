import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let toastId = 0;
let globalShowToast = null;

export function useToast() {
  return useCallback((message) => {
    globalShowToast?.(message);
  }, []);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    globalShowToast = (message) => {
      const id = ++toastId;
      setToasts(t => [...t, { id, message }]);
      setTimeout(() => {
        setToasts(t => t.filter(x => x.id !== id));
      }, 2500);
    };
    return () => { globalShowToast = null; };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-2.5 rounded-xl border border-white/10 font-hanken text-haze-200"
            style={{
              background: 'rgba(16,13,28,0.88)',
              backdropFilter: 'blur(16px)',
              fontSize: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
