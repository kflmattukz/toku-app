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
import { Button } from "#/components/ui";
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
    <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4 sm:p-5">
      {cart.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-[var(--color-text-3)]">
          <ShoppingCartIcon size={48} weight="duotone" className="mb-3 opacity-30" />
          <p className="m-0 text-sm font-bold text-[var(--color-text-2)]">Keranjang Masih Kosong</p>
          <span className="mt-1 text-xs">Klik produk di katalog untuk menambahkan</span>
        </div>
      ) : (
        cart.map((item) => {
          const productData = products.find((p) => p._id === item.productId);
          const disc = calculateItemDiscount(item.price, item.discountType, item.discountValue);
          const lineTotal = disc.unitPrice * item.qty;

          return (
            <div
              key={item.productId}
              className="flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-surface-2 p-3"
            >
              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                {productData?.imageUrl || productData?.imageId ? (
                  <img
                    src={productData?.imageUrl || productData?.imageId}
                    alt={item.name}
                    className="h-11 w-11 shrink-0 rounded-sm border border-[var(--color-border)] object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-3)]">
                    <PackageIcon size={22} weight="duotone" />
                  </div>
                )}

                {/* Name & Unit Price */}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-extrabold text-[var(--color-text)]">
                    {item.name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--color-text-3)]">
                    <span>
                      {item.qty} x {formatIDR(disc.unitPrice)}
                    </span>
                    {disc.hasDiscount && (
                      <span className="text-[10px] text-[var(--color-text-3)] line-through">
                        {formatIDR(item.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Line Total */}
                <div className="shrink-0 text-right">
                  <span className="price text-sm font-extrabold text-[var(--color-brand)]">
                    {formatIDR(lineTotal)}
                  </span>
                </div>
              </div>

              {/* Actions Row: Line Discount Tag + Stepper */}
              <div className="flex items-center justify-between border-t border-dashed border-[var(--color-border)] pt-1.5">
                {/* Item Discount Trigger */}
                <button
                  type="button"
                  onClick={() => onOpenItemDiscount(item)}
                  className={`press-tactile inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold transition-all ${
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
                    className="press-tactile flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
                  >
                    <MinusIcon size={11} weight="bold" />
                  </button>
                  <span className="min-w-[18px] text-center font-mono text-xs font-extrabold text-[var(--color-text)]">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.productId, 1)}
                    className="press-tactile flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[var(--color-brand)] text-white shadow-xs"
                  >
                    <PlusIcon size={11} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFromCart(item.productId)}
                    title="Hapus dari keranjang"
                    className="press-tactile ml-0.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[var(--color-danger)]/20 bg-[var(--color-danger-light)] text-[var(--color-danger-text)]"
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
    <div className="rounded-b-[18px] border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-text-2)]">
            Subtotal Produk ({totalItems} pcs)
          </span>
          <span className="price text-sm font-bold text-[var(--color-text)]">
            {formatIDR(subtotal)}
          </span>
        </div>

        {totalSavings > 0 && (
          <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-brand)]">
            <span>Total Berhemat</span>
            <span className="price">-{formatIDR(totalSavings)}</span>
          </div>
        )}

        <div className="mt-1.5 flex items-baseline justify-between border-t border-[var(--color-border-subtle)] pt-1.5">
          <span className="text-xs font-extrabold text-[var(--color-text)]">Total Pembayaran</span>
          <span className="price text-xl font-black text-[var(--color-brand)]">
            {formatIDR(total)}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        disabled={cart.length === 0}
        leftIcon={<MoneyIcon size={20} weight="bold" />}
        rightIcon={<ArrowRightIcon size={16} weight="bold" />}
        onClick={onOpenPayment}
      >
        Bayar Transaksi
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar Cart */}
      <div className="desktop-only sticky top-20 flex h-[calc(100vh-100px)] w-[360px] shrink-0 flex-col overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
          <div className="flex items-center gap-2">
            <ShoppingCartIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
            <h2 className="text-sm font-extrabold text-[var(--color-text)]">Keranjang Kasir</h2>
            {totalItems > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brand)] text-[10px] font-extrabold text-white">
                {totalItems}
              </span>
            )}
          </div>

          {cart.length > 0 && (
            <Button
              type="button"
              variant="danger-subtle"
              size="xs"
              leftIcon={<TrashIcon size={12} weight="bold" />}
              onClick={onClearCart}
            >
              Reset
            </Button>
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
          <div className="mobile-only animate-float-pill fixed right-4 bottom-[calc(78px+env(safe-area-inset-bottom,0px))] left-4 z-50">
            <button
              type="button"
              onClick={() => setShowMobileCart(true)}
              className="press-tactile shadow-primary-500/40 flex w-full cursor-pointer items-center justify-between rounded-full border-none bg-[var(--color-brand)] p-3.5 text-white shadow-xl"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-extrabold">
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
          <div className="-m-3 flex max-h-[78vh] flex-col">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
              <h2 className="text-base font-extrabold text-[var(--color-text)]">
                Keranjang Pesanan ({totalItems})
              </h2>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="cursor-pointer text-xs font-bold text-rose-600"
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
