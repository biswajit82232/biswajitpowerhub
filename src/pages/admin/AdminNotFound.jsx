import { LayoutDashboard } from 'lucide-react';
import { AdminSEO } from '@/components/admin/AdminSEO';
import { AdminHeader } from '@/components/admin/AdminHeader';
import Button from '@/components/ui/Button';

export default function AdminNotFound() {
  return (
    <>
      <AdminSEO title="Page Not Found" />
      <AdminHeader title="Page not found" subtitle="This admin page doesn't exist." />
      <div className="flex flex-col items-center rounded-2xl bg-surface px-6 py-10 text-center ring-1 ring-line shadow-soft">
        <p className="font-display text-5xl font-extrabold text-heading">404</p>
        <p className="mt-2 max-w-sm text-sm text-muted">Check the URL or go back to the dashboard.</p>
        <Button to="/admin" variant="primary" icon={LayoutDashboard} className="mt-6">
          Dashboard
        </Button>
      </div>
    </>
  );
}
