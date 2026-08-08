import { Link } from 'react-router-dom';
import { SITE } from '@/config/site';
import { cn } from '@/lib/utils';

const LOGO_SRC = '/logo.png';
const LOGO_FALLBACK = '/logo-192.png';

/**
 * Brand mark: real BPH logo + full name + optional tagline.
 */
export function Logo({ to = '/', className, compact = false, light = false }) {
  return (
    <Link
      to={to}
      className={cn('group flex min-w-0 items-center gap-2.5', className)}
      aria-label={SITE.name}
    >
      <img
        src={LOGO_SRC}
        alt="Biswajit Power Hub (BPH) — Electric Scooter Dealership"
        width={160}
        height={160}
        loading="eager"
        decoding="async"
        onError={(e) => {
          if (e.currentTarget.src.includes(LOGO_FALLBACK)) return;
          e.currentTarget.src = LOGO_FALLBACK;
        }}
        className={cn(
          'h-9 w-auto max-w-[7.5rem] shrink-0 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:max-w-[9rem]',
          light
            ? 'rounded-lg bg-white px-1.5 py-1 shadow-sm ring-1 ring-white/25'
            : 'rounded-lg bg-white px-1.5 py-1 ring-1 ring-line/80',
        )}
      />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            'font-display text-[0.95rem] font-extrabold tracking-tight sm:text-base',
            light ? 'text-white' : 'text-heading',
          )}
        >
          BISWAJIT{' '}
          <span className={light ? 'text-accent-300' : 'text-gradient'}>POWER HUB</span>
        </span>
        {!compact && (
          <span
            className={cn(
              'mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em]',
              light ? 'text-white/70' : 'text-muted',
            )}
          >
            {SITE.tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
