import { Reveal } from './Reveal';
import { cn } from '@/lib/utils';

/** Eyebrow + title + subtitle header block, center or left aligned. */
export function SectionHeading({ eyebrow, title, subtitle, align = 'center', className }) {
  const centered = align === 'center';
  return (
    <Reveal className={cn(centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl', className)}>
      {eyebrow && (
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-50 to-accent-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-700 ring-1 ring-brand-200/70 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-gradient" />
          {eyebrow}
        </span>
      )}
      <h2 className="text-display-lg font-extrabold text-heading">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-body sm:text-lg">{subtitle}</p>
      )}
    </Reveal>
  );
}

/** Vertical-rhythm section wrapper with optional alternate background. */
export function Section({ children, className, alt = false, id, tight = false }) {
  return (
    <section
      id={id}
      className={cn(
        tight ? 'py-12 sm:py-16' : 'py-16 sm:py-24',
        alt && 'bg-section-alt',
        className
      )}
    >
      <div className="container-px">{children}</div>
    </section>
  );
}
