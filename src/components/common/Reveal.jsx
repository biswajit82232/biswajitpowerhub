import { motion } from 'framer-motion';

/**
 * Scroll-triggered reveal. Fades + slides up once when entering the viewport.
 */
export function Reveal({ children, delay = 0, y = 18, className, as = 'div', once = true, amount = 0.2 }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Staggered container — children fade up in sequence.
 * Use with <RevealItem> for each child.
 */
export function RevealGroup({ children, className, stagger = 0.08, once = true, amount = 0.15 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const revealItemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export function RevealItem({ children, className, as = 'div' }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag className={className} variants={revealItemVariants}>
      {children}
    </MotionTag>
  );
}
