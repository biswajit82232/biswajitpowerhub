import { useLocale } from '@/context/LocaleContext';
import { cn } from '@/lib/utils';

export function LanguageToggle({ className, compact = false }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-dealer border border-line bg-white p-0.5',
        className,
      )}
      role="group"
      aria-label={t('lang.switch')}
    >
      {[
        { id: 'en', label: t('lang.en') },
        { id: 'bn', label: t('lang.bn') },
      ].map((opt) => {
        const active = locale === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setLocale(opt.id)}
            className={cn(
              'rounded-[4px] font-bold uppercase tracking-wide transition',
              compact ? 'px-1.5 py-1 text-[10px]' : 'px-2 py-1 text-[11px]',
              active ? 'bg-navy text-white' : 'text-muted hover:text-navy',
            )}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
