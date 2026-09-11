export function StorefrontSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)] pb-28">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-30 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[var(--color-surface-2)] animate-pulse" />
            <div className="space-y-1.5">
              <div className="w-32 h-4 rounded-md bg-[var(--color-surface-2)] animate-pulse" />
              <div className="w-48 h-3 rounded-md bg-[var(--color-surface-2)] animate-pulse" />
            </div>
          </div>
          <div className="w-72 h-8 rounded-xl bg-[var(--color-surface-2)] animate-pulse hidden md:block" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Catalog Column */}
          <div className="flex-1 space-y-4">
            {/* Search & Tabs Skeleton */}
            <div className="space-y-3">
              <div className="w-full h-11 rounded-xl bg-[var(--color-surface-2)] animate-pulse" />
              <div className="flex gap-2 overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-20 h-8 rounded-full bg-[var(--color-surface-2)] shrink-0 animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Product Cards Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-3"
                >
                  <div className="w-full aspect-square rounded-xl bg-[var(--color-surface-3)] animate-pulse" />
                  <div className="w-16 h-3 rounded bg-[var(--color-surface-3)] animate-pulse" />
                  <div className="w-3/4 h-4 rounded bg-[var(--color-surface-3)] animate-pulse" />
                  <div className="pt-2 border-t border-[var(--color-border)] flex justify-between items-center">
                    <div className="w-20 h-5 rounded bg-[var(--color-surface-3)] animate-pulse" />
                    <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-3)] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Sidebar Skeleton */}
          <aside className="hidden lg:block w-96 shrink-0 h-[500px] rounded-3xl bg-[var(--color-surface-2)] border border-[var(--color-border)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
