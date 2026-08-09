import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-glow hover:bg-brand-700 hover:shadow-card-hover',
  solid:
    'bg-brand-600 text-white shadow-glow hover:bg-brand-700 hover:shadow-card-hover',
  secondary:
    'bg-surface text-heading ring-1 ring-line shadow-soft hover:ring-brand-200 hover:text-brand-700',
  accent:
    'bg-brand-500 text-white shadow-soft hover:bg-brand-600',
  ghost:
    'bg-transparent text-body hover:bg-brand-50 hover:text-brand-700',
  outline:
    'bg-transparent text-brand-700 ring-1.5 ring-brand-500/40 hover:bg-brand-50',
  whatsapp:
    'bg-[#25d366] text-white shadow-soft hover:brightness-105',
  directions:
    'bg-[#4285f4] text-white shadow-soft hover:bg-[#3367d6]',
  danger:
    'bg-red-500 text-white shadow-soft hover:bg-red-600',
  softSuccess:
    'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
  softDanger:
    'bg-red-50 text-red-500 hover:bg-red-100',
  softNeutral:
    'bg-slate-100 text-slate-600 hover:bg-slate-200',
  softBrand:
    'bg-brand-50 text-brand-600 hover:bg-brand-100',
};

const SIZES = {
  xs: 'h-9 px-3 text-xs gap-1.5',
  sm: 'h-10 px-4 text-sm gap-1.5',
  md: 'h-12 px-5 text-[0.95rem] gap-2',
  lg: 'h-14 px-7 text-base gap-2.5',
  icon: 'h-14 w-14 p-0 text-2xl',
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
    'inline-flex items-center justify-center rounded-full font-semibold tracking-tight whitespace-nowrap',
    'transition-all duration-300 ease-premium tap-target select-none',
    'focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full whitespace-normal text-center leading-snug',
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
    <button
      ref={ref}
      type={props.type || 'button'}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
});

export default Button;
