import { WarningIcon, CheckCircleIcon } from "@phosphor-icons/react";

interface StockOverviewCardsProps {
  lowStockCount: number;
  healthyStockCount: number;
}

export function StockOverviewCards({
  lowStockCount,
  healthyStockCount,
}: StockOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
      {/* Low Stock Alert Card */}
      <div className="bg-[var(--color-danger-light)] border border-[var(--color-danger)]/30 rounded-[18px] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-[var(--color-danger-text)] uppercase tracking-wider">
            Stok Rendah
          </span>
          <WarningIcon size={20} weight="fill" className="text-[var(--color-danger-text)]" />
        </div>
        <div className="price text-3xl font-black text-[var(--color-danger-text)]">
          {lowStockCount}
        </div>
        <div className="text-xs text-[var(--color-danger-text)]/80 mt-1">
          Produk perlu restock segera
        </div>
      </div>

      {/* Healthy Stock Card */}
      <div className="bg-[var(--color-brand-light)] border border-[var(--color-brand)]/40 rounded-[18px] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-[var(--color-brand)] uppercase tracking-wider">
            Stok Aman
          </span>
          <CheckCircleIcon size={20} weight="fill" className="text-[var(--color-brand)]" />
        </div>
        <div className="price text-3xl font-black text-[var(--color-brand)]">
          {healthyStockCount}
        </div>
        <div className="text-xs text-[var(--color-brand)]/80 mt-1">
          Produk persediaan cukup
        </div>
      </div>
    </div>
  );
}
