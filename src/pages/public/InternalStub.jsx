import { Link } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';
import Button from '@/components/ui/Button';

/**
 * Thin noindex stub for legacy/internal URLs (/dealership, /updates).
 * Kept so old GSC entries don't 404 into redirect chains.
 */
export default function InternalStub({ title = 'Internal page', heading, path = '/' }) {
  return (
    <>
      <SEO title={title} path={path} noindex titleTemplate={false} />
      <div className="container-px flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold text-heading">{heading || title}</h1>
        <p className="mt-3 max-w-md text-sm text-muted">
          This page is for internal use and is not part of our public catalogue.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/" variant="primary">
            Go home
          </Button>
          <Button to="/scooters" variant="secondary">
            View scooters
          </Button>
          <Link to="/contact" className="text-sm font-semibold text-brand-700 underline-offset-2 hover:underline">
            Contact us
          </Link>
        </div>
      </div>
    </>
  );
}
