import { Link } from 'react-router-dom';
import { SITE } from '@/config/site';
import { cn } from '@/lib/utils';

const LOGO_SRC = '/logo-192.png';

/**
 * Brand wordmark: BPH logo image + name + tagline.
 */
export function Logo({ to = '/', className, compact = false, light = false }) {
  return (
    <Link to={to} className={cn('group flex items-center gap-2.5', className)} aria-label={SITE.name}>
      <img
        src={LOGO_SRC}
        alt=""
        width={40}
        height={40}
        className={cn(
          'h-10 w-10 shrink-0 rounded-xl object-contain transition-transform duration-300 group-hover:scale-105',
          light && 'brightness-0 invert',
        )}
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-[0.95rem] font-extrabold tracking-tight sm:text-base',
            light ? 'text-white' : 'text-heading'
          )}
        >
          BISWAJIT{' '}
          <span className={light ? 'text-accent-300' : 'text-gradient'}>POWER HUB</span>
        </span>
        {!compact && (
          <span className={cn('mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em]', light ? 'text-white/70' : 'text-muted')}>
            {SITE.tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
