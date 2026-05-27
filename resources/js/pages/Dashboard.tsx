import { useMemo } from 'react';
import { useAuth } from '../app/contexts/AuthContext';
import { ShieldIconSmall, DashboardQueryIcon, DashboardBlockIcon, DashboardDeviceIcon } from '../app/components/shared/icons';
import { useDashboard } from '../app/hooks/useDashboard';
import { StatCard, BarChart, ProgressBarList, KontrolParental, DashboardSkeleton } from '../app/components/features/dashboard';
import { LoadingOverlay, InlineError, RefreshBar } from '../app/components/shared';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

function GreetingHeader({ userName }: { userName: string | undefined }) {
  return (
    <section className="pb-2 pl-1 md:pl-2">
      <h1 className="text-xl font-bold tracking-[-0.5px] text-text-primary md:text-2xl">
        {greeting()}, {userName ?? 'Pengguna'}.
      </h1>
      <div className="mt-1 flex items-center gap-2">
        <ShieldIconSmall />
        <p className="text-xs text-text-secondary md:text-sm">
          Lindungi Keluargamu dari Bahaya Internet.
        </p>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error, lastRefresh, refresh, isRefreshing, toggleParentalControl } = useDashboard();

  const topActivities = useMemo(() =>
    (data?.top_activities ?? []).slice(0, 5).map((a) => ({
      label: a.domain,
      value: a.count,
      percentage: a.percentage,
    })), [data]);

  const sourcesBlocked = useMemo(() =>
    (data?.sources_blocked ?? []).slice(0, 5).map((s) => ({
      label: s.name,
      value: s.count,
      percentage: s.percentage,
    })), [data]);

  const deviceCounts = useMemo(() => {
    const all = data?.devices ?? [];
    const sixHoursAgo = Date.now() - 6 * 3600000;
    const active = all.filter((d) => d.is_online).length;
    const inactive = all.filter((d) => !d.is_online && d.last_seen !== null && d.last_seen < sixHoursAgo).length;
    return {
      total: all.length,
      active,
      inactive,
      needsSetup: all.length - active - inactive,
    };
  }, [data]);

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
      <LoadingOverlay visible={(loading || isRefreshing) && !!data} />

      <div className={`flex flex-col gap-5 md:gap-6 ${loading || isRefreshing ? 'pointer-events-none select-none' : ''}`}>
        <GreetingHeader userName={user?.name} />

        <RefreshBar
          onRefresh={refresh}
          isRefreshing={isRefreshing}
          lastRefresh={lastRefresh}
          disabled={loading}
          error={error}
        />

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
            valueColor="var(--color-danger)"
          />
          <StatCard
            icon={<DashboardDeviceIcon />}
            label="Perangkat"
            value={deviceCounts.total}
            valueColor={deviceCounts.total === 0 ? 'var(--color-text-muted)' : deviceCounts.needsSetup > 0 || deviceCounts.inactive > 0 ? 'var(--color-warning-text)' : 'var(--color-success)'}
            caption={
              deviceCounts.total > 0 && (deviceCounts.needsSetup > 0 || deviceCounts.inactive > 0)
                ? (
                  <span>
                    {deviceCounts.needsSetup > 0 && (
                      <span style={{ color: 'var(--color-primary)' }}>{deviceCounts.needsSetup} Perlu Setup</span>
                    )}
                    {deviceCounts.needsSetup > 0 && deviceCounts.inactive > 0 && <span>, </span>}
                    {deviceCounts.inactive > 0 && (
                      <span style={{ color: 'var(--color-warning-text)' }}>{deviceCounts.inactive} Tidak Aktif</span>
                    )}
                  </span>
                )
                : deviceCounts.total === 0
                  ? 'Belum ada perangkat. Selesaikan setup untuk memulai.'
                  : undefined
            }
          />
        </section>

        <section className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-6">
          <div className="flex flex-col gap-5 md:col-span-2 md:gap-6">
            <div className="rounded-xl border border-[rgba(193,198,214,0.2)] bg-white p-4 shadow-[0px_1px_1px_rgba(0,0,0,0.05)]">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[16px] font-medium text-text-primary md:text-xl">
                  Aktivitas Harian
                </h2>
                <span className="rounded-full bg-bg-tag px-2 py-0.5 text-[10px] text-text-muted md:px-3 md:py-1 md:text-xs">
                  24 Jam Terakhir
                </span>
              </div>
              <BarChart data={data?.time_series ?? []} />
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:gap-4">
              <ProgressBarList
                title="Aktivitas Terbanyak"
                items={topActivities}
                barColor="var(--color-primary)"
              />
              <ProgressBarList
                title="Kategori Sumber Blokir"
                items={sourcesBlocked}
                barColor="var(--color-danger-bar)"
              />
            </div>
          </div>

          <div className="flex flex-col gap-5 md:col-span-1 md:gap-6">
            {data?.parental_control && (
              <KontrolParental
                settings={data.parental_control}
                onToggle={toggleParentalControl}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
