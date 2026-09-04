import { WarningIcon, CheckCircleIcon } from "@phosphor-icons/react";

interface StockOverviewCardsProps {
  lowStockCount: number;
  healthyStockCount: number;
}

export function StockOverviewCards({ lowStockCount, healthyStockCount }: StockOverviewCardsProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* 1. Low Stock Alert Card */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-rose-600 uppercase">
              PERLU RESTOK
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 transition-transform duration-200 hover:scale-105">
              <WarningIcon size={22} weight="duotone" />
            </div>
          </div>
          <div className="mb-1 text-xs font-bold text-[var(--color-text-2)]">
            Stok Menipis & Kritis
          </div>
          <div className="price mb-1.5 text-2xl font-black tracking-tight text-rose-600 sm:text-3xl">
            {lowStockCount} Produk
          </div>
          <div className="text-[11px] font-medium text-[var(--color-text-3)]">
            {lowStockCount > 0
              ? "Segera tambah stok agar transaksi lancar"
              : "Semua persediaan produk terkendali aman"}
          </div>
        </div>
      </div>

      {/* 2. Healthy Stock Card */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-[var(--color-brand)] uppercase">
              STOK AMAN
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)] transition-transform duration-200 hover:scale-105">
              <CheckCircleIcon size={22} weight="duotone" />
            </div>
          </div>
          <div className="mb-1 text-xs font-bold text-[var(--color-text-2)]">
            Persediaan Cukup
          </div>
          <div className="price mb-1.5 text-2xl font-black tracking-tight text-[var(--color-text)] sm:text-3xl">
            {healthyStockCount} Produk
          </div>
          <div className="text-[11px] font-medium text-[var(--color-text-3)]">
            Stok aman di atas batas minimum toko
          </div>
        </div>
      </div>
    </div>
  );
}
