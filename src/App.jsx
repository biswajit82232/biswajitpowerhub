import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

// Public pages (lazy for code-splitting)
const Home = lazy(() => import('@/pages/public/Home'));
const Scooters = lazy(() => import('@/pages/public/Scooters'));
const ScooterDetails = lazy(() => import('@/pages/public/ScooterDetails'));
const Compare = lazy(() => import('@/pages/public/Compare'));
const Reviews = lazy(() => import('@/pages/public/Reviews'));
const Contact = lazy(() => import('@/pages/public/Contact'));
const Terms = lazy(() => import('@/pages/public/Terms'));
const Privacy = lazy(() => import('@/pages/public/Privacy'));
const NotFound = lazy(() => import('@/pages/public/NotFound'));

// Admin (separate chunk)
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Inventory = lazy(() => import('@/pages/admin/Inventory'));
const Leads = lazy(() => import('@/pages/admin/Leads'));
const Callbacks = lazy(() => import('@/pages/admin/Callbacks'));
const TestRides = lazy(() => import('@/pages/admin/TestRides'));
const AdminReviews = lazy(() => import('@/pages/admin/AdminReviews'));
const Finance = lazy(() => import('@/pages/admin/Finance'));
const Offers = lazy(() => import('@/pages/admin/Offers'));
const Settings = lazy(() => import('@/pages/admin/Settings'));
const Analytics = lazy(() => import('@/pages/admin/Analytics'));

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="scooters" element={<Scooters />} />
        <Route path="scooters/:id" element={<ScooterDetails />} />
        <Route path="compare" element={<Compare />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
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
        <Route path="leads" element={<Leads />} />
        <Route path="callbacks" element={<Callbacks />} />
        <Route path="test-rides" element={<TestRides />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="offers" element={<Offers />} />
        <Route path="finance" element={<Finance />} />
        <Route path="settings" element={<Settings />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}
