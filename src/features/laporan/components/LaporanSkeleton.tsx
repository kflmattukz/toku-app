export function LaporanSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat Laporan Keuangan" className="w-full pb-12">
      {/* Header Skeleton */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="shimmer-placeholder mb-1.5 h-3.5 w-48 rounded-sm" />
          <div className="shimmer-placeholder h-7 w-64 rounded-lg" />
          <div className="shimmer-placeholder mt-2 h-3.5 w-96 rounded-sm" />
        </div>

        {/* Action Controls Skeleton */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter Pills */}
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] p-1">
            <div className="shimmer-placeholder h-7 w-16 rounded-full" />
            <div className="shimmer-placeholder h-7 w-16 rounded-full" />
            <div className="shimmer-placeholder h-7 w-16 rounded-full" />
          </div>

          {/* Export Button */}
          <div className="shimmer-placeholder h-8 w-28 rounded-md" />

          {/* Privacy Toggle */}
          <div className="shimmer-placeholder h-8 w-24 rounded-full" />
        </div>
      </div>

      {/* Row 1: 4 Main P&L Stat Cards (Omset, HPP, Laba Kotor, Laba Bersih) */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={`pnl-card-${idx}`} className="doppelrand-shell">
            <div className="doppelrand-core">
              <div className="mb-3.5 flex items-center justify-between">
                <div className="shimmer-placeholder h-5 w-24 rounded-full" />
                <div className="shimmer-placeholder h-9 w-9 rounded-full" />
              </div>
              <div className="shimmer-placeholder mb-2 h-3.5 w-28 rounded-sm" />
              <div className="shimmer-placeholder mb-2 h-7 w-36 rounded-md" />
              <div className="shimmer-placeholder h-3 w-20 rounded-sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: 4 Secondary Operational Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={`sec-card-${idx}`}
            className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs sm:p-5"
          >
            <div className="flex items-center justify-between">
              <div className="shimmer-placeholder h-3.5 w-24 rounded-sm" />
              <div className="shimmer-placeholder h-8 w-8 rounded-full" />
            </div>
            <div className="shimmer-placeholder mt-3 h-7 w-28 rounded-md" />
            <div className="shimmer-placeholder mt-2 h-3 w-32 rounded-sm" />
          </div>
        ))}
      </div>

      {/* Trend Chart Card Skeleton */}
      <div className="mb-6 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="shimmer-placeholder mb-1 h-5 w-44 rounded-sm" />
            <div className="shimmer-placeholder h-3 w-56 rounded-sm" />
          </div>
          <div className="flex items-center gap-2">
            <div className="shimmer-placeholder h-6 w-20 rounded-full" />
            <div className="shimmer-placeholder h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="shimmer-placeholder h-60 w-full rounded-xl" />
      </div>

      {/* Top Products Leaderboard Skeleton */}
      <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="shimmer-placeholder mb-1 h-5 w-48 rounded-sm" />
            <div className="shimmer-placeholder h-3 w-64 rounded-sm" />
          </div>
          <div className="shimmer-placeholder h-6 w-24 rounded-full" />
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={`leaderboard-skel-${idx}`}
              className="flex items-center justify-between py-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="shimmer-placeholder h-7 w-7 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <div className="shimmer-placeholder h-4 w-36 rounded-sm" />
                  <div className="shimmer-placeholder h-3 w-20 rounded-sm" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="shimmer-placeholder h-4 w-24 rounded-sm" />
                <div className="shimmer-placeholder h-3 w-16 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
