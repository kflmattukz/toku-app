import { ListIcon, LockKeyIcon, WifiSlashIcon } from "@phosphor-icons/react";
import { Button } from "#/components/ui";
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
        <div className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-[var(--color-brand)] px-4 py-2 text-xs font-bold text-white shadow-sm">
          <WifiSlashIcon size={16} weight="bold" />
          <span>Mode Offline — Transaksi akan disinkron otomatis saat koneksi kembali</span>
        </div>
      )}

      {/* Mobile Sticky Header */}
      <header className="mobile-topbar sticky top-0 z-20 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-xs">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="press-tactile flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] p-2 text-[var(--color-text)]"
            aria-label="Buka Menu Navigasi"
          >
            <ListIcon size={18} weight="bold" />
          </button>
          <div className="flex items-center gap-2 overflow-hidden">
            <img
              src="/logo.png"
              alt="Toku POS"
              className="h-7 w-7 shrink-0 rounded-lg object-contain"
            />
            <span className="truncate text-sm font-extrabold text-[var(--color-text)]">
              {store ? store.name : "Toku POS"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="xs"
            leftIcon={<LockKeyIcon size={14} />}
            onClick={onOpenCashierModal}
            title={`Kasir: ${currentCashier.name}`}
          >
            {currentCashier.name.split(" ")[0]}
          </Button>
        </div>
      </header>
    </>
  );
}
