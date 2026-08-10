import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 shadow-glow',
  solid:
    'bg-brand-500 text-white hover:bg-brand-600 shadow-glow',
  secondary:
    'bg-surface text-navy ring-1 ring-line hover:ring-navy/30 hover:bg-surface-alt',
  accent:
    'bg-navy text-white hover:bg-navy-600 shadow-soft',
  ghost:
    'bg-transparent text-body hover:bg-surface-alt hover:text-navy',
  outline:
    'bg-transparent text-navy ring-1 ring-navy/40 hover:bg-navy-50',
  whatsapp:
    'bg-[#25d366] text-white shadow-soft hover:brightness-105',
  directions:
    'bg-navy text-white shadow-soft hover:bg-navy-600',
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
  /** Dealer template — red uppercase CTA */
  dealerPrimary:
    'rounded-dealer bg-brand-500 text-white uppercase tracking-wide shadow-none hover:bg-brand-600 border border-brand-500',
  /** Dealer template — white / outline secondary */
  dealerSecondary:
    'rounded-dealer bg-white text-navy uppercase tracking-wide shadow-none hover:bg-surface-alt border border-line',
};

const SIZES = {
  xs: 'h-9 px-3 text-xs gap-1.5',
  sm: 'h-10 px-4 text-sm gap-1.5',
  md: 'h-12 px-5 text-[0.95rem] gap-2',
  lg: 'h-14 px-7 text-base gap-2.5',
  icon: 'h-14 w-14 p-0 text-2xl',
  dealer: 'h-10 px-4 text-xs font-bold gap-1.5 sm:h-11 sm:px-5 sm:text-sm',
};

const Button = forwardRef(function Button(
  {
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
    target: targetProp,
    rel: relProp,
    ...props
  },
  ref
) {
  const isDealer = variant === 'dealerPrimary' || variant === 'dealerSecondary';
  const classes = cn(
    'inline-flex items-center justify-center font-semibold tracking-tight whitespace-nowrap',
    'transition-all duration-200 ease-premium tap-target select-none',
    'focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
    isDealer ? 'rounded-dealer' : 'rounded-full',
    VARIANTS[variant],
    SIZES[isDealer && size === 'md' ? 'dealer' : size],
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

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    const isTel = /^tel:/i.test(href);
    const isSms = /^sms:/i.test(href);
    const target = targetProp ?? (isTel || isSms ? '_self' : '_blank');
    const rel = relProp ?? (target === '_blank' ? 'noopener noreferrer' : undefined);
    return (
      <a ref={ref} href={href} target={target} rel={rel} className={classes} {...props}>
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
