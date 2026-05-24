import { useMemo } from 'react';
import { useAuth } from '../app/contexts/AuthContext';
import { ShieldIconSmall } from '../app/components/shared/icons';
import { useDashboard } from '../app/hooks/useDashboard';
import { StatCard, BarChart, ProgressBarList, ProteksiGlobal, DeviceAnakList } from '../app/components/features/dashboard';
import { Loading, InlineError } from '../app/components/shared';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

function QueryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1C4.58 1 1 4.58 1 9s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm1-9H8v5h2V6zm0 6H8v2h2v-2z" fill="#005bbf" />
    </svg>
  );
}

function BlockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1L2 4v5c0 4.5 3 8.5 7 9 4-.5 7-4.5 7-9V4L9 1zm0 2.5L14 5.7v3.3c0 3.3-2.1 6.4-5 7.3V3.5z" fill="#ba1a1a" />
    </svg>
  );
}

function DeviceStatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="1" width="14" height="16" rx="2" stroke="#1b6d24" strokeWidth="1.5" fill="none" />
      <circle cx="9" cy="13" r="1.5" fill="#1b6d24" />
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, refresh, toggleSafebrowsing } = useDashboard();

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

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-128px)] items-center justify-center">
        <Loading message="Memuat dashboard..." size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-128px)] items-center justify-center">
        <InlineError message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 md:gap-6">
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
          icon={<QueryIcon />}
          label="Permintaan Total"
          value={(data?.stats.total_queries ?? 0).toLocaleString()}
        />
        <StatCard
          icon={<BlockIcon />}
          label="Berhasil Diblokir"
          value={(data?.stats.blocked_count ?? 0).toLocaleString()}
          valueColor="#ba1a1a"
          caption={(data?.stats.blocked_categories ?? []).join(', ') || 'Belum ada'}
        />
        <div className="col-span-2 md:col-span-1">
          <StatCard
            icon={<DeviceStatIcon />}
            label="Device Aktif"
            value={data?.stats.active_devices ?? 0}
            valueColor="#1b6d24"
            caption={
              data?.devices
                ? data.devices.filter((d) => d.is_online).map((d) => d.name).join(', ') || 'Belum online'
                : ''
            }
          />
        </div>
      </section>

      <section className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-6">
        <div className="flex flex-col gap-5 md:col-span-2 md:gap-6">
          <div className="rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-['Roboto',sans-serif] text-[16px] font-medium text-[#181c20] md:text-[20px]">
                Aktivitas Harian
              </h2>
              <span className="rounded-full bg-[#ebeef4] px-2 py-0.5 text-[10px] text-[#727785] md:px-3 md:py-1 md:text-xs">
                24 Jam Terakhir
              </span>
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
  );
}
