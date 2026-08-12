import { useEffect, useRef, useState } from 'react';

/**
 * Mobile pull-to-refresh while scrolled to top.
 * onRefresh may return a Promise; refreshing clears when it settles.
 */
export function usePullToRefresh(onRefresh, { threshold = 48, maxPull = 64, disabled = false } = {}) {
  const [pullPx, setPullPx] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const active = useRef(false);
  const distance = useRef(0);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return undefined;

    const atTop = () => (window.scrollY || document.documentElement.scrollTop || 0) <= 2;

    const onStart = (e) => {
      if (refreshing) return;
      if (!atTop()) {
        active.current = false;
        return;
      }
      startY.current = e.touches[0].clientY;
      active.current = true;
      distance.current = 0;
    };

    const onMove = (e) => {
      if (!active.current || refreshing) return;
      if (!atTop()) {
        active.current = false;
        distance.current = 0;
        setPullPx(0);
        return;
      }
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        distance.current = 0;
        setPullPx(0);
        return;
      }
      const resisted = Math.min(maxPull, dy * 0.4);
      distance.current = resisted;
      setPullPx(resisted);
      if (resisted > 8) e.preventDefault();
    };

    const onEnd = () => {
      if (!active.current) return;
      active.current = false;
      const dist = distance.current;
      distance.current = 0;
      if (dist < threshold || refreshing) {
        setPullPx(0);
        return;
      }
      setRefreshing(true);
      setPullPx(Math.min(28, maxPull * 0.45));
      Promise.resolve()
        .then(() => onRefreshRef.current?.())
        .catch(() => {})
        .finally(() => {
          setRefreshing(false);
          setPullPx(0);
        });
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    document.addEventListener('touchcancel', onEnd);

    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);
    };
  }, [disabled, threshold, maxPull, refreshing]);

  return {
    pullPx,
    pulling: pullPx > 4 && !refreshing,
    refreshing,
    threshold,
  };
}
