import { Reveal } from './Reveal';
import { cn } from '@/lib/utils';

/** Eyebrow + title + subtitle header block, center or left aligned. */
export function SectionHeading({ eyebrow, title, subtitle, align = 'center', className }) {
  const centered = align === 'center';
  return (
    <Reveal className={cn(centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl', className)}>
      {eyebrow && (
        <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-brand-700">
          {eyebrow}
        </p>
      )}
      <h2 className="text-display-lg font-extrabold text-heading">{title}</h2>
      {subtitle && (
        <p className="mt-3 text-base leading-relaxed text-body sm:mt-4 sm:text-lg">{subtitle}</p>
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
