import { Link, Navigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';
import { getBlogPost, BLOG_POSTS } from '@/data/blogPosts';
import { breadcrumbList } from '@/lib/schemaHelpers';
import { SITE_URL, SITE } from '@/config/site';

export default function GuidePost() {
  const { slug } = useParams();
  const post = getBlogPost(slug);

  const jsonLd = useMemo(() => {
    if (!post) return [];
    return [
      breadcrumbList([
        { name: 'Home', path: '/' },
        { name: 'Guides', path: '/guides' },
        { name: post.title, path: post.path },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        datePublished: post.datePublished,
        dateModified: post.dateModified || post.datePublished,
        author: { '@type': 'Organization', name: SITE.name, url: SITE_URL },
        publisher: {
          '@type': 'Organization',
          name: SITE.name,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-512.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${post.path}` },
        image: `${SITE_URL}/og-image.png`,
      },
    ];
  }, [post]);

  if (!post) return <Navigate to="/guides" replace />;

  const others = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 4);

  return (
    <SeoLandingLayout
      title={`${post.title} | Biswajit Power Hub`}
      description={post.description}
      path={post.path}
      h1={post.h1}
      intro={post.intro}
      breadcrumbs={[
        { name: 'Home', to: '/' },
        { name: 'Guides', to: '/guides' },
        { name: post.category },
      ]}
      jsonLd={jsonLd}
    >
      {post.sections.map((s) => (
        <div key={s.h2}>
          <h2>{s.h2}</h2>
          <p>{s.p}</p>
        </div>
      ))}

      {post.related?.length ? (
        <>
          <h2>Related pages</h2>
          <ul>
            {post.related.map((r) => (
              <li key={r.to}>
                <Link to={r.to}>{r.label}</Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h2>More guides</h2>
      <ul>
        <li>
          <Link to="/guides">All electric scooter guides</Link>
        </li>
        {others.map((p) => (
          <li key={p.slug}>
            <Link to={p.path}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </SeoLandingLayout>
  );
}
