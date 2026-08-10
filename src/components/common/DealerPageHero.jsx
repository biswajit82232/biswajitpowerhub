import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { cn } from '@/lib/utils';

/**
 * Consistent dealer-style page header for public routes.
 */
export function DealerPageHero({
  eyebrow,
  title,
  subtitle,
  breadcrumbs,
  children,
  className,
}) {
  return (
    <section className={cn('border-b border-line bg-white', className)}>
      <div className="container-px py-8 sm:py-10">
        {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
        {eyebrow ? (
          <p
            className={cn(
              'text-xs font-bold uppercase tracking-[0.2em] text-brand-500',
              breadcrumbs?.length ? 'mt-4' : '',
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            'font-display text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl',
            eyebrow || breadcrumbs?.length ? 'mt-2' : '',
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body sm:text-base">{subtitle}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
