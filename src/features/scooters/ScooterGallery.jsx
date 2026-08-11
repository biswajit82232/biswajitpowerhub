import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScooterImage } from '@/components/common/ScooterImage';
import { cn } from '@/lib/utils';

/**
 * Product gallery — single intentional frame when no/one photo; thumbs only for 2+ real images.
 */
export function ScooterGallery({ scooter }) {
  const realImages = (scooter.images || []).filter(Boolean);
  const images = realImages.length ? realImages : [null];
  const [active, setActive] = useState(0);
  const isPlaceholderOnly = realImages.length === 0;

  return (
    <div>
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl bg-surface shadow-card ring-1 ring-line',
          isPlaceholderOnly && 'ring-brand-100',
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ScooterImage
              src={images[active]}
              alt={scooter.name}
              hue={scooter.hue}
              name={scooter.name}
              loading="eager"
              width={900}
              height={720}
              fit="cover"
              className={cn(
                'w-full bg-surface-alt',
                realImages.length <= 1 ? 'aspect-[4/3]' : 'aspect-[4/3]',
              )}
            />
          </motion.div>
        </AnimatePresence>
        {isPlaceholderOnly && (
          <p className="border-t border-line bg-surface-alt/80 px-4 py-2.5 text-center text-xs text-muted">
            Showroom photos coming soon — visit Chunakhali to see the {scooter.name} in person
          </p>
        )}
      </div>

      {realImages.length > 1 && (
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
          {realImages.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                'shrink-0 overflow-hidden rounded-xl ring-2 transition',
                active === i ? 'ring-brand-500' : 'ring-line hover:ring-brand-200',
              )}
            >
              <ScooterImage
                src={img}
                alt={`${scooter.name} photo ${i + 1}`}
                hue={scooter.hue}
                className="h-16 w-20 sm:h-20 sm:w-24"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
