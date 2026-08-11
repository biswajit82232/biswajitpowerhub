import LocationLanding from './LocationLanding';
import { getLocationBySlug } from '@/data/locations';

function makeLocationPage(slug) {
  return function LocationPage() {
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
