import { Link } from 'react-router-dom';
import { ScooterImage } from '@/components/common/ScooterImage';
import Button from '@/components/ui/Button';
import {
  formatBatteryCapacityRange,
  formatRangeRange,
} from '@/lib/scooterVariants';
import { cn } from '@/lib/utils';

/**
 * Dealer-style product card: light bg, uppercase name, 3-spec row, BOOK TEST RIDE + VIEW MORE.
 */
export function DealerProductCard({ scooter, imageOverride, className }) {
  if (!scooter) return null;
  const battery = formatBatteryCapacityRange(scooter);
  const range = formatRangeRange(scooter);
  const topSpeed = scooter.topSpeed ?? '—';
  const imgSrc = imageOverride || scooter.images?.[0];

  return (
    <article className={cn('flex h-full flex-col bg-white text-center', className)}>
      <Link to={`/scooters/${scooter.id}`} className="block bg-white px-2 pt-2">
        <ScooterImage
          src={imgSrc}
          alt={`${scooter.name} electric scooter at Biswajit Power Hub Berhampore`}
          hue={scooter.hue}
          name={scooter.name}
          width={600}
          height={400}
          loading="lazy"
          className="mx-auto aspect-[3/2] w-full max-w-full bg-white"
          fit="contain"
        />
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
