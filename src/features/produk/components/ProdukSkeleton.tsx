import { TableSkeleton } from "#/components/ui/TableSkeleton";

export function ProdukSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat Katalog Produk" className="w-full pb-12">
      {/* Header Skeleton */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="shimmer-placeholder mb-1.5 h-3.5 w-28 rounded-sm" />
          <div className="shimmer-placeholder h-7 w-44 rounded-lg" />
          <div className="shimmer-placeholder mt-2 h-3.5 w-56 rounded-sm" />
        </div>

        <div className="shimmer-placeholder h-10 w-36 rounded-full" />
      </div>

      {/* Search Input Bar Skeleton */}
      <div className="mb-5 max-w-md">
        <div className="shimmer-placeholder h-11 w-full rounded-full border border-[var(--color-border)]" />
      </div>

      {/* Product Table Skeleton (Desktop table + Mobile card list) */}
      <TableSkeleton
        columnCount={7}
        rowCount={6}
        mobileCardCount={5}
        renderMobileCard={(idx) => (
          <div key={`prod-skel-card-${idx}`} className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
              <div className="shimmer-placeholder h-12 w-12 shrink-0 rounded-md border border-[var(--color-border)]" />
              <div className="min-w-0 flex-1">
                <div className="shimmer-placeholder mb-1.5 h-4 w-3/4 rounded-sm" />
                <div className="flex items-center gap-2">
                  <div className="shimmer-placeholder h-4 w-16 rounded-full" />
                  <div className="shimmer-placeholder h-3 w-20 rounded-sm" />
                </div>
              </div>
            </div>

            {/* 3-cell grid (Modal, Jual, Stok) */}
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-[var(--color-surface-2)] p-2.5 text-center">
              <div className="flex flex-col items-center gap-1">
                <div className="shimmer-placeholder h-2.5 w-10 rounded-xs" />
                <div className="shimmer-placeholder h-3.5 w-14 rounded-sm" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="shimmer-placeholder h-2.5 w-10 rounded-xs" />
                <div className="shimmer-placeholder h-3.5 w-16 rounded-sm" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="shimmer-placeholder h-2.5 w-10 rounded-xs" />
                <div className="shimmer-placeholder h-3.5 w-12 rounded-sm" />
              </div>
            </div>

            {/* Margin row placeholder */}
            <div className="flex justify-between">
              <div className="shimmer-placeholder h-3 w-24 rounded-sm" />
              <div className="shimmer-placeholder h-3 w-12 rounded-sm" />
            </div>

            {/* Action buttons (Edit, Hapus) */}
            <div className="flex gap-2 pt-1">
              <div className="shimmer-placeholder h-8 flex-1 rounded-md" />
              <div className="shimmer-placeholder h-8 flex-1 rounded-md" />
            </div>
          </div>
        )}
      />
    </div>
  );
}
