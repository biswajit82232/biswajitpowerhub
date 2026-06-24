import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gauge, BatteryCharging, ArrowRight } from 'lucide-react';
import { ScooterImage } from '@/components/common/ScooterImage';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import { emiFrom } from '@/lib/finance';
import { useFinance } from '@/context/FinanceSettingsContext';
import { STOCK_LABELS } from '@/data/scooters';

export function ScooterCard({ scooter, index = 0, valueBadges = [], popularityTags = [] }) {
  const { settings } = useFinance();
  const stock = STOCK_LABELS[scooter.stock] || STOCK_LABELS.in_stock;
  const emi = emiFrom({ price: scooter.price, settings });
  const extraBadges = [...popularityTags, ...valueBadges.map((b) => ({
    label: `${b.emoji} ${b.label}`,
    tone: b.tone,
  }))];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-line shadow-soft transition-shadow duration-300 hover:shadow-card-hover"
    >
      <Link to={`/scooters/${scooter.id}`} className="relative block">
        <ScooterImage
          src={scooter.images?.[0]}
          alt={`${scooter.name} electric scooter`}
          hue={scooter.hue}
          name={scooter.name}
          className="aspect-[4/3] w-full bg-surface-alt transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2">
          <Badge tone={stock.tone}>{stock.label}</Badge>
          {scooter.noLicence && <Badge tone="brand">No Licence*</Badge>}
          {extraBadges.slice(0, 2).map((b) => (
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
            <BatteryCharging className="h-4 w-4 text-accent-500" strokeWidth={2.2} />
            {scooter.range} km
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="h-4 w-4 text-brand-500" strokeWidth={2.2} />
            {scooter.topSpeed} km/h
          </span>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Starting at</p>
              <p className="font-display text-2xl font-extrabold text-heading">
                {formatINR(scooter.price)}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-accent-600">
                EMI from {formatINR(emi)}/mo
              </p>
            </div>
            <Link
              to={`/scooters/${scooter.id}`}
              className="tap-target inline-flex items-center gap-1 rounded-full bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-all duration-300 group-hover:bg-brand-gradient group-hover:text-white"
              aria-label={`View details for ${scooter.name}`}
            >
              View
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
