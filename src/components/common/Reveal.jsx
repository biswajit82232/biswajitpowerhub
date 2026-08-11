import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

/**
 * Scroll-triggered reveal. Fades + slides up once when entering the viewport.
 * Safety timeout + reduced-motion so content never stays stuck at opacity 0.
 */
export function Reveal({ children, delay = 0, y = 12, className, as = 'div', once = true, amount = 0.05 }) {
  const MotionTag = motion[as] || motion.div;
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref, { once, amount, margin: '80px 0px' });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  const visible = reduceMotion || inView || timedOut;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={false}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: reduceMotion ? 0 : 0.4, delay: visible ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Staggered container — children fade up in sequence.
 * Use with <RevealItem> for each child.
 */
export function RevealGroup({ children, className, stagger = 0.08, once = true, amount = 0.05 }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once, amount, margin: '80px 0px' });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  const visible = reduceMotion || inView || timedOut;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={visible ? 'show' : 'hidden'}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduceMotion ? 0 : stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const revealItemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function RevealItem({ children, className, as = 'div' }) {
  const MotionTag = motion[as] || motion.div;
  const reduceMotion = useReducedMotion();
  return (
    <MotionTag
      className={className}
      variants={
        reduceMotion
          ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
          : revealItemVariants
      }
    >
      {children}
    </MotionTag>
  );
}
