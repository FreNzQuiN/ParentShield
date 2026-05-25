import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastProvider';
import { AuthProvider } from './contexts/AuthProvider';
import { useAuth } from './contexts/AuthContext';
import { ToastContainer, Loading } from './components/shared';
import { ProtectedRoute, RequireApiKey } from './routes/guards';
import { AppLayout } from './components/features';
import { useEffect, type ReactNode } from 'react';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import Activity from '../pages/Activity';
import Devices from '../pages/Devices';
import Settings from '../pages/Settings';
import SetupApiKey from '../pages/SetupApiKey';
import ParentalControl from '../pages/ParentalControl';
import NotFound from '../pages/NotFound';

function GuestGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading size="lg" message="Memuat..." className="min-h-screen" />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function AppNavigateListener() {
  const navigate = useNavigate();
  const { onLogout } = useAuth();

  useEffect(() => {
    const handler = async (e: Event) => {
      const { path } = (e as CustomEvent<{ path: string }>).detail;
      if (path.startsWith('/login')) {
        try { await onLogout(); } catch { /* ignore */ }
      }
      navigate(path, { replace: true });
    };
    window.addEventListener('app:navigate', handler);
    return () => window.removeEventListener('app:navigate', handler);
  }, [navigate, onLogout]);

  return null;
}

function LogoutHandler() {
  const { onLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    onLogout().then(() => navigate('/login', { replace: true }));
  }, [onLogout, navigate]);

  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppNavigateListener />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
            <Route path="/register" element={<GuestGuard><Register /></GuestGuard>} />
            <Route path="/forgot-password" element={<GuestGuard><ForgotPassword /></GuestGuard>} />
            <Route path="/logout" element={<LogoutHandler />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/setup-api-key" element={<SetupApiKey />} />
              <Route element={<RequireApiKey />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/devices" element={<Devices />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/parental-control" element={<ParentalControl />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <ToastContainer />
    </ToastProvider>
  );
}

