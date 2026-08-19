import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { SEO } from '@/components/common/SEO';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Reveal } from '@/components/common/Reveal';
import { BLOG_POSTS } from '@/data/blogPosts';
import { breadcrumbList } from '@/lib/schemaHelpers';
import { SITE_URL } from '@/config/site';
import { useLocale } from '@/context/LocaleContext';

export default function Guides() {
  const { t } = useLocale();
  const path = '/guides';
  const jsonLd = useMemo(
    () => [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Guides', path },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Electric Scooter Guides — Berhampore & Murshidabad',
        url: `${SITE_URL}${path}`,
        description:
          'Practical guides on no-licence rules, running cost, battery upgrades, EMI, and first-time buying for Murshidabad riders.',
        hasPart: BLOG_POSTS.map((p) => ({
          '@type': 'Article',
          headline: p.title,
          url: `${SITE_URL}${p.path}`,
          datePublished: p.datePublished,
        })),
      },
    ],
    [],
  );

  return (
    <>
      <SEO
        title="EV Guides for Berhampore & Murshidabad | Power Hub"
        description="Guides for Murshidabad EV buyers: no-licence rules, electric vs petrol cost, battery upgrades, EMI tips, and first-time buyer checklist."
        path={path}
        jsonLd={jsonLd}
        titleTemplate={false}
      />
      <section className="border-b border-line bg-white">
        <div className="container-px py-10 sm:py-14">
          <Breadcrumbs items={[{ name: t('crumb.home'), to: '/' }, { name: t('page.guides') }]} />
          <Reveal>
            <h1 className="mt-4 font-display text-3xl font-extrabold uppercase tracking-wide text-navy sm:text-4xl">
              {t('guides.h1')}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-body sm:text-lg">
              {t('guides.sub')}
            </p>
          </Reveal>
        </div>
      </section>
      <div className="container-px py-10 sm:py-14">
        <ul className="mx-auto grid max-w-3xl gap-4">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug}>
              <Link
                to={post.path}
                className="block border border-line bg-white p-5 transition hover:border-brand-500 hover:shadow-soft sm:p-6"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-500">
                  {post.category}
                </p>
                <h2 className="mt-2 font-display text-lg font-bold uppercase tracking-wide text-navy sm:text-xl">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-body">{post.description}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {t('guides.read')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
