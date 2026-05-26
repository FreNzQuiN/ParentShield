import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-page">
      <h1 className="text-6xl font-bold text-text-muted">404</h1>
      <p className="mt-4 text-lg text-text-secondary">Halaman tidak ditemukan</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
      >
        Kembali ke Halaman Utama
      </Link>
    </div>
  );
}
