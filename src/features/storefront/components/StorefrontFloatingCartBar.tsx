import { ShoppingBagIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";

interface StorefrontFloatingCartBarProps {
  totalItems: number;
  total: number;
  onOpenCheckout: () => void;
}

export function StorefrontFloatingCartBar({
  totalItems,
  total,
  onOpenCheckout,
}: StorefrontFloatingCartBarProps) {
  if (totalItems <= 0) return null;

  return (
    <div className="lg:hidden fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-[var(--color-brand)] text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 border border-[var(--color-brand-dark)]/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <ShoppingBagIcon size={22} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-semibold text-orange-100">{totalItems} Produk Dipilih</p>
            <p className="text-base font-black tracking-tight font-mono">{formatIDR(total)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenCheckout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[var(--color-brand)] font-extrabold text-xs shadow-md hover:bg-orange-50 active:scale-95 transition-all press-tactile"
        >
          <span>Lanjut</span>
          <ArrowRightIcon size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}
