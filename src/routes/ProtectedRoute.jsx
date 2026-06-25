import { Navigate, useLocation } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RouteLoader } from '@/components/ui/Loading';
import { isAdminEmail, adminAccessHint } from '@/lib/adminAccess';
import Button from '@/components/ui/Button';

function AdminAccessDenied() {
  const { signOut } = useAuth();
  const hint = adminAccessHint();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-alt px-6 text-center">
      <ShieldX className="h-12 w-12 text-red-500" strokeWidth={2} />
      <h1 className="mt-4 font-display text-xl font-bold text-heading">Admin access denied</h1>
      <p className="mt-2 max-w-md text-sm text-body">
        This account is not authorized to access the admin panel.
      </p>
      {hint && (
        <p className="mt-3 max-w-md text-xs text-muted">{hint}</p>
      )}
      <div className="mt-6 flex gap-3">
        <Button to="/" variant="secondary">Back to site</Button>
        <Button variant="primary" onClick={() => signOut()}>Sign out</Button>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <RouteLoader label="Checking access">
        <div />
      </RouteLoader>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdminEmail(session.user?.email)) {
    return <AdminAccessDenied />;
  }

  return children;
}
