import { TableSkeleton } from "#/components/ui/TableSkeleton";

export function TransaksiSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat Riwayat Transaksi" className="w-full pb-12">
      {/* Header Skeleton */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="shimmer-placeholder mb-1.5 h-3.5 w-28 rounded-sm" />
          <div className="shimmer-placeholder h-7 w-48 rounded-lg" />
          <div className="shimmer-placeholder mt-2 h-3.5 w-64 rounded-sm" />
        </div>

        {/* Filter Pills Placeholder */}
        <div className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] p-1">
          <div className="shimmer-placeholder h-7 w-20 rounded-full" />
          <div className="shimmer-placeholder h-7 w-20 rounded-full" />
          <div className="shimmer-placeholder h-7 w-24 rounded-full" />
        </div>
      </div>

      {/* Transaction Table Skeleton (Desktop table + Mobile card list) */}
      <TableSkeleton
        columnCount={7}
        rowCount={7}
        mobileCardCount={5}
        renderMobileCard={(idx) => (
          <div key={`tx-skel-card-${idx}`} className="flex flex-col gap-2.5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="shimmer-placeholder h-4 w-14 rounded-sm" />
                <div className="shimmer-placeholder h-4 w-16 rounded-full" />
              </div>
              <div className="shimmer-placeholder h-3 w-28 rounded-sm" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="shimmer-placeholder h-5 w-16 rounded-full" />
                <div className="shimmer-placeholder h-3.5 w-24 rounded-sm" />
              </div>
              <div className="shimmer-placeholder h-5 w-24 rounded-sm" />
            </div>

            <div className="flex items-center justify-between border-t border-[var(--color-border)]/60 pt-2 text-xs">
              <div className="shimmer-placeholder h-3 w-32 rounded-sm" />
              <div className="shimmer-placeholder h-3 w-16 rounded-sm" />
            </div>
          </div>
        )}
      />
    </div>
  );
}
