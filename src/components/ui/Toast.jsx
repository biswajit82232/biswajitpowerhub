import { createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};
const TONES = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-brand-500',
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = 'success', duration = 3500) => {
      const id = ++idCounter;
      setToasts((t) => [...t, { id, message, type }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2 px-4 sm:top-6">
          <AnimatePresence>
            {toasts.map((t) => {
              const Icon = ICONS[t.type] || Info;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-surface px-4 py-3 shadow-card ring-1 ring-line"
                >
                  <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', TONES[t.type])} />
                  <p className="flex-1 text-sm font-medium text-heading">{t.message}</p>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="text-muted transition hover:text-heading"
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: () => {}, dismiss: () => {} };
  return ctx;
}
