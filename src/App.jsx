import { lazyRetry as lazy } from '@/lib/lazyRetry';
import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { BareAdsLayout } from '@/components/layout/BareAdsLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RouteLoader } from '@/components/ui/Loading';
import { SERVICE_LOCATIONS } from '@/data/locations';

// Public pages (lazy for code-splitting)
const Home = lazy(() => import('@/pages/public/Home'));
const Scooters = lazy(() => import('@/pages/public/Scooters'));
const ScooterDetails = lazy(() => import('@/pages/public/ScooterDetails'));
const Accessories = lazy(() => import('@/pages/public/Accessories'));
const AccessoryDetails = lazy(() => import('@/pages/public/AccessoryDetails'));
const Compare = lazy(() => import('@/pages/public/Compare'));
const Reviews = lazy(() => import('@/pages/public/Reviews'));
const Contact = lazy(() => import('@/pages/public/Contact'));
const About = lazy(() => import('@/pages/public/About'));
const Service = lazy(() => import('@/pages/public/Service'));
const FinancePage = lazy(() => import('@/pages/public/Finance'));
const OffersPage = lazy(() => import('@/pages/public/Offers'));
const Terms = lazy(() => import('@/pages/public/Terms'));
const Privacy = lazy(() => import('@/pages/public/Privacy'));
const NotFound = lazy(() => import('@/pages/public/NotFound'));
const BestElectricScooters = lazy(() => import('@/pages/public/seo/BestElectricScooters'));
const LowBudgetElectricScooters = lazy(() => import('@/pages/public/seo/LowBudgetElectricScooters'));
const NoLicenceElectricScooters = lazy(() => import('@/pages/public/seo/NoLicenceElectricScooters'));
const BatteryUpgrade = lazy(() => import('@/pages/public/seo/BatteryUpgrade'));
const TestRide = lazy(() => import('@/pages/public/seo/TestRide'));
const Guides = lazy(() => import('@/pages/public/Guides'));
const GuidePost = lazy(() => import('@/pages/public/GuidePost'));
const AdLanding = lazy(() => import('@/pages/public/AdLanding'));
const LocationPage = lazy(() => import('@/pages/public/seo/locationPages'));
const NearMeBerhampore = lazy(() => import('@/pages/public/seo/NearMeBerhampore'));
const BatteryScootyBerhampore = lazy(() => import('@/pages/public/seo/BatteryScootyBerhampore'));
const AreasWeServe = lazy(() => import('@/pages/public/AreasWeServe'));
const Social = lazy(() => import('@/pages/public/Social'));

// Admin (separate chunk)
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Inventory = lazy(() => import('@/pages/admin/Inventory'));
const AccessoryInventory = lazy(() => import('@/pages/admin/AccessoryInventory'));
const VyaparSync = lazy(() => import('@/pages/admin/VyaparSync'));
const Leads = lazy(() => import('@/pages/admin/Leads'));
const Callbacks = lazy(() => import('@/pages/admin/Callbacks'));
const TestRides = lazy(() => import('@/pages/admin/TestRides'));
const ServiceBookings = lazy(() => import('@/pages/admin/ServiceBookings'));
const AdminReviews = lazy(() => import('@/pages/admin/AdminReviews'));
const Messages = lazy(() => import('@/pages/admin/Messages'));
const Homepage = lazy(() => import('@/pages/admin/Homepage'));
const Finance = lazy(() => import('@/pages/admin/Finance'));
const Offers = lazy(() => import('@/pages/admin/Offers'));
const Settings = lazy(() => import('@/pages/admin/Settings'));
const Analytics = lazy(() => import('@/pages/admin/Analytics'));
const AdminNotFound = lazy(() => import('@/pages/admin/AdminNotFound'));

export default function App() {
  return (
    <Suspense fallback={<RouteLoader label="Loading" />}>
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="scooters" element={<Scooters />} />
        <Route path="scooters/:id" element={<ScooterDetails />} />
        <Route path="accessories" element={<Accessories />} />
        <Route path="accessories/:id" element={<AccessoryDetails />} />
        <Route path="compare" element={<Compare />} />
        <Route path="community" element={<Reviews />} />
        <Route path="reviews" element={<Navigate to="/community" replace />} />
        <Route path="about" element={<About />} />
        <Route path="service" element={<Service />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="contact" element={<Contact />} />
        <Route path="best-electric-scooters-berhampore" element={<BestElectricScooters />} />
        <Route path="low-budget-electric-scooters-berhampore" element={<LowBudgetElectricScooters />} />
        <Route path="no-licence-electric-scooters-west-bengal" element={<NoLicenceElectricScooters />} />
        <Route path="battery-upgrade-berhampore" element={<BatteryUpgrade />} />
        <Route path="test-ride-berhampore" element={<TestRide />} />
        <Route path="electric-scooter-near-me-berhampore" element={<NearMeBerhampore />} />
        <Route path="battery-scooty-berhampore" element={<BatteryScootyBerhampore />} />
        <Route path="e-scooty-berhampore" element={<Navigate to="/battery-scooty-berhampore" replace />} />
        <Route path="areas-we-serve" element={<AreasWeServe />} />
        {/* React Router can't treat ":slug" as dynamic when it's glued to a literal
            prefix ("electric-scooters-:slug" never matched) — register one static
            route per town instead so /electric-scooters-<town> resolves client-side. */}
        {SERVICE_LOCATIONS.map((location) => (
          <Route
            key={location.slug}
            path={`electric-scooters-${location.slug}`}
            element={<LocationPage slug={location.slug} />}
          />
        ))}
        <Route path="guides" element={<Guides />} />
        <Route path="guides/:slug" element={<GuidePost />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="social" element={<Social />} />
        <Route path="dealership" element={<Navigate to="/contact" replace />} />
        <Route path="updates" element={<Navigate to="/offers" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Ads landing — bare layout, noindex */}
      <Route element={<BareAdsLayout />}>
        <Route path="ad-landing" element={<AdLanding />} />
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="accessories" element={<AccessoryInventory />} />
        <Route path="vyapar" element={<VyaparSync />} />
        <Route path="leads" element={<Leads />} />
        <Route path="callbacks" element={<Callbacks />} />
        <Route path="test-rides" element={<TestRides />} />
        <Route path="service-bookings" element={<ServiceBookings />} />
        <Route path="messages" element={<Messages />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="offers" element={<Offers />} />
        <Route path="homepage" element={<Homepage />} />
        <Route path="finance" element={<Finance />} />
        <Route path="settings" element={<Settings />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="*" element={<AdminNotFound />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
