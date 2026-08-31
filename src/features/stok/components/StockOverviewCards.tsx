import { WarningIcon, CheckCircleIcon } from "@phosphor-icons/react";

interface StockOverviewCardsProps {
  lowStockCount: number;
  healthyStockCount: number;
}

export function StockOverviewCards({ lowStockCount, healthyStockCount }: StockOverviewCardsProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {/* Low Stock Alert Card */}
      <div className="rounded-[18px] border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] p-5 shadow-xs">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-black tracking-wider text-[var(--color-danger-text)] uppercase">
            Stok Rendah
          </span>
          <WarningIcon size={20} weight="fill" className="text-[var(--color-danger-text)]" />
        </div>
        <div className="price text-3xl font-black text-[var(--color-danger-text)]">
          {lowStockCount}
        </div>
        <div className="mt-1 text-xs text-[var(--color-danger-text)]/80">
          Produk perlu restock segera
        </div>
      </div>

      {/* Healthy Stock Card */}
      <div className="rounded-[18px] border border-[var(--color-brand)]/40 bg-[var(--color-brand-light)] p-5 shadow-xs">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-black tracking-wider text-[var(--color-brand)] uppercase">
            Stok Aman
          </span>
          <CheckCircleIcon size={20} weight="fill" className="text-[var(--color-brand)]" />
        </div>
        <div className="price text-3xl font-black text-[var(--color-brand)]">
          {healthyStockCount}
        </div>
        <div className="mt-1 text-xs text-[var(--color-brand)]/80">Produk persediaan cukup</div>
      </div>
    </div>
  );
}
