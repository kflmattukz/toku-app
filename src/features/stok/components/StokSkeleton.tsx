import { TableSkeleton } from "#/components/ui/TableSkeleton";

export function StokSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat Kontrol Stok" className="w-full pb-12">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="shimmer-placeholder mb-1.5 h-3.5 w-36 rounded-sm" />
        <div className="shimmer-placeholder h-7 w-56 rounded-lg" />
        <div className="shimmer-placeholder mt-2 h-3.5 w-80 rounded-sm" />
      </div>

      {/* 2 Overview Metric Cards Skeleton */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Card 1: Low Stock */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="shimmer-placeholder h-5 w-24 rounded-full" />
              <div className="shimmer-placeholder h-10 w-10 rounded-full" />
            </div>
            <div className="shimmer-placeholder mb-2 h-3.5 w-32 rounded-sm" />
            <div className="shimmer-placeholder mb-2 h-8 w-28 rounded-md" />
            <div className="shimmer-placeholder h-3 w-48 rounded-sm" />
          </div>
        </div>

        {/* Card 2: Healthy Stock */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core">
            <div className="mb-3.5 flex items-center justify-between">
              <div className="shimmer-placeholder h-5 w-20 rounded-full" />
              <div className="shimmer-placeholder h-10 w-10 rounded-full" />
            </div>
            <div className="shimmer-placeholder mb-2 h-3.5 w-28 rounded-sm" />
            <div className="shimmer-placeholder mb-2 h-8 w-28 rounded-md" />
            <div className="shimmer-placeholder h-3 w-48 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Stock Table Skeleton */}
      <TableSkeleton
        columnCount={5}
        rowCount={6}
        mobileCardCount={5}
        renderMobileCard={(idx) => (
          <div key={`stk-skel-card-${idx}`} className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="shimmer-placeholder mb-1.5 h-4 w-40 rounded-sm" />
                <div className="flex items-center gap-2">
                  <div className="shimmer-placeholder h-4 w-16 rounded-full" />
                  <div className="shimmer-placeholder h-3 w-20 rounded-sm" />
                </div>
              </div>
              <div className="shimmer-placeholder h-5 w-20 rounded-full" />
            </div>

            <div className="flex items-center justify-between border-t border-[var(--color-border)]/60 pt-2">
              <div className="flex items-center gap-2">
                <div className="shimmer-placeholder h-3 w-16 rounded-sm" />
                <div className="shimmer-placeholder h-5 w-14 rounded-md" />
              </div>
              <div className="shimmer-placeholder h-8 w-24 rounded-full" />
            </div>
          </div>
        )}
      />
    </div>
  );
}
