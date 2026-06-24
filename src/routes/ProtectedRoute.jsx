import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/ui/Loading';

export function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking access" />;
  if (!session) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children;
}
