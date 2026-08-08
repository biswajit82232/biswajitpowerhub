import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useCountUp } from '@/hooks/useCountUp';
import { formatNumber } from '@/lib/utils';

/**
 * Counts up to `value` when scrolled into view.
 */
export function AnimatedCounter({ value, decimals = 0, prefix = '', suffix = '', className, duration = 1300 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const display = useCountUp(value, { active: inView, decimals, duration });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatNumber(display, { decimals })}
      {suffix}
    </span>
  );
}
