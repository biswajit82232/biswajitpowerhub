import { Helmet } from 'react-helmet-async';

/** Admin window title — never appends the public website brand. */
export function AdminSEO({ title }) {
  const full = title ? `${title} · Admin` : 'Admin';
  return (
    <Helmet>
      <title>{full}</title>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="theme-color" content="#2563EB" />
      <meta name="apple-mobile-web-app-title" content="BPH Admin" />
    </Helmet>
  );
}
