import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MessageCircle, Wrench, Tag } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import { Reveal } from '@/components/common/Reveal';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { RouteLoader } from '@/components/ui/Loading';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { AccessoryImage } from '@/components/common/AccessoryImage';
import { getAccessoryById } from '@/features/accessories/accessoryService';
import { useAsync } from '@/hooks/useAsync';
import { formatINR } from '@/lib/utils';
import { STOCK_LABELS } from '@/data/scooters';
import { whatsappUrl, SITE_URL } from '@/config/site';
import { useSite } from '@/context/SiteSettingsContext';
import { trackEvent, EVENT } from '@/lib/tracking';

export default function AccessoryDetails() {
  const { id } = useParams();
  const { site } = useSite();
  const { data: accessory, loading } = useAsync(() => getAccessoryById(id), [id]);

  if (loading) {
    return (
      <RouteLoader label="Loading accessory">
        <div className="container-px py-10">
          <Skeleton className="h-4 w-32" />
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </RouteLoader>
    );
  }
  if (!accessory) {
    return (
      <div className="container-px py-20">
        <EmptyState
          title="Item not found"
          description="This accessory may have been removed."
          action={<Button to="/accessories" variant="primary">Back to accessories</Button>}
        />
      </div>
    );
  }

  const stock = STOCK_LABELS[accessory.stock] || STOCK_LABELS.in_stock;
  const waMessage = `Hi BISWAJIT POWER HUB, I'm interested in ${accessory.name} (${formatINR(accessory.price)}). Is it available?`;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: accessory.name,
    sku: accessory.id,
    url: `${SITE_URL}/accessories/${accessory.id}`,
    image: accessory.images?.[0] || `${SITE_URL}/logo-512.png`,
    description: accessory.description,
    category: accessory.category,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/accessories/${accessory.id}`,
      price: accessory.price,
      priceCurrency: 'INR',
      availability:
        accessory.stock === 'out_of_stock'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <SEO
        title={accessory.name}
        description={accessory.description || `${accessory.name} — ${accessory.category} for electric scooters.`}
        path={`/accessories/${accessory.id}`}
        jsonLd={productSchema}
      />

      <div className="container-px py-6 sm:py-10">
        <Link
          to="/accessories"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
        >
          <ChevronLeft className="h-4 w-4" />
          All accessories
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div className="overflow-hidden rounded-2xl ring-1 ring-line shadow-soft">
              <AccessoryImage
                src={accessory.images?.[0]}
                alt={accessory.name}
                hue={accessory.hue}
                name={accessory.name}
                className="aspect-square w-full"
                fit="contain"
              />
              {accessory.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-t border-line bg-surface-alt/50 p-3">
                  {accessory.images.map((url, i) => (
                    <img
                      key={url + i}
                      src={url}
                      alt={`${accessory.name} photo ${i + 1}`}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-line"
                    />
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-wrap gap-2">
              <Badge tone="brand">{accessory.category}</Badge>
              <Badge tone={stock.tone}>{stock.label}</Badge>
            </div>

            <h1 className="mt-4 font-display text-display-md font-extrabold text-heading">
              {accessory.name}
            </h1>

            {accessory.compatibility && (
              <p className="mt-3 flex items-center gap-2 text-sm text-body">
                <Wrench className="h-4 w-4 text-accent-500" />
                Fits: {accessory.compatibility}
              </p>
            )}

            <div className="mt-6 rounded-2xl bg-surface p-5 ring-1 ring-line">
              <p className="text-xs font-medium text-muted">Price</p>
              <p className="font-display text-4xl font-extrabold text-heading">
                {formatINR(accessory.price)}
              </p>
            </div>

            {accessory.description && (
              <div className="mt-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold text-heading">
                  <Tag className="h-5 w-5 text-brand-500" />
                  About this item
                </h2>
                <p className="mt-3 text-body leading-relaxed">{accessory.description}</p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                href={whatsappUrl(waMessage, site)}
                variant="whatsapp"
                size="lg"
                icon={MessageCircle}
                fullWidth
                onClick={() => trackEvent(EVENT.WHATSAPP_CLICK, { from: 'accessory-detail', accessoryId: accessory.id })}
              >
                Enquire on WhatsApp
              </Button>
              <Button to="/contact" variant="secondary" size="lg" fullWidth>
                Visit showroom
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
