import { SEO } from '@/components/common/SEO';
import Button from '@/components/ui/Button';

/**
 * Thin noindex stub for legacy/internal URLs (/dealership).
 * Kept so old GSC entries don't 404 into redirect chains.
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
      <div className="relative overflow-hidden bg-sky-fade">
        <div className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-50" aria-hidden />
        <div className="container-px relative flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Coming soon</p>
          <h1 className="mt-3 font-display text-2xl font-extrabold text-heading sm:text-3xl">
            {heading || title}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-body">
            This page is not part of our public catalogue yet. For dealership or partnership questions,
            call or visit Biswajit Power Hub at Chunakhali Bus Stand, Berhampore.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/" variant="primary">
              Go home
            </Button>
            <Button to="/scooters" variant="secondary">
              View scooters
            </Button>
            <Button to="/contact" variant="ghost">
              Contact us
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
