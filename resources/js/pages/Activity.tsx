import { useState, useEffect, useMemo } from 'react';
import { useActivityLog } from '../app/hooks/useActivityLog';
import { fetchDevices } from '../app/services/api/devices';
import { ActivityFilters, ActivityTable, ActivityPagination, ActivitySkeleton } from '../app/components/features/activity';
import { RefreshBar, InlineError, EmptyState } from '../app/components/shared';
import type { DeviceDetail } from '../app/types/device';

function PageHeader() {
  return (
    <section className="pb-2 pl-1 md:pl-2">
      <h1 className="text-xl font-bold tracking-[-0.5px] text-text-primary md:text-2xl">
        Log Aktivitas
      </h1>
      <p className="mt-1 text-xs text-text-secondary md:text-sm">
        Riwayat permintaan DNS dari perangkat Anda.
      </p>
    </section>
  );
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function DataTruncationBanner({ coverageOldest }: { coverageOldest: number }) {
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-orange-800">
      Data paling lama ditampilkan mulai <span className="font-semibold">{formatDate(coverageOldest)}</span>.
      Data sebelum itu tidak termuat karena keterbatasan jumlah data.
      Gunakan rentang lebih spesifik (fitur <span className="font-semibold">Kustom</span>) untuk data yang lebih lama.
    </div>
  );
}

export default function Activity() {
  const { entries, displayEntries, loading, error, lastRefresh, isRefreshing, filters, setFilters, refresh, goToPage, currentPage, totalPages, hasPrev, hasNext, limit, setLimit, dataTruncated, coverageNewest, coverageOldest } = useActivityLog();

  const [devices, setDevices] = useState<DeviceDetail[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [devicesError, setDevicesError] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices()
      .then((res) => setDevices(res.devices))
      .catch(() => setDevicesError('Gagal memuat daftar perangkat.'))
      .finally(() => setDevicesLoading(false));
  }, []);

  const deviceMap = useMemo(() => {
    const map: Record<string, string> = {};
    devices.forEach((d) => { map[d.id] = d.name; });
    return map;
  }, [devices]);

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <PageHeader />

      <RefreshBar
        onRefresh={refresh}
        isRefreshing={isRefreshing}
        lastRefresh={lastRefresh}
        disabled={loading}
        error={error}
      />

      <ActivityFilters
        filters={filters}
        onFiltersChange={setFilters}
        devices={devices}
        devicesLoading={devicesLoading}
        devicesError={devicesError}
        bufferStart={coverageOldest}
        bufferEnd={coverageNewest}
      />

      {dataTruncated && coverageOldest && displayEntries.length > 0 && <DataTruncationBanner coverageOldest={coverageOldest} />}

      {loading && entries.length === 0 ? (
        <ActivitySkeleton />
      ) : error && entries.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center">
          <InlineError message={error} onRetry={refresh} />
        </div>
      ) : displayEntries.length === 0 && entries.length > 0 ? (
        <EmptyState
          title="Tidak Ada Data Sesuai Filter"
          description="Tidak ada entri yang cocok dengan filter yang dipilih."
          action={{ label: 'Reset Filter', onClick: () => setFilters({ search: '', timeFrom: null, timeTo: null, period: '1h', devices: [], statuses: [] }) }}
        />
      ) : entries.length === 0 && !loading ? (
        <EmptyState
          title="Belum Ada Data Log"
          description="Belum ada aktivitas DNS yang tercatat untuk periode ini."
          action={{ label: 'Muat Ulang', onClick: refresh }}
        />
      ) : (
        <>
          <ActivityTable
            entries={displayEntries}
            deviceMap={deviceMap}
            loading={isRefreshing}
          />
          <ActivityPagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasPrev={hasPrev}
            hasNext={hasNext}
            loading={isRefreshing}
            onGoToPage={goToPage}
            limit={limit}
            onLimitChange={setLimit}
          />
        </>
      )}
    </div>
  );
}