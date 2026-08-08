import { Helmet } from 'react-helmet-async';
import { SITE, SITE_URL } from '@/config/site';

const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Per-page SEO: title, description, canonical, OG/Twitter, optional JSON-LD.
 * Pass `title` as the full document title (already includes brand when needed).
 * Or pass `titleTemplate={false}` with a short title and we won't append the site name.
 */
export function SEO({
  title,
  description,
  path = '',
  image,
  jsonLd,
  noindex = false,
  titleTemplate = true,
}) {
  const fullTitle = title
    ? titleTemplate && !title.includes(SITE.name) && !title.includes('Biswajit Power Hub')
      ? `${title} — ${SITE.name}`
      : title
    : `${SITE.name} — ${SITE.tagline}`;
  const desc = description || SITE.description;
  const normalizedPath = path === '/' ? '' : path.replace(/\/$/, '');
  const url = `${SITE_URL}${normalizedPath || ''}` || SITE_URL;
  const canonical = path === '/' || !normalizedPath ? `${SITE_URL}/` : `${SITE_URL}${normalizedPath}`;
  const ogImage = image || DEFAULT_OG_IMAGE;
  const schemas = jsonLd == null ? [] : Array.isArray(jsonLd) ? jsonLd : [jsonLd];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large" />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content="en_IN" />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url === SITE_URL ? `${SITE_URL}/` : url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
