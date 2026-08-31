import { TrophyIcon, PackageIcon } from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import type { TopProduct } from "../types";

interface TopProductsLeaderboardProps {
  topProducts: TopProduct[];
}

export function TopProductsLeaderboard({ topProducts }: TopProductsLeaderboardProps) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]">
            <TrophyIcon size={22} weight="fill" />
          </div>
          <div>
            <h2 className="m-0 text-base font-extrabold tracking-tight text-[var(--color-text)]">
              Produk Terlaris
            </h2>
            <div className="text-xs text-[var(--color-text-3)]">
              Peringkat berdasarkan kuantitas & omset terlaris
            </div>
          </div>
        </div>

        <span className="rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] px-3 py-1 text-xs font-extrabold text-[var(--color-brand)]">
          {topProducts.length} Produk Terjual
        </span>
      </div>

      {topProducts.length === 0 ? (
        <div className="py-12 text-center text-[var(--color-text-3)]">
          <PackageIcon size={44} className="mx-auto mb-2 opacity-25" />
          <p className="m-0 text-sm font-semibold">Belum ada transaksi pada periode ini.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {topProducts.map((p, idx) => (
            <div
              key={p.name}
              className="press-tactile flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3.5 transition-colors hover:bg-[var(--color-surface-3)]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                    idx === 0
                      ? "shadow-primary-500/35 bg-[var(--color-brand)] text-white shadow-xs"
                      : idx === 1
                        ? "bg-stone-600 text-white"
                        : idx === 2
                          ? "bg-stone-400 text-white"
                          : "bg-[var(--color-surface-3)] text-[var(--color-text-2)]"
                  }`}
                >
                  #{idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-[var(--color-text)]">
                    {p.name}
                  </div>
                  <div className="mt-0.5 text-xs font-medium text-[var(--color-text-3)]">
                    Terjual{" "}
                    <strong className="font-extrabold text-[var(--color-text)]">
                      {p.totalQty} pcs
                    </strong>
                  </div>
                </div>
              </div>

              <div className="price shrink-0 text-right text-sm font-black text-[var(--color-brand)]">
                {formatIDR(p.totalRevenue)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
