import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { AccessoryImage } from '@/components/common/AccessoryImage';
import Button from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import { STOCK_LABELS } from '@/data/scooters';

export function AccessoryCard({ accessory, index = 0 }) {
  const stock = STOCK_LABELS[accessory.stock] || STOCK_LABELS.in_stock;

  return (
    <article
      className="flex h-full flex-col border border-line bg-white text-center shadow-soft"
      style={{ animationDelay: `${Math.min(index * 30, 150)}ms` }}
    >
      <Link to={`/accessories/${accessory.id}`} className="relative block bg-white p-3">
        <AccessoryImage
          src={accessory.images?.[0]}
          alt={accessory.name}
          hue={accessory.hue}
          name={accessory.name}
          className="aspect-[3/2] w-full bg-white"
          fit="contain"
        />
        <span className="absolute left-3 top-3 bg-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          {accessory.category}
        </span>
        <span className="absolute right-3 top-3 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy ring-1 ring-line">
          {stock.label}
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-3 pb-4 pt-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy sm:text-base">
          {accessory.name}
        </h3>
        {accessory.compatibility && (
          <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted">
            <Wrench className="h-3.5 w-3.5 shrink-0" />
            {accessory.compatibility}
          </p>
        )}
        <p className="mt-3 font-display text-xl font-extrabold text-body">
          {formatINR(accessory.price)}
        </p>
        <div className="mt-auto pt-3">
          <Button to={`/accessories/${accessory.id}`} variant="dealerPrimary" size="sm" fullWidth>
            View More
          </Button>
        </div>
      </div>
    </article>
  );
}
