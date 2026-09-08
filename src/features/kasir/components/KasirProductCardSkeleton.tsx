export function KasirProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="squircle-card relative flex h-full min-h-[190px] flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 select-none shadow-xs"
    >
      {/* Image Skeleton */}
      <div className="shimmer-placeholder relative mb-2.5 aspect-square w-full rounded-[12px] border border-[var(--color-border)]" />

      {/* Info Skeleton */}
      <div className="flex flex-col gap-1.5">
        <div className="shimmer-placeholder h-3.5 w-3/4 rounded-md" />
        <div className="shimmer-placeholder h-3.5 w-2/5 rounded-md" />
      </div>
    </div>
  );
}
