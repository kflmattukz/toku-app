import { ShoppingBagIcon, TrashIcon, ArrowRightIcon, PackageIcon, PlusIcon, MinusIcon } from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import type { StorefrontCartItem, StorefrontProduct } from "../types";

interface StorefrontCartSidebarProps {
  cart: Record<string, StorefrontCartItem>;
  products: StorefrontProduct[];
  totalItems: number;
  total: number;
  onUpdateQty: (product: StorefrontProduct, delta: number) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export function StorefrontCartSidebar({
  cart,
  products,
  totalItems,
  total,
  onUpdateQty,
  onClearCart,
  onOpenCheckout,
}: StorefrontCartSidebarProps) {
  const items = Object.values(cart);
  const productMap = new Map(products.map((p) => [p._id, p]));

  return (
    <aside
      aria-label="Keranjang Belanja"
      className="hidden lg:flex flex-col w-96 shrink-0 sticky top-[73px] h-[calc(100vh-90px)] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-3xl p-5 shadow-sm overflow-hidden"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)] flex items-center justify-center">
            <ShoppingBagIcon size={20} weight="fill" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-[var(--color-text)]">Keranjang Belanja</h2>
            <p className="text-xs text-[var(--color-text-2)]">{totalItems} item dipilih</p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            aria-label="Kosongkan keranjang"
            className="text-xs text-[var(--color-text-3)] hover:text-rose-500 transition-colors flex items-center gap-1 p-1"
          >
            <TrashIcon size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Items Scrollable List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--color-text-3)]">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-3">
              <ShoppingBagIcon size={28} weight="duotone" className="text-[var(--color-text-3)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--color-text)]">Keranjang Masih Kosong</p>
            <p className="text-xs text-[var(--color-text-2)] mt-1 max-w-[200px]">
              Klik produk di samping untuk menambahkan ke daftar pesanan.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const product = productMap.get(item.productId);
            return (
              <div
                key={item.productId}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs gap-3 transition-all hover:border-[var(--color-brand)]/40"
              >
                {/* Product Thumbnail */}
                <div className="w-11 h-11 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PackageIcon size={20} className="text-[var(--color-brand)] opacity-60" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-[var(--color-text)] truncate">{item.name}</p>
                  <p className="text-[11px] text-[var(--color-brand)] font-mono font-bold mt-0.5">
                    {formatIDR(item.subtotal)}
                  </p>
                </div>

                {/* Quantity Controls */}
                {product && (
                  <div className="flex items-center gap-1 shrink-0 bg-[var(--color-surface-2)] rounded-lg p-0.5 border border-[var(--color-border)]">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(product, -1)}
                      aria-label={`Kurangi 1 ${item.name}`}
                      className="w-6 h-6 rounded flex items-center justify-center text-[var(--color-text-2)] hover:bg-[var(--color-surface)] active:scale-90 transition-all"
                    >
                      <MinusIcon size={10} weight="bold" />
                    </button>
                    <span className="w-5 text-center font-bold text-xs font-mono">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(product, 1)}
                      aria-label={`Tambah 1 ${item.name}`}
                      className="w-6 h-6 rounded bg-[var(--color-brand)] text-white flex items-center justify-center active:scale-90 transition-all"
                    >
                      <PlusIcon size={10} weight="bold" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer & CTA */}
      <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-text-2)]">Total Pembayaran</span>
          <span className="text-lg font-black text-[var(--color-brand)] font-mono">
            {formatIDR(total)}
          </span>
        </div>

        <button
          type="button"
          disabled={items.length === 0}
          onClick={onOpenCheckout}
          className="w-full py-3 px-4 rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all press-tactile"
        >
          <span>Lanjut ke Checkout</span>
          <ArrowRightIcon size={16} weight="bold" />
        </button>
      </div>
    </aside>
  );
}
