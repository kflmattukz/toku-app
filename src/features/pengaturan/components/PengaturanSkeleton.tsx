export function PengaturanSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat Pengaturan Toko"
      className="mx-auto w-full max-w-4xl pb-12"
    >
      {/* Header Skeleton */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="shimmer-placeholder mb-1.5 h-3.5 w-32 rounded-sm" />
          <div className="shimmer-placeholder h-7 w-52 rounded-lg" />
          <div className="shimmer-placeholder mt-2 h-3.5 w-80 rounded-sm" />
        </div>

        {/* Theme button placeholder */}
        <div className="shimmer-placeholder h-9 w-24 rounded-full" />
      </div>

      {/* Tabs Placeholder */}
      <div className="mb-6 flex gap-2 border-b border-[var(--color-border)] pb-3">
        <div className="shimmer-placeholder h-9 w-28 rounded-full" />
        <div className="shimmer-placeholder h-9 w-32 rounded-full" />
        <div className="shimmer-placeholder h-9 w-32 rounded-full" />
      </div>

      {/* Settings Form Card 1: Informasi Usaha */}
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
          <div className="mb-5 flex items-center gap-2">
            <div className="shimmer-placeholder h-5 w-5 rounded-full" />
            <div className="shimmer-placeholder h-5 w-36 rounded-sm" />
          </div>

          <div className="flex flex-col gap-5">
            {/* Field 1: Nama Toko */}
            <div>
              <div className="shimmer-placeholder mb-2 h-3.5 w-28 rounded-sm" />
              <div className="shimmer-placeholder h-11 w-full rounded-full border border-[var(--color-border)]" />
            </div>

            {/* Field 2: Nama Cabang */}
            <div>
              <div className="shimmer-placeholder mb-2 h-3.5 w-32 rounded-sm" />
              <div className="shimmer-placeholder h-11 w-full rounded-full border border-[var(--color-border)]" />
            </div>

            {/* Field 3: Kategori Bisnis Grid */}
            <div>
              <div className="shimmer-placeholder mb-2 h-3.5 w-28 rounded-sm" />
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`cat-picker-${idx}`}
                    className="shimmer-placeholder h-16 rounded-xl border border-[var(--color-border)]"
                  />
                ))}
              </div>
            </div>

            {/* Field 4: Alamat */}
            <div>
              <div className="shimmer-placeholder mb-2 h-3.5 w-24 rounded-sm" />
              <div className="shimmer-placeholder h-20 w-full rounded-2xl border border-[var(--color-border)]" />
            </div>
          </div>
        </div>

        {/* Settings Card 2: Preferensi Operasional */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
          <div className="mb-4 flex items-center gap-2">
            <div className="shimmer-placeholder h-5 w-5 rounded-full" />
            <div className="shimmer-placeholder h-5 w-44 rounded-sm" />
          </div>

          <div>
            <div className="shimmer-placeholder mb-2 h-3.5 w-48 rounded-sm" />
            <div className="shimmer-placeholder h-11 w-44 rounded-full border border-[var(--color-border)]" />
          </div>
        </div>

        {/* Save Button Skeleton */}
        <div className="flex justify-end pt-2">
          <div className="shimmer-placeholder h-11 w-48 rounded-full" />
        </div>
      </div>
    </div>
  );
}
