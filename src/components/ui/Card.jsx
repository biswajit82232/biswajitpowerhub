import { cn } from '@/lib/utils';

/**
 * Premium surface card. Set `hover` for a subtle lift on pointer devices.
 * CSS-only hover to keep list pages light (no Framer on every card).
 */
export function Card({ children, className, hover = false, as = 'div', ...props }) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        'rounded-2xl bg-surface ring-1 ring-line shadow-soft',
        hover &&
          'transition-all duration-300 ease-premium will-change-transform hover:-translate-y-1.5 hover:shadow-card-hover hover:ring-brand-100',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardBody({ children, className }) {
  return <div className={cn('p-5 sm:p-6', className)}>{children}</div>;
}
