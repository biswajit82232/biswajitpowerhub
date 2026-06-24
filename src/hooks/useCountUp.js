import { useEffect, useRef, useState } from 'react';

/**
 * Animate a number from 0 (or `from`) to `value` when `active` becomes true.
 * Uses requestAnimationFrame with an easeOut curve. Respects reduced motion.
 */
export function useCountUp(value, { duration = 1200, from = 0, active = true, decimals = 0 } = {}) {
  const [display, setDisplay] = useState(from);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!active) return;
    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    const target = Number(value) || 0;
    startRef.current = null;

    const tick = (ts) => {
      if (startRef.current == null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const current = from + (target - from) * eased;
      setDisplay(decimals ? Number(current.toFixed(decimals)) : Math.round(current));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, active, duration, from, decimals]);

  return display;
}
