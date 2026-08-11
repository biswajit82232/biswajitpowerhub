import { Navigate, useParams } from 'react-router-dom';
import LocationLanding from './LocationLanding';
import { getLocationBySlug } from '@/data/locations';

/** Dynamic service-area page — /electric-scooters-:slug */
export default function LocationPage() {
  const { slug } = useParams();
  const location = getLocationBySlug(slug);
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
