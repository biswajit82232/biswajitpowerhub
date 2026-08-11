import { Home, Bike } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';
import Button from '@/components/ui/Button';

export default function NotFound() {
  const location = useLocation();
  return (
    <>
      <SEO
        title="Page Not Found | Biswajit Power Hub"
        description="This page does not exist. Browse electric scooters or visit our Berhampore showroom."
        path={location.pathname}
        noindex
        titleTemplate={false}
      />
      <div className="bg-white">
        <div className="container-px flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center border-2 border-navy text-navy">
            <Bike className="h-8 w-8" strokeWidth={1.6} />
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-brand-500">404</p>
          <h1 className="mt-2 font-display text-display-xl font-extrabold uppercase tracking-wide text-navy">
            Page Not Found
          </h1>
          <p className="mt-3 max-w-sm text-body">
            Looks like this page took a different route. Browse scooters or head back home.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/" variant="dealerPrimary" icon={Home}>
              Back Home
            </Button>
            <Button to="/scooters" variant="dealerSecondary">
              Browse Scooters
            </Button>
            <Button to="/contact" variant="outline">
              Contact Showroom
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
