import { WifiSlashIcon, BarcodeIcon } from "@phosphor-icons/react";

interface KasirHeaderProps {
  productCount: number;
  isOnline: boolean;
  onOpenScanner?: () => void;
}

export function KasirHeader({ productCount, isOnline, onOpenScanner }: KasirHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <div className="eyebrow-tag">MANAJEMEN PENJUALAN</div>
        <h1 className="mt-0.5 text-2xl font-black tracking-tight text-[var(--color-text)]">
          Kasir & Pembelian
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {onOpenScanner && (
          <button
            type="button"
            onClick={onOpenScanner}
            className="press-tactile flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--color-brand)] bg-[var(--color-brand)] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs transition-opacity hover:opacity-90"
          >
            <BarcodeIcon size={16} weight="bold" />
            <span>Scan Barcode</span>
          </button>
        )}
        {!isOnline && (
          <div className="flex animate-pulse items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-extrabold text-amber-600 shadow-xs">
            <WifiSlashIcon size={14} weight="bold" />
            <span>Mode Offline</span>
          </div>
        )}
        <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 text-xs font-extrabold text-[var(--color-text-2)] shadow-xs">
          {productCount} Produk
        </div>
      </div>
    </div>
  );
}

