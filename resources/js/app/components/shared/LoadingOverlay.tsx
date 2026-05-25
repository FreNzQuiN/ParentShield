import Loading from './Loading';

export default function LoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-white/60">
      <Loading message="Memuat..." size="sm" />
    </div>
  );
}
