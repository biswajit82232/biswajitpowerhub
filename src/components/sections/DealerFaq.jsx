import { SITE_FAQS } from '@/data/seoContent';
import { useSite } from '@/context/SiteSettingsContext';

export function DealerFaq({ faqs, title = 'Frequently Asked Questions' }) {
  const { site } = useSite();
  const list = faqs?.length ? faqs : (site.faqs?.length ? site.faqs : SITE_FAQS);

  return (
    <section className="bg-white py-10 sm:py-14" aria-labelledby="dealer-faq-heading">
      <div className="container-px">
        <h2 id="dealer-faq-heading" className="dealer-section-title text-center">
          {title}
        </h2>
        <div className="mx-auto mt-8 max-w-3xl space-y-2">
          {list.map((f) => (
            <details
              key={f.question}
              className="group border border-line bg-white open:shadow-soft"
            >
              <summary className="cursor-pointer list-none px-4 py-3.5 text-sm font-bold text-navy marker:content-none sm:px-5 sm:text-base [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  {f.question}
                  <span className="text-brand-500 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="border-t border-line px-4 py-3 text-sm leading-relaxed text-body sm:px-5">
                {f.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
