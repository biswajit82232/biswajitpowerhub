import { SEO } from '@/components/common/SEO';
import Button from '@/components/ui/Button';

/**
 * Thin noindex stub for legacy/internal URLs (/dealership, /updates).
 */
export default function InternalStub({ title = 'Internal page', heading, path = '/' }) {
  return (
    <>
      <SEO
        title={title}
        description="Internal page — not part of the public Biswajit Power Hub catalogue."
        path={path}
        noindex
        titleTemplate={false}
      />
      <div className="bg-white">
        <div className="container-px flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">Coming Soon</p>
          <h1 className="mt-3 font-display text-2xl font-extrabold uppercase tracking-wide text-navy sm:text-3xl">
            {heading || title}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-body">
            This page is not part of our public catalogue yet. For dealership or partnership questions,
            call or visit Biswajit Power Hub at Chunakhali Bus Stand, Berhampore.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/" variant="dealerPrimary">
              Go Home
            </Button>
            <Button to="/scooters" variant="dealerSecondary">
              View Scooters
            </Button>
            <Button to="/contact" variant="outline">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
