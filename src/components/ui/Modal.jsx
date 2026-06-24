import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Accessible, animated modal. Mobile: slides up as a sheet. Desktop: centered.
 */
export function Modal({ open, onClose, title, children, className, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-heading/40 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={cn(
              'relative z-10 w-full bg-surface shadow-card-hover',
              'max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl',
              sizes[size],
              className
            )}
          >
            {(title || onClose) && (
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-surface/95 px-5 py-4 backdrop-blur sm:px-6">
                <h3 className="text-lg font-bold text-heading">{title}</h3>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="tap-target -mr-2 flex items-center justify-center rounded-full p-2 text-muted transition hover:bg-slate-100 hover:text-heading"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
