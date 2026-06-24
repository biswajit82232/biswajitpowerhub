import { Home, Bike } from 'lucide-react';
import { SEO } from '@/components/common/SEO';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found" noindex />
      <div className="container-px flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-500">
          <Bike className="h-10 w-10" strokeWidth={1.6} />
        </span>
        <h1 className="mt-6 font-display text-display-xl font-extrabold text-heading">404</h1>
        <p className="mt-2 max-w-sm text-body">
          Looks like this page took a different route. Let's get you back on track.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button to="/" variant="primary" icon={Home}>
            Back home
          </Button>
          <Button to="/scooters" variant="secondary">
            Browse scooters
          </Button>
        </div>
      </div>
    </>
  );
}
