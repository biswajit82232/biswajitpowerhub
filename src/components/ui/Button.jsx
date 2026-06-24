import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  primary:
    'bg-brand-gradient text-white shadow-soft hover:shadow-card-hover',
  solid:
    'bg-brand-600 text-white shadow-soft hover:bg-brand-700',
  secondary:
    'bg-surface text-heading ring-1 ring-line shadow-soft hover:ring-brand-200 hover:text-brand-700',
  accent:
    'bg-accent-500 text-white shadow-soft hover:bg-accent-600',
  ghost:
    'bg-transparent text-body hover:bg-brand-50 hover:text-brand-700',
  outline:
    'bg-transparent text-brand-700 ring-1.5 ring-brand-500/40 hover:bg-brand-50',
  whatsapp:
    'bg-[#25D366] text-white shadow-soft hover:brightness-105',
  danger:
    'bg-red-500 text-white shadow-soft hover:bg-red-600',
};

const SIZES = {
  sm: 'h-10 px-4 text-sm gap-1.5',
  md: 'h-12 px-5 text-[0.95rem] gap-2',
  lg: 'h-14 px-7 text-base gap-2.5',
};

const Button = forwardRef(function Button(
  {
    as,
    to,
    href,
    variant = 'primary',
    size = 'md',
    className,
    children,
    loading = false,
    disabled = false,
    fullWidth = false,
    icon: Icon,
    iconRight: IconRight,
    ...props
  },
  ref
) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-full font-semibold tracking-tight',
    'transition-all duration-300 ease-premium tap-target select-none',
    'focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className
  );

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-[1.1em] w-[1.1em] animate-spin" />
      ) : (
        Icon && <Icon className="h-[1.15em] w-[1.15em]" strokeWidth={2.2} />
      )}
      {children}
      {IconRight && !loading && (
        <IconRight className="h-[1.15em] w-[1.15em]" strokeWidth={2.2} />
      )}
    </>
  );

  // Internal route link
  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  // External link
  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        target={props.target || '_blank'}
        rel="noopener noreferrer"
        className={classes}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      type={props.type || 'button'}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </motion.button>
  );
});

export default Button;
