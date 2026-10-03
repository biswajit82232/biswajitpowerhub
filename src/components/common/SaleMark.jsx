import { formatINR, cn } from '@/lib/utils';
import { useLocale } from '@/context/LocaleContext';

/**
 * List price struck through, sale price large, amount saved.
 * When the scooter is not on sale, renders the list price only.
 */
export function SalePriceStack({ quote, size = 'lg', align = 'start', className, showListWhenRegular = true, caption = true }) {
  const { t } = useLocale();
  if (!quote) return null;
  const alignClass = align === 'center' ? 'items-center text-center' : 'items-start text-left';
  const saleSize = size === 'xl'
    ? 'text-3xl sm:text-4xl'
    : size === 'md'
      ? 'text-2xl'
      : size === 'sm'
        ? 'text-lg'
        : 'text-lg';

  if (!quote.onSale) {
    if (!showListWhenRegular) return null;
    return (
      <p className={cn('font-display font-extrabold text-heading', saleSize, className)}>
        {formatINR(quote.list)}
      </p>
    );
  }

  return (
    <div className={cn('flex flex-col', alignClass, className)}>
      {caption ? (
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-600">
          {t('card.salePrice')}
        </p>
      ) : null}
      <p className="text-sm font-medium text-muted line-through decoration-red-400">
        {t('card.was')} {formatINR(quote.list)}
      </p>
      <p className={cn('font-display font-extrabold leading-none text-red-600', saleSize)}>
        {formatINR(quote.sale)}
      </p>
      <p className="mt-1 text-xs font-bold text-emerald-700">
        {t('card.save', { amount: formatINR(quote.saved) })}
      </p>
    </div>
  );
}
