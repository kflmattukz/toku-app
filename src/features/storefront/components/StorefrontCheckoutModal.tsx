import { useState, useEffect } from "react";
import {
  ShoppingBagIcon,
  XIcon,
  PackageIcon,
  PlusIcon,
  MinusIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import type { StorefrontCartItem, StorefrontProduct, CheckoutFormValues } from "../types";

interface StorefrontCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Record<string, StorefrontCartItem>;
  products: StorefrontProduct[];
  totalItems: number;
  total: number;
  onUpdateQty: (product: StorefrontProduct, delta: number) => void;
  onSubmitOrder: (formValues: CheckoutFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function StorefrontCheckoutModal({
  isOpen,
  onClose,
  cart,
  products,
  totalItems,
  total,
  onUpdateQty,
  onSubmitOrder,
  isSubmitting,
}: StorefrontCheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const items = Object.values(cart);
  const productMap = new Map(products.map((p) => [p._id, p]));

  // Handle ESC key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitOrder({
      customerName,
      customerPhone,
      customerNotes,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-surface)] border border-[var(--color-border)] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon size={20} className="text-[var(--color-brand)]" weight="duotone" />
            <h2 id="checkout-modal-title" className="font-bold text-base text-[var(--color-text)]">
              Checkout Pesanan Pickup
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup checkout"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-2)] text-[var(--color-text-2)] transition-colors"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Items List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[var(--color-text-2)] uppercase tracking-wider">
              Daftar Pesanan ({totalItems})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => {
                const product = productMap.get(item.productId);
                return (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PackageIcon size={18} className="text-[var(--color-brand)] opacity-60" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-semibold text-[var(--color-text)] truncate">{item.name}</p>
                      <p className="text-[var(--color-text-2)]">
                        {item.qty} × {formatIDR(item.subtotal / item.qty)} ={" "}
                        <span className="font-semibold text-[var(--color-text)] font-mono">
                          {formatIDR(item.subtotal)}
                        </span>
                      </p>
                    </div>

                    {product && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product, -1)}
                          aria-label={`Kurangi 1 ${item.name}`}
                          className="w-6 h-6 rounded bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] active:scale-90 transition-all"
                        >
                          <MinusIcon size={12} />
                        </button>
                        <span className="w-5 text-center font-bold font-mono">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product, 1)}
                          aria-label={`Tambah 1 ${item.name}`}
                          className="w-6 h-6 rounded bg-[var(--color-brand)] text-white flex items-center justify-center active:scale-90 transition-all"
                        >
                          <PlusIcon size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form id="storefront-checkout-form" onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div>
              <label
                htmlFor="checkout-customer-name"
                className="block text-xs font-semibold text-[var(--color-text)] mb-1"
              >
                Nama Pemesan <span className="text-rose-500">*</span>
              </label>
              <input
                id="checkout-customer-name"
                type="text"
                required
                autoComplete="name"
                placeholder="Contoh: Budi Santoso"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all text-[var(--color-text)] placeholder:text-[var(--color-text-3)]"
              />
            </div>

            <div>
              <label
                htmlFor="checkout-customer-phone"
                className="block text-xs font-semibold text-[var(--color-text)] mb-1"
              >
                Nomor WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                id="checkout-customer-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                placeholder="Contoh: 081234567890"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all text-[var(--color-text)] placeholder:text-[var(--color-text-3)]"
              />
              <p className="text-[10px] text-[var(--color-text-3)] mt-1">
                Notifikasi saat pesanan selesai disiapkan akan dikirim ke nomor WhatsApp ini.
              </p>
            </div>

            <div>
              <label
                htmlFor="checkout-customer-notes"
                className="block text-xs font-semibold text-[var(--color-text)] mb-1"
              >
                Catatan Pesanan (Opsional)
              </label>
              <textarea
                id="checkout-customer-notes"
                rows={2}
                placeholder="Contoh: Jangan terlalu manis, sambal dipisah..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all resize-none text-[var(--color-text)] placeholder:text-[var(--color-text-3)]"
              />
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <ClockIcon size={16} className="shrink-0 mt-0.5" weight="bold" />
              <span>
                Pesanan akan disiapkan oleh toko. Silakan datang ke toko untuk mengambil dan membayar di kasir (Tunai atau QRIS).
              </span>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase font-semibold text-[var(--color-text-3)]">
              Total Tagihan Kasir
            </p>
            <p className="text-lg font-black text-[var(--color-brand)] font-mono">
              {formatIDR(total)}
            </p>
          </div>
          <button
            type="submit"
            form="storefront-checkout-form"
            disabled={isSubmitting || items.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] active:scale-95 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all press-tactile"
          >
            {isSubmitting ? (
              <span>Memproses...</span>
            ) : (
              <>
                <CheckCircleIcon size={16} weight="bold" />
                <span>Konfirmasi Pesan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
