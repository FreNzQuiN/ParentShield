import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50">
      <h1 className="text-6xl font-bold text-neutral-300">404</h1>
      <p className="mt-4 text-lg text-neutral-600">Halaman tidak ditemukan</p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Kembali ke Halaman Utama
      </Link>
    </div>
  );
}
