import { useMemo } from 'react';
import { SEO } from '@/components/common/SEO';
import { ExploreRange } from '@/components/sections/ExploreRange';
import { DealerFaq } from '@/components/sections/DealerFaq';
import { useAsync } from '@/hooks/useAsync';
import { getScooters } from '@/features/scooters/scooterService';
import { breadcrumbList, faqPageSchema, SCOOTER_FAQS } from '@/lib/schemaHelpers';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { SCOOTERS } from '@/data/scooters';

export default function Scooters() {
  const { data: scooters, loading } = useAsync(() => getScooters(), []);
  const list = scooters?.length ? scooters : SCOOTERS;

  const scootersJsonLd = useMemo(() => {
    const SEO_MODELS = [
      { id: 'activa', name: 'Activa Electric Scooter' },
      { id: 'zoom', name: 'Zoom Electric Scooter' },
      { id: 'single-light', name: 'Single Light Electric Scooter' },
      { id: 'double-light', name: 'Double Light Electric Scooter' },
    ];
    return [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Scooters', path: '/scooters' },
      ]),
      faqPageSchema(SCOOTER_FAQS),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Electric Scooters at Biswajit Power Hub',
        itemListElement: SEO_MODELS.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: s.name,
          url: `https://biswajitpowerhub.in/scooters/${s.id}`,
        })),
      },
    ];
  }, []);

  return (
    <>
      <SEO
        title="Electric Scooters in Berhampore | Activa, Zoom, Single & Double Light | BPH"
        description="Compare all low-speed electric scooters at Biswajit Power Hub. No licence required. Test rides available at Chunakhali, Berhampore."
        path="/scooters"
        jsonLd={scootersJsonLd}
        titleTemplate={false}
      />

      <section className="border-b border-line bg-white">
        <div className="container-px py-8 sm:py-10">
          <Breadcrumbs items={[{ name: 'Home', to: '/' }, { name: 'Scooters' }]} />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-500">Product</p>
          <h1 className="mt-2 font-display text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl">
            Explore Our Range
          </h1>
          <p className="mt-2 max-w-xl text-sm text-body sm:text-base">
            Premium electric scooters for every budget. Compare specs and book a free test ride at
            Chunakhali, Berhampore.
          </p>
        </div>
      </section>

      <ExploreRange scooters={list} loading={loading} title="All Models" />
      <DealerFaq faqs={SCOOTER_FAQS} title="Frequently Asked Questions" />
    </>
  );
}
