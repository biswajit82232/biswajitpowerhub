import { Navigate, useLocation, useParams } from 'react-router-dom';
import LocationLanding from './LocationLanding';
import { getLocationBySlug, getLocationByPath } from '@/data/locations';

/**
 * Service-area page for /electric-scooters-<town>.
 * Routes are registered one-per-town with a literal path, so `slug` arrives as a
 * prop; the param/pathname lookups are fallbacks for any other mount point.
 */
export default function LocationPage({ slug: slugProp }) {
  const params = useParams();
  const { pathname } = useLocation();
  const location =
    getLocationBySlug(slugProp ?? params.slug) || getLocationByPath(pathname);
  if (!location) return <Navigate to="/" replace />;
  return <LocationLanding location={location} />;
}

/** @deprecated named exports kept for any direct imports */
function makeLocationPage(slug) {
  return function NamedLocationPage() {
    const location = getLocationBySlug(slug);
    if (!location) return null;
    return <LocationLanding location={location} />;
  };
}

export const ElectricScootersKandi = makeLocationPage('kandi');
export const ElectricScootersJiaganj = makeLocationPage('jiaganj');
export const ElectricScootersBeldanga = makeLocationPage('beldanga');
export const ElectricScootersLalbagh = makeLocationPage('lalbagh');
export const ElectricScootersDomkal = makeLocationPage('domkal');
