import { createPortal } from "react-dom";
import { Modal } from "#/components/Modal";
import {
  ShoppingCartIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  TagIcon,
  PencilSimpleIcon,
  MoneyIcon,
  ArrowRightIcon,
  PackageIcon,
} from "@phosphor-icons/react";
import { formatIDR, calculateItemDiscount } from "#/lib/utils";
import type { CartItem, Product } from "../types";

interface CartDrawerProps {
  cart: CartItem[];
  products: Product[];
  totalItems: number;
  subtotal: number;
  total: number;
  totalSavings: number;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onClearCart: () => void;
  onOpenItemDiscount: (item: CartItem) => void;
  showPayment: boolean;
  showMobileCart: boolean;
  setShowMobileCart: (show: boolean) => void;
  onOpenPayment: () => void;
}

export function CartDrawer({
  cart,
  products,
  totalItems,
  subtotal,
  total,
  totalSavings,
  onUpdateQty,
  onRemoveFromCart,
  onClearCart,
  onOpenItemDiscount,
  showPayment,
  showMobileCart,
  setShowMobileCart,
  onOpenPayment,
}: CartDrawerProps) {
  const renderCartItems = () => (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-2.5">
      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-[var(--color-text-3)]">
          <ShoppingCartIcon size={48} weight="duotone" className="opacity-30 mb-3" />
          <p className="text-sm font-bold m-0 text-[var(--color-text-2)]">
            Keranjang Masih Kosong
          </p>
          <span className="text-xs mt-1">Klik produk di katalog untuk menambahkan</span>
        </div>
      ) : (
        cart.map((item) => {
          const productData = products.find((p) => p._id === item.productId);
          const disc = calculateItemDiscount(item.price, item.discountType, item.discountValue);
          const lineTotal = disc.unitPrice * item.qty;

          return (
            <div
              key={item.productId}
              className="flex flex-col p-3 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] gap-2"
            >
              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                {productData?.imageUrl || productData?.imageId ? (
                  <img
                    src={productData?.imageUrl || productData?.imageId}
                    alt={item.name}
                    className="w-11 h-11 rounded-[10px] object-cover shrink-0 border border-[var(--color-border)]"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-[10px] bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-3)] shrink-0">
                    <PackageIcon size={22} weight="duotone" />
                  </div>
                )}

                {/* Name & Unit Price */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-extrabold text-[var(--color-text)] truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-3)] flex items-center gap-1.5 mt-0.5">
                    <span>
                      {item.qty} x {formatIDR(disc.unitPrice)}
                    </span>
                    {disc.hasDiscount && (
                      <span className="text-[10px] line-through text-[var(--color-text-3)]">
                        {formatIDR(item.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Line Total */}
                <div className="text-right shrink-0">
                  <span className="price text-sm font-extrabold text-[var(--color-brand)]">
                    {formatIDR(lineTotal)}
                  </span>
                </div>
              </div>

              {/* Actions Row: Line Discount Tag + Stepper */}
              <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-[var(--color-border)]">
                {/* Item Discount Trigger */}
                <button
                  type="button"
                  onClick={() => onOpenItemDiscount(item)}
                  className={`press-tactile py-0.5 px-2 rounded-full text-[10px] font-extrabold cursor-pointer inline-flex items-center gap-1 border transition-all ${
                    disc.hasDiscount
                      ? "border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)]"
                  }`}
                >
                  <TagIcon size={12} weight="bold" />
                  <span>{disc.hasDiscount ? `Disc ${disc.discountLabel}` : "+ Diskon Item"}</span>
                  <PencilSimpleIcon size={10} />
                </button>

                {/* Steppers */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.productId, -1)}
                    className="press-tactile w-7 h-7 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] flex items-center justify-center cursor-pointer"
                  >
                    <MinusIcon size={11} weight="bold" />
                  </button>
                  <span className="text-xs font-extrabold min-w-[18px] text-center text-[var(--color-text)] font-mono">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.productId, 1)}
                    className="press-tactile w-7 h-7 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center cursor-pointer shadow-xs"
                  >
                    <PlusIcon size={11} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFromCart(item.productId)}
                    title="Hapus dari keranjang"
                    className="press-tactile w-7 h-7 rounded-full bg-[var(--color-danger-light)] text-[var(--color-danger-text)] border border-[var(--color-danger)]/20 flex items-center justify-center cursor-pointer ml-0.5"
                  >
                    <TrashIcon size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderSummaryCheckout = () => (
    <div className="border-t border-[var(--color-border)] p-4 sm:p-5 bg-[var(--color-surface)] rounded-b-[18px]">
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-[var(--color-text-2)]">
            Subtotal Produk ({totalItems} pcs)
          </span>
          <span className="price text-sm font-bold text-[var(--color-text)]">
            {formatIDR(subtotal)}
          </span>
        </div>

        {totalSavings > 0 && (
          <div className="flex justify-between items-center text-[11px] font-bold text-[var(--color-brand)]">
            <span>Total Berhemat</span>
            <span className="price">-{formatIDR(totalSavings)}</span>
          </div>
        )}

        <div className="flex justify-between items-baseline mt-1.5 pt-1.5 border-t border-[var(--color-border-subtle)]">
          <span className="text-xs font-extrabold text-[var(--color-text)]">
            Total Pembayaran
          </span>
          <span className="price text-xl font-black text-[var(--color-brand)]">
            {formatIDR(total)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenPayment}
        disabled={cart.length === 0}
        className={`press-tactile w-full py-3 px-4 rounded-full text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
          cart.length === 0
            ? "bg-[var(--color-border)] cursor-not-allowed opacity-60"
            : "bg-[var(--color-brand)] cursor-pointer shadow-lg shadow-primary-500/30"
        }`}
      >
        <MoneyIcon size={20} weight="bold" />
        <span>Bayar Transaksi</span>
        <ArrowRightIcon size={16} weight="bold" />
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Cart Sidebar */}
      <div className="desktop-only w-[380px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[18px] flex flex-col max-h-[calc(100vh-120px)] shadow-xs sticky top-6">
        <div className="p-4 sm:p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[var(--color-brand-light)] text-[var(--color-brand)] flex items-center justify-center">
              <ShoppingCartIcon size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold m-0 text-[var(--color-text)]">
                Pesanan Kasir
              </h2>
              <div className="text-[11px] text-[var(--color-text-3)] mt-0.5">
                {totalItems} item barang di keranjang
              </div>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="press-tactile bg-[var(--color-danger-light)] text-[var(--color-danger-text)] border border-[var(--color-danger)]/30 rounded-full px-2.5 py-1 text-[11px] font-bold cursor-pointer flex items-center gap-1"
            >
              <TrashIcon size={12} weight="bold" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {renderCartItems()}
        {renderSummaryCheckout()}
      </div>

      {/* Mobile Floating Cart Summary Pill */}
      {cart.length > 0 &&
        !showPayment &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="mobile-only animate-float-pill fixed bottom-[calc(78px+env(safe-area-inset-bottom,0px))] left-4 right-4 z-50">
            <button
              type="button"
              onClick={() => setShowMobileCart(true)}
              className="press-tactile w-full p-3.5 bg-[var(--color-brand)] text-white rounded-full flex items-center justify-between shadow-xl shadow-primary-500/40 cursor-pointer border-none"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-extrabold">
                  {totalItems}
                </div>
                <span className="text-sm font-extrabold tracking-tight">Lihat Keranjang</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="price text-base font-extrabold">{formatIDR(total)}</span>
                <ArrowRightIcon size={16} weight="bold" />
              </div>
            </button>
          </div>,
          document.body,
        )}

      {/* Mobile Cart Modal Drawer */}
      {showMobileCart && (
        <Modal onClose={() => setShowMobileCart(false)} maxWidth={480}>
          <div className="-m-3 flex flex-col max-h-[78vh]">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[var(--color-text)]">
                Keranjang Pesanan ({totalItems})
              </h2>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs text-rose-600 font-bold cursor-pointer"
                >
                  Kosongkan
                </button>
              )}
            </div>
            {renderCartItems()}
            {renderSummaryCheckout()}
          </div>
        </Modal>
      )}
    </>
  );
}
