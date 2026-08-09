import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Wrench } from 'lucide-react';
import { AccessoryImage } from '@/components/common/AccessoryImage';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import { STOCK_LABELS } from '@/data/scooters';

export function AccessoryCard({ accessory, index = 0 }) {
  const stock = STOCK_LABELS[accessory.stock] || STOCK_LABELS.in_stock;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.15), ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-xl bg-surface ring-1 ring-line shadow-soft transition hover:shadow-card-hover"
    >
      <Link to={`/accessories/${accessory.id}`} className="relative block">
        <AccessoryImage
          src={accessory.images?.[0]}
          alt={accessory.name}
          hue={accessory.hue}
          name={accessory.name}
          className="aspect-[3/2] w-full bg-surface-alt"
        />
        <div className="absolute left-2.5 top-2.5 flex max-w-[calc(100%-1.25rem)] flex-wrap gap-1.5">
          <Badge tone="brand">{accessory.category}</Badge>
          <Badge tone={stock.tone}>{stock.label}</Badge>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-bold text-heading">{accessory.name}</h3>
        {accessory.compatibility && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <Wrench className="h-3.5 w-3.5 shrink-0" />
            {accessory.compatibility}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="font-display text-xl font-extrabold text-heading">
            {formatINR(accessory.price)}
          </p>
          <Link
            to={`/accessories/${accessory.id}`}
            className="tap-target inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white"
            aria-label={`View details for ${accessory.name}`}
          >
            View
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
