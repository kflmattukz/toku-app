import { KasirProductCardSkeleton } from "./KasirProductCardSkeleton";

export function KasirSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat Kasir"
      className="flex min-h-[calc(100vh-120px)] flex-1 flex-col gap-6 lg:flex-row"
    >
      {/* Products Panel Skeleton */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header Skeleton */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="shimmer-placeholder mb-1.5 h-3 w-28 rounded-sm" />
            <div className="shimmer-placeholder h-7 w-44 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <div className="shimmer-placeholder h-8 w-28 rounded-full" />
            <div className="shimmer-placeholder h-8 w-20 rounded-full" />
          </div>
        </div>

        {/* Search & Category Header Skeleton */}
        <div className="mb-5">
          {/* Pill Search Input Skeleton */}
          <div className="shimmer-placeholder mb-4 h-11 w-full rounded-full border border-[var(--color-border)]" />

          {/* Category Navigation Pills Skeleton */}
          <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={`cat-skel-${idx}`}
                className="shimmer-placeholder h-9 shrink-0 rounded-full border border-[var(--color-border)]"
                style={{ width: idx === 0 ? 80 : 92 + (idx % 3) * 16 }}
              />
            ))}
          </div>
        </div>

        {/* Responsive Product Grid Skeleton (Mobile 2 col, Tablet 3-4 col, Desktop 4-5 col) */}
        <div className="grid flex-1 grid-cols-2 content-start gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={`prod-skel-${idx}`}
              className="catalog-card-animate flex h-full flex-col"
              style={{ animationDelay: `${Math.min(idx * 20, 160)}ms` }}
            >
              <KasirProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Persistent Sidebar Cart Skeleton */}
      <div className="desktop-only sticky top-20 flex h-[calc(100vh-100px)] w-[360px] shrink-0 flex-col justify-between overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs">
        <div>
          {/* Cart Header Skeleton */}
          <div className="mb-4 flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <div className="shimmer-placeholder h-5 w-32 rounded-md" />
            <div className="shimmer-placeholder h-5 w-12 rounded-full" />
          </div>

          {/* Cart Items Placeholder */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`cart-skel-${i}`}
                className="shimmer-placeholder h-16 w-full rounded-xl border border-[var(--color-border-subtle)]"
              />
            ))}
          </div>
        </div>

        {/* Cart Bottom Summary Skeleton */}
        <div className="border-t border-[var(--color-border)] pt-4">
          <div className="mb-2 flex justify-between">
            <div className="shimmer-placeholder h-4 w-16 rounded-md" />
            <div className="shimmer-placeholder h-4 w-24 rounded-md" />
          </div>
          <div className="shimmer-placeholder mt-3 h-11 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
