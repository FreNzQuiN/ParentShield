import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../../components/shared';

export default function RequireApiKey() {
  const { isAuthenticated, hasApiKey, loading } = useAuth();

  if (loading) {
    return <Loading size="lg" message="Memuat..." className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasApiKey) {
    return <Navigate to="/setup-api-key" replace />;
  }

  return <Outlet />;
}
