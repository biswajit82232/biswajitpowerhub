import { Helmet } from 'react-helmet-async';
import { SITE, SITE_URL } from '@/config/site';

const DEFAULT_OG_IMAGE = `${SITE_URL}/logo-512.png`;

/**
 * Per-page SEO: title, description, canonical, OG/Twitter, optional JSON-LD.
 */
export function SEO({ title, description, path = '', image, jsonLd, noindex = false }) {
  const fullTitle = title ? `${title} — ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`;
  const desc = description || SITE.description;
  const url = `${SITE.url}${path}`;
  const ogImage = image || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large" />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content="en_IN" />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
