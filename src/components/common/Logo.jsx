import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { SITE } from '@/config/site';
import { cn } from '@/lib/utils';

/**
 * Brand wordmark: gradient bolt badge + name + tagline.
 */
export function Logo({ to = '/', className, compact = false, light = false }) {
  return (
    <Link to={to} className={cn('group flex items-center gap-2.5', className)} aria-label={SITE.name}>
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-glow transition-transform duration-300 group-hover:scale-105">
        <Zap className="h-5 w-5 text-white" fill="currentColor" strokeWidth={1.5} />
      </span>
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
