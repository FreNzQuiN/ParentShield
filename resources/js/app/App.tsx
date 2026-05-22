import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../contexts/ToastProvider';
import { ToastContainer } from '../components/shared';
import Landing from '../../pages/Landing';
import NotFound from '../../pages/NotFound';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </ToastProvider>
  );
}
