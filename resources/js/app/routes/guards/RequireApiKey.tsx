import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RequireApiKey() {
  const { isAuthenticated, hasApiKey, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasApiKey) {
    return <Navigate to="/setup-api-key" replace />;
  }

  return <Outlet />;
}
