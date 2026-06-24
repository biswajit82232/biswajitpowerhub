import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScooterImage } from '@/components/common/ScooterImage';
import { cn } from '@/lib/utils';

/**
 * Large product gallery with thumbnail strip. Falls back to branded
 * placeholders when no real images exist.
 */
export function ScooterGallery({ scooter }) {
  const images = scooter.images?.length ? scooter.images : [null, null, null];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-surface ring-1 ring-line shadow-soft">
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
              alt={`${scooter.name} view ${active + 1}`}
              hue={scooter.hue}
              name={scooter.name}
              loading="eager"
              fit="contain"
              className="aspect-[4/3] w-full bg-surface-alt"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                'shrink-0 overflow-hidden rounded-xl ring-2 transition',
                active === i ? 'ring-brand-500' : 'ring-line hover:ring-brand-200'
              )}
            >
              <ScooterImage
                src={img}
                alt=""
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
