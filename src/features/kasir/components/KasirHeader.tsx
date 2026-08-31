import { WifiSlashIcon } from "@phosphor-icons/react";

interface KasirHeaderProps {
  productCount: number;
  isOnline: boolean;
}

export function KasirHeader({ productCount, isOnline }: KasirHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
      <div>
        <div className="eyebrow-tag">MANAJEMEN PENJUALAN</div>
        <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight mt-0.5">
          Kasir & Pembelian
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {!isOnline && (
          <div className="flex items-center gap-1 text-xs font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/20 px-3 py-1.5 rounded-full shadow-xs animate-pulse">
            <WifiSlashIcon size={14} weight="bold" />
            <span>Mode Offline</span>
          </div>
        )}
        <div className="text-xs font-extrabold text-[var(--color-brand)] bg-[var(--color-brand-light)] border border-[var(--color-brand)] px-3.5 py-1.5 rounded-full shadow-xs">
          {productCount} Produk
        </div>
      </div>
    </div>
  );
}
