import { useMemo } from 'react';
import { useAuth } from '../app/contexts/AuthContext';
import { ShieldIconSmall, DashboardQueryIcon, DashboardBlockIcon, DashboardDeviceIcon } from '../app/components/shared/icons';
import { useDashboard } from '../app/hooks/useDashboard';
import { StatCard, BarChart, ProgressBarList, ProteksiGlobal, DeviceAnakList, DashboardSkeleton } from '../app/components/features/dashboard';
import { Loading, InlineError } from '../app/components/shared';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, refresh, softRefresh, isRefreshing, toggleSafebrowsing } = useDashboard();

  const topActivities = useMemo(() =>
    (data?.top_activities ?? []).slice(0, 3).map((a) => ({
      label: a.domain,
      value: a.count,
      percentage: a.percentage,
    })), [data]);

  const categoriesBlocked = useMemo(() =>
    (data?.categories_blocked ?? []).slice(0, 3).map((c) => ({
      label: c.name,
      value: c.count,
      percentage: c.percentage,
    })), [data]);

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="flex h-[calc(100vh-128px)] items-center justify-center">
        <InlineError message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-5 md:gap-6">
      {(loading || isRefreshing) && data && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-white/60 lg:inset-y-0 lg:left-[256px] lg:right-0">
          <Loading message="Memuat..." size="sm" />
        </div>
      )}

      <div className={`flex flex-col gap-5 md:gap-6 ${loading || isRefreshing ? 'pointer-events-none select-none' : ''}`}>
        <section className="pb-2">
          <h1 className="font-['Roboto',sans-serif] text-[20px] font-bold tracking-[-0.5px] text-[#181c20] md:text-[24px]">
            {greeting()}, {user?.name ?? 'Pengguna'}.
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <ShieldIconSmall />
            <p className="font-['Roboto',sans-serif] text-xs text-[#414754] md:text-sm">
              Lindungi Keluargamu dari Bahaya Internet.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          <StatCard
            icon={<DashboardQueryIcon />}
            label="Permintaan Total"
            value={(data?.stats.total_queries ?? 0).toLocaleString()}
          />
          <StatCard
            icon={<DashboardBlockIcon />}
            label="Berhasil Diblokir"
            value={(data?.stats.blocked_count ?? 0).toLocaleString()}
            valueColor="#ba1a1a"
          />
          <StatCard
            icon={<DashboardDeviceIcon />}
            label="Device Aktif"
            value={data?.stats.active_devices ?? 0}
            valueColor="#1b6d24"
          />
        </section>

        <section className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-6">
          <div className="flex flex-col gap-5 md:col-span-2 md:gap-6">
            <div className="rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-['Roboto',sans-serif] text-[16px] font-medium text-[#181c20] md:text-[20px]">
                  Aktivitas Harian
                </h2>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#ebeef4] px-2 py-0.5 text-[10px] text-[#727785] md:px-3 md:py-1 md:text-xs">
                    24 Jam Terakhir
                  </span>
                  <button
                    onClick={softRefresh}
                    disabled={isRefreshing}
                    className="flex size-6 items-center justify-center rounded-full text-[#727785] transition-colors hover:bg-[#ebeef4] disabled:opacity-50 md:size-7"
                    aria-label="Muat ulang"
                  >
                    <svg
                      className={`size-3.5 md:size-4 ${isRefreshing ? 'animate-spin' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 2v6h-6" />
                      <path d="M3 12a9 9 0 0115.36-6.36L21 8" />
                      <path d="M3 22v-6h6" />
                      <path d="M21 12a9 9 0 01-15.36 6.36L3 16" />
                    </svg>
                  </button>
                </div>
              </div>
              <BarChart data={data?.time_series ?? []} />
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:gap-4">
              <ProgressBarList
                title="Aktivitas Terbanyak"
                items={topActivities}
                barColor="#005bbf"
              />
              <ProgressBarList
                title="Kategori Lalu Lintas"
                items={categoriesBlocked}
                barColor="#dd3635"
              />
            </div>
          </div>

          <div className="flex flex-col gap-5 md:col-span-1 md:gap-6">
            {data?.safebrowsing && (
              <ProteksiGlobal
                settings={data.safebrowsing}
                onToggle={toggleSafebrowsing}
              />
            )}
            <DeviceAnakList devices={data?.devices ?? []} />
          </div>
        </section>
      </div>
    </div>
  );
}

