import { Link } from 'react-router-dom';
import { ScooterImage } from '@/components/common/ScooterImage';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  formatBatteryCapacityRange,
  formatRangeRange,
} from '@/lib/scooterVariants';
import { STOCK_LABELS } from '@/data/scooters';
import { cn } from '@/lib/utils';

/**
 * Dealer-style product card with smart discovery badges (trending / value).
 */
export function DealerProductCard({ scooter, imageOverride, tags = [], className }) {
  if (!scooter) return null;
  const battery = formatBatteryCapacityRange(scooter);
  const range = formatRangeRange(scooter);
  const topSpeed = scooter.topSpeed ?? '—';
  const imgSrc = imageOverride || scooter.images?.[0];
  const stock = STOCK_LABELS[scooter.stock] || STOCK_LABELS.in_stock;

  return (
    <article
      className={cn('flex h-full flex-col bg-white text-center [content-visibility:auto] [contain-intrinsic-size:auto_28rem]', className)}
    >
      <Link to={`/scooters/${scooter.id}`} className="relative block bg-white px-2 pt-2">
        <ScooterImage
          src={imgSrc}
          alt={`${scooter.name} electric scooter at Biswajit Power Hub Berhampore`}
          hue={scooter.hue}
          name={scooter.name}
          width={600}
          height={450}
          loading="lazy"
          className="mx-auto aspect-[4/3] w-full max-w-full bg-surface-alt"
          fit="cover"
        />
        {(tags.length > 0 || scooter.noLicence || scooter.stock === 'out_of_stock' || scooter.stock === 'low_stock') && (
          <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap justify-start gap-1.5">
            {scooter.noLicence && <Badge tone="success">No Licence</Badge>}
            {(scooter.stock === 'out_of_stock' || scooter.stock === 'low_stock') && (
              <Badge tone={stock.tone}>{stock.label}</Badge>
            )}
            {tags.map((t) => (
              <Badge key={t.id || t.label} tone={t.tone || 'brand'}>{t.label}</Badge>
            ))}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-2 pb-5 pt-3">
        <h3 className="font-display text-base font-bold uppercase tracking-wide text-navy sm:text-lg">
          {scooter.name}
        </h3>

        <div className="mt-4 flex border-y border-black/10 py-3">
          <div className="dealer-spec-divider w-1/3 px-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
              Range
            </p>
            <p className="mt-1 text-xs font-bold text-body sm:text-sm">{range}</p>
          </div>
          <div className="dealer-spec-divider w-1/3 px-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
              Top Speed
            </p>
            <p className="mt-1 text-xs font-bold text-body sm:text-sm">{topSpeed} km/h</p>
          </div>
          <div className="dealer-spec-divider w-1/3 px-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
              Battery
            </p>
            <p className="mt-1 text-xs font-bold text-body sm:text-sm">{battery}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button to="/test-ride-berhampore" variant="dealerPrimary" size="sm">
            Book Test Ride
          </Button>
          <Button to={`/scooters/${scooter.id}`} variant="dealerSecondary" size="sm">
            View More
          </Button>
        </div>
      </div>
    </article>
  );
}
