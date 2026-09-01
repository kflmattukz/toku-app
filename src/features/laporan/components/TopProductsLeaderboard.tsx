import { useState } from "react";
import { TrophyIcon, PackageIcon, ScalesIcon, FlameIcon } from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import type { TopProduct } from "../types";

interface TopProductsLeaderboardProps {
  topProducts: TopProduct[];
  privacyMode?: boolean;
}

export function TopProductsLeaderboard({
  topProducts,
  privacyMode = false,
}: TopProductsLeaderboardProps) {
  const [tab, setTab] = useState<"qty" | "profit">("profit");

  const renderMoney = (amount: number) => {
    if (privacyMode) return "Rp ••••••";
    return formatIDR(amount);
  };

  const sortedList = [...topProducts].sort((a, b) =>
    tab === "profit" ? b.totalProfit - a.totalProfit : b.totalQty - a.totalQty,
  );

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]">
            <TrophyIcon size={22} weight="fill" />
          </div>
          <div>
            <h2 className="m-0 text-base font-extrabold tracking-tight text-[var(--color-text)]">
              Peringkat Produk Unggulan
            </h2>
            <div className="text-xs text-[var(--color-text-3)]">
              {tab === "profit"
                ? "Peringkat kontributor keuntungan terbesar toko"
                : "Peringkat produk berdasarkan volume penjualan tertinggi"}
            </div>
          </div>
        </div>

        {/* Tab Selector: Paling Cuan vs Paling Laris */}
        <div className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] p-1">
          <button
            type="button"
            onClick={() => setTab("profit")}
            className={`press-tactile flex cursor-pointer items-center gap-1.5 rounded-full border-none px-3 py-1.5 text-xs font-bold transition-all ${
              tab === "profit"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-transparent text-[var(--color-text-2)] hover:text-[var(--color-text)]"
            }`}
          >
            <ScalesIcon size={14} weight="bold" />
            <span>Paling Cuan (Profit)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("qty")}
            className={`press-tactile flex cursor-pointer items-center gap-1.5 rounded-full border-none px-3 py-1.5 text-xs font-bold transition-all ${
              tab === "qty"
                ? "shadow-primary-500/35 bg-[var(--color-brand)] text-white shadow-xs"
                : "bg-transparent text-[var(--color-text-2)] hover:text-[var(--color-text)]"
            }`}
          >
            <FlameIcon size={14} weight="bold" />
            <span>Paling Laris (Qty)</span>
          </button>
        </div>
      </div>

      {sortedList.length === 0 ? (
        <div className="py-12 text-center text-[var(--color-text-3)]">
          <PackageIcon size={44} className="mx-auto mb-2 opacity-25" />
          <p className="m-0 text-sm font-semibold">Belum ada transaksi pada periode ini.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sortedList.map((p, idx) => {
            const marginPct =
              p.totalRevenue > 0 ? Math.round((p.totalProfit / p.totalRevenue) * 100) : 0;

            return (
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
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--color-text-3)]">
                      <span>
                        Terjual{" "}
                        <strong className="font-extrabold text-[var(--color-text)]">
                          {p.totalQty} pcs
                        </strong>
                      </span>
                      <span>·</span>
                      <span>Omset {renderMoney(p.totalRevenue)}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="price text-sm font-black text-emerald-600">
                    +{renderMoney(p.totalProfit)}
                  </div>
                  <div className="mt-0.5 text-[11px] font-extrabold text-emerald-700">
                    Margin {marginPct}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
