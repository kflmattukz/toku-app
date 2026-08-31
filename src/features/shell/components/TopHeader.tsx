import {
  ListIcon,
  LockKeyIcon,
  WifiSlashIcon,
} from "@phosphor-icons/react";
import type { ActiveCashier } from "#/lib/store-context";

interface TopHeaderProps {
  store: any;
  currentCashier: ActiveCashier;
  isOnline: boolean;
  onOpenSidebar: () => void;
  onOpenCashierModal: () => void;
}

export function TopHeader({
  store,
  currentCashier,
  isOnline,
  onOpenSidebar,
  onOpenCashierModal,
}: TopHeaderProps) {
  return (
    <>
      {/* Offline Status Bar */}
      {!isOnline && (
        <div className="bg-[var(--color-brand)] text-white py-2 px-4 text-xs font-bold flex items-center justify-center gap-2 sticky top-0 z-40 shadow-sm">
          <WifiSlashIcon size={16} weight="bold" />
          <span>Mode Offline — Transaksi akan disinkron otomatis saat koneksi kembali</span>
        </div>
      )}

      {/* Mobile Sticky Header */}
      <header className="mobile-topbar flex items-center justify-between py-3 px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="press-tactile bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full p-2 text-[var(--color-text)] flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Buka Menu Navigasi"
          >
            <ListIcon size={18} weight="bold" />
          </button>
          <div className="flex items-center gap-2 overflow-hidden">
            <img
              src="/logo.png"
              alt="Toku POS"
              className="w-7 h-7 rounded-lg object-contain shrink-0"
            />
            <span className="font-extrabold text-sm text-[var(--color-text)] truncate">
              {store ? store.name : "Toku POS"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenCashierModal}
            className="press-tactile bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full py-1 px-2.5 flex items-center gap-1.5 cursor-pointer text-[var(--color-text)] text-xs font-bold"
            title={`Kasir: ${currentCashier.name}`}
          >
            <LockKeyIcon size={14} />
            <span>{currentCashier.name.split(" ")[0]}</span>
          </button>
        </div>
      </header>
    </>
  );
}
