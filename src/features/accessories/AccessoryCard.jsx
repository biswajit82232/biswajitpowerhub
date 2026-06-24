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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-line shadow-soft transition-shadow duration-300 hover:shadow-card-hover"
    >
      <Link to={`/accessories/${accessory.id}`} className="relative block">
        <AccessoryImage
          src={accessory.images?.[0]}
          alt={accessory.name}
          hue={accessory.hue}
          name={accessory.name}
          className="aspect-[4/3] w-full bg-surface-alt transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2">
          <Badge tone="brand">{accessory.category}</Badge>
          <Badge tone={stock.tone}>{stock.label}</Badge>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-heading">{accessory.name}</h3>
        {accessory.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-body">{accessory.description}</p>
        )}
        {accessory.compatibility && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Wrench className="h-3.5 w-3.5 shrink-0" />
            {accessory.compatibility}
          </p>
        )}

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-muted">Price</p>
              <p className="font-display text-2xl font-extrabold text-heading">
                {formatINR(accessory.price)}
              </p>
            </div>
            <Link
              to={`/accessories/${accessory.id}`}
              className="tap-target inline-flex items-center gap-1 rounded-full bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 transition-all duration-300 group-hover:bg-brand-gradient group-hover:text-white"
              aria-label={`View details for ${accessory.name}`}
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
