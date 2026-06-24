import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Premium surface card. Set `hover` for a subtle lift on pointer devices.
 */
export function Card({ children, className, hover = false, as = 'div', ...props }) {
  const base = cn(
    'rounded-2xl bg-surface ring-1 ring-line shadow-soft',
    hover && 'transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-card',
    className
  );

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className={cn(base, 'hover:shadow-card-hover')}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  const Tag = as;
  return (
    <Tag className={base} {...props}>
      {children}
    </Tag>
  );
}

export function CardBody({ children, className }) {
  return <div className={cn('p-5 sm:p-6', className)}>{children}</div>;
}
