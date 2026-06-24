import { useEffect, useRef, useState } from 'react';

/**
 * Animate a number toward `value` when it changes.
 * Continues from the last settled value, not from zero.
 */
export function useCountUp(value, { duration = 1200, active = true, decimals = 0 } = {}) {
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(target);
  const settledRef = useRef(target);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      settledRef.current = target;
      setDisplay(target);
      return;
    }

    if (settledRef.current === target) {
      setDisplay(target);
      return;
    }

    const start = settledRef.current;
    startRef.current = null;

    const tick = (ts) => {
      if (startRef.current == null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = start + (target - start) * eased;
      const next = decimals ? Number(current.toFixed(decimals)) : Math.round(current);
      setDisplay(next);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        settledRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, active, duration, decimals]);

  return display;
}
