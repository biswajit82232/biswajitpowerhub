import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gauge, BatteryCharging, ArrowRight } from 'lucide-react';
import { ScooterImage } from '@/components/common/ScooterImage';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import { emiFrom } from '@/lib/finance';
import { useFinance } from '@/context/FinanceSettingsContext';
import { STOCK_LABELS } from '@/data/scooters';
import { hasVariants, getStartingPrice } from '@/lib/scooterVariants';

export function ScooterCard({ scooter, index = 0, valueBadges = [], popularityTags = [], imageOverride }) {
  const { settings } = useFinance();
  const stock = STOCK_LABELS[scooter.stock] || STOCK_LABELS.in_stock;
  const startingPrice = getStartingPrice(scooter);
  const emi = emiFrom({ price: startingPrice, settings });
  const extraBadges = [...popularityTags, ...valueBadges.map((b) => ({
    label: `${b.emoji} ${b.label}`,
    tone: b.tone,
  }))];
  const imgSrc = imageOverride || scooter.images?.[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <Link to={`/scooters/${scooter.id}`} className="relative block">
        <ScooterImage
          src={imgSrc}
          alt={`${scooter.name} electric scooter at Biswajit Power Hub Berhampore`}
          hue={scooter.hue}
          name={scooter.name}
          width={600}
          height={400}
          loading="lazy"
          className="aspect-[3/2] w-full max-w-full bg-brand-50 transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2">
          {scooter.noLicence && <Badge tone="success">No Licence*</Badge>}
          <Badge tone={stock.tone}>{stock.label}</Badge>
          {extraBadges.slice(0, 1).map((b) => (
            <Badge key={b.label} tone={b.tone}>{b.label}</Badge>
          ))}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-bold text-heading">{scooter.name}</h3>
            <p className="break-words text-sm text-muted">{scooter.tagline}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-body">
          <span className="inline-flex items-center gap-1.5">
            <BatteryCharging className="h-4 w-4 text-brand-500" strokeWidth={2.2} />
            {scooter.range} km
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="h-4 w-4 text-sky-500" strokeWidth={2.2} />
            {scooter.topSpeed} km/h
          </span>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted">Starting at</p>
              <p className="font-display text-2xl font-extrabold text-heading">
                {formatINR(startingPrice)}
              </p>
              {hasVariants(scooter) && (
                <p className="mt-0.5 text-xs text-muted">Standard & Lithium Pro</p>
              )}
              <p className="mt-0.5 text-xs font-semibold text-brand-600">
                EMI from {formatINR(emi)}/mo
              </p>
            </div>
            <Button
              to={`/scooters/${scooter.id}`}
              variant="softBrand"
              size="sm"
              iconRight={ArrowRight}
              aria-label={`View details for ${scooter.name}`}
              className="rounded-xl group-hover:bg-brand-600 group-hover:text-white"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
