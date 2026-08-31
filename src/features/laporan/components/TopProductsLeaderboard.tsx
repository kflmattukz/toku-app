import { TrophyIcon, PackageIcon } from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import type { TopProduct } from "../types";

interface TopProductsLeaderboardProps {
  topProducts: TopProduct[];
}

export function TopProductsLeaderboard({ topProducts }: TopProductsLeaderboardProps) {
  return (
    <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-[var(--color-brand-light)] border border-[var(--color-brand)] flex items-center justify-center text-[var(--color-brand)]">
            <TrophyIcon size={22} weight="fill" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--color-text)] tracking-tight m-0">
              Produk Terlaris
            </h2>
            <div className="text-xs text-[var(--color-text-3)]">
              Peringkat berdasarkan kuantitas & omset terlaris
            </div>
          </div>
        </div>

        <span className="text-xs font-extrabold text-[var(--color-brand)] bg-[var(--color-brand-light)] border border-[var(--color-brand)] py-1 px-3 rounded-full">
          {topProducts.length} Produk Terjual
        </span>
      </div>

      {topProducts.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-3)]">
          <PackageIcon size={44} className="opacity-25 mb-2 mx-auto" />
          <p className="m-0 text-sm font-semibold">
            Belum ada transaksi pada periode ini.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {topProducts.map((p, idx) => (
            <div
              key={p.name}
              className="press-tactile flex items-center justify-between p-3.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl gap-3 transition-colors hover:bg-[var(--color-surface-3)]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    idx === 0
                      ? "bg-[var(--color-brand)] text-white shadow-xs shadow-primary-500/35"
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
                  <div className="text-sm font-extrabold text-[var(--color-text)] truncate">
                    {p.name}
                  </div>
                  <div className="text-xs text-[var(--color-text-3)] mt-0.5 font-medium">
                    Terjual{" "}
                    <strong className="text-[var(--color-text)] font-extrabold">
                      {p.totalQty} pcs
                    </strong>
                  </div>
                </div>
              </div>

              <div className="price text-sm font-black text-[var(--color-brand)] text-right shrink-0">
                {formatIDR(p.totalRevenue)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
