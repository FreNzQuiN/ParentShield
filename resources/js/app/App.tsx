import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '../contexts/ToastProvider';
import { AuthProvider } from '../contexts/AuthProvider';
import { useAuth } from '../contexts/AuthContext';
import { ToastContainer } from '../components/shared';
import Landing from '../../pages/Landing';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import ForgotPassword from '../../pages/ForgotPassword';
import NotFound from '../../pages/NotFound';

function AuthRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <Login />;
}

function RegisterGuard() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <Register />;
}

function ForgotPasswordGuard() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />;
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<AuthRedirect />} />
            <Route path="/register" element={<RegisterGuard />} />
            <Route path="/forgot-password" element={<ForgotPasswordGuard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <ToastContainer />
    </ToastProvider>
  );
}
