import { TableSkeleton } from "#/components/ui/TableSkeleton";

export function PengeluaranSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat Catatan Pengeluaran" className="w-full pb-12">
      {/* Header Skeleton */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="shimmer-placeholder mb-1.5 h-3.5 w-36 rounded-sm" />
          <div className="shimmer-placeholder h-7 w-52 rounded-lg" />
          <div className="shimmer-placeholder mt-2 h-3.5 w-80 rounded-sm" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Filter Pills Skeleton */}
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] p-1">
            <div className="shimmer-placeholder h-7 w-16 rounded-full" />
            <div className="shimmer-placeholder h-7 w-16 rounded-full" />
            <div className="shimmer-placeholder h-7 w-16 rounded-full" />
          </div>

          {/* Button Catat Skeleton */}
          <div className="shimmer-placeholder h-9 w-36 rounded-full" />
        </div>
      </div>

      {/* 3 Metric Overview Cards Skeleton */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="shimmer-placeholder h-5 w-20 rounded-full" />
              <div className="shimmer-placeholder h-10 w-10 rounded-full" />
            </div>
            <div className="shimmer-placeholder mb-2 h-3.5 w-32 rounded-sm" />
            <div className="shimmer-placeholder mb-2 h-8 w-44 rounded-md" />
            <div className="shimmer-placeholder h-3 w-24 rounded-sm" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="shimmer-placeholder h-5 w-24 rounded-full" />
              <div className="shimmer-placeholder h-10 w-10 rounded-full" />
            </div>
            <div className="shimmer-placeholder mb-2 h-3.5 w-28 rounded-sm" />
            <div className="shimmer-placeholder mb-2 h-7 w-36 rounded-md" />
            <div className="shimmer-placeholder h-3 w-28 rounded-sm" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="doppelrand-shell sm:col-span-2 lg:col-span-1">
          <div className="doppelrand-core">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="shimmer-placeholder h-5 w-24 rounded-full" />
              <div className="shimmer-placeholder h-10 w-10 rounded-full" />
            </div>
            <div className="shimmer-placeholder mb-2 h-3.5 w-30 rounded-sm" />
            <div className="shimmer-placeholder mb-2 h-8 w-32 rounded-md" />
            <div className="shimmer-placeholder h-3 w-36 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Expense History Table Skeleton */}
      <TableSkeleton
        columnCount={6}
        rowCount={5}
        mobileCardCount={4}
        renderMobileCard={(idx) => (
          <div key={`exp-skel-card-${idx}`} className="flex flex-col gap-2.5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="shimmer-placeholder h-5 w-20 rounded-full" />
                <div className="shimmer-placeholder h-3.5 w-28 rounded-sm" />
              </div>
              <div className="shimmer-placeholder h-3 w-20 rounded-sm" />
            </div>

            <div className="flex items-center justify-between">
              <div className="shimmer-placeholder h-4 w-16 rounded-full" />
              <div className="shimmer-placeholder h-6 w-28 rounded-md" />
            </div>

            <div className="flex items-center justify-between border-t border-[var(--color-border)]/60 pt-2">
              <div className="shimmer-placeholder h-3 w-24 rounded-sm" />
              <div className="shimmer-placeholder h-7 w-16 rounded-md" />
            </div>
          </div>
        )}
      />
    </div>
  );
}
