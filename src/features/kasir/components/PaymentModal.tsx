import { Button } from "#/components/ui";
import { Modal } from "#/components/Modal";
import { formatIDR, formatIDRInput, parseIDRInput } from "#/lib/utils";
import { MoneyIcon, QrCodeIcon, TagIcon } from "@phosphor-icons/react";
import type { PaymentMethod } from "../types";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  payMethod: PaymentMethod;
  onPayMethodChange: (method: PaymentMethod) => void;
  subtotal: number;
  total: number;
  totalSavings: number;
  basketDiscountType: "none" | "percentage" | "nominal";
  onBasketDiscountTypeChange: (type: "none" | "percentage" | "nominal") => void;
  basketDiscountValue: string;
  onBasketDiscountValueChange: (val: string) => void;
  basketDiscountAmount: number;
  cashInput: string;
  onCashInputChange: (val: string) => void;
  cashPaid: number;
  change: number;
  onConfirm: () => void;
}

export function PaymentModal({
  open,
  onClose,
  payMethod,
  onPayMethodChange,
  subtotal,
  total,
  totalSavings,
  basketDiscountType,
  onBasketDiscountTypeChange,
  basketDiscountValue,
  onBasketDiscountValueChange,
  basketDiscountAmount,
  cashInput,
  onCashInputChange,
  cashPaid,
  change,
  onConfirm,
}: PaymentModalProps) {
  if (!open) return null;

  return (
    <Modal onClose={onClose} maxWidth={520}>
      <div className="mb-4">
        <div className="eyebrow-tag mb-1">PEMBAYARAN</div>
        <h2 className="text-xl font-extrabold tracking-tight text-(--color-text)">
          Konfirmasi Transaksi
        </h2>
        <p className="mt-1 text-xs text-(--color-text-3)">
          Tinjau total keranjang, atur diskon transaksi, dan pilih metode bayar
        </p>
      </div>

      <div className="flex flex-col">
        {/* Payment Method Switcher */}
        <div className="mb-4 flex gap-2.5">
          {(["cash", "qris"] as PaymentMethod[]).map((m) => {
            const active = payMethod === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onPayMethodChange(m)}
                className={`press-tactile flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-2 px-2.5 py-3 text-xs font-extrabold transition-all ${
                  active
                    ? "border-(--color-brand) bg-(--color-brand-light) text-(--color-brand) shadow-xs"
                    : "border-(--color-border) bg-(--color-surface) text-(--color-text-2)"
                }`}
              >
                {m === "cash" ? (
                  <MoneyIcon size={18} weight="duotone" />
                ) : (
                  <QrCodeIcon size={18} weight="duotone" />
                )}
                <span>{m === "cash" ? "Tunai (Cash)" : "QRIS Digital"}</span>
              </button>
            );
          })}
        </div>

        {/* BASKET TOTAL DISCOUNT CARD */}
        <div className="mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--color-text)]">
              <TagIcon size={15} weight="bold" color="var(--color-brand)" />
              <span>Diskon Total Keranjang / Transaksi</span>
            </div>
            {basketDiscountType !== "none" && (
              <button
                type="button"
                onClick={() => {
                  onBasketDiscountTypeChange("none");
                  onBasketDiscountValueChange("");
                }}
                className="cursor-pointer border-none bg-none text-[11px] font-bold text-[var(--color-text-3)] hover:text-rose-500"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Basket Discount Type Toggle */}
          <div className="mb-2 flex gap-1.5">
            {[
              { key: "none", label: "Tanpa Diskon" },
              { key: "percentage", label: "Persen (%)" },
              { key: "nominal", label: "Potongan Rp" },
            ].map((t) => {
              const active = basketDiscountType === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    onBasketDiscountTypeChange(t.key as any);
                    if (t.key !== basketDiscountType) onBasketDiscountValueChange("");
                  }}
                  className={`press-tactile flex-1 cursor-pointer rounded-full border px-0.5 py-1.5 text-[11px] font-extrabold transition-all ${
                    active
                      ? "border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)]"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {basketDiscountType === "percentage" && (
            <div>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Besar diskon keranjang (%)"
                  value={basketDiscountValue}
                  onChange={(e) => onBasketDiscountValueChange(e.target.value)}
                  className="focus:ring-primary-500/20 focus:border-primary-500 h-10 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-10 pl-4 text-sm font-extrabold text-[var(--color-text)] focus:ring-2 focus:outline-none"
                />
                <span className="absolute right-3.5 text-sm font-extrabold text-[var(--color-brand)]">
                  %
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[5, 10, 15, 20, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => onBasketDiscountValueChange(String(pct))}
                    className={`press-tactile cursor-pointer rounded-full border px-2.5 py-0.5 text-[11px] font-bold transition-all ${
                      basketDiscountValue === String(pct)
                        ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {basketDiscountType === "nominal" && (
            <div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-extrabold text-[var(--color-brand)]">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Potongan total keranjang"
                  value={basketDiscountValue}
                  onChange={(e) => onBasketDiscountValueChange(formatIDRInput(e.target.value))}
                  className="focus:ring-primary-500/20 focus:border-primary-500 h-10 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-4 pl-10 text-sm font-extrabold text-[var(--color-text)] focus:ring-2 focus:outline-none"
                />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[5000, 10000, 20000, 50000].map((nom) => (
                  <button
                    key={nom}
                    type="button"
                    onClick={() => onBasketDiscountValueChange(formatIDRInput(nom))}
                    className={`press-tactile cursor-pointer rounded-full border px-2.5 py-0.5 text-[11px] font-bold transition-all ${
                      parseIDRInput(basketDiscountValue) === nom
                        ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]"
                    }`}
                  >
                    {nom >= 1000 ? `${nom / 1000}rb` : formatIDR(nom)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Total Bayar & Breakdown Box */}
        <div className="mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
          <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-text-2)]">
            <span>Subtotal Barang:</span>
            <span className="price font-bold">{formatIDR(subtotal)}</span>
          </div>

          {basketDiscountAmount > 0 && (
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-[var(--color-brand)]">
              <span>Diskon Keranjang:</span>
              <span className="price">-{formatIDR(basketDiscountAmount)}</span>
            </div>
          )}

          <div className="mt-1.5 flex items-baseline justify-between border-t border-[var(--color-border)] pt-2">
            <div>
              <div className="text-[11px] font-bold tracking-wider text-[var(--color-text-3)] uppercase">
                Total Akhir Bayar
              </div>
              {totalSavings > 0 && (
                <span className="mt-0.5 inline-block rounded-full bg-[var(--color-brand-light)] px-1.5 py-0.5 text-[10px] font-extrabold text-[var(--color-brand)]">
                  Hemat {formatIDR(totalSavings)}
                </span>
              )}
            </div>
            <div className="price text-2xl font-black text-[var(--color-brand)]">
              {formatIDR(total)}
            </div>
          </div>
        </div>

        {payMethod === "cash" ? (
          <>
            <div className="mb-3">
              <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                Uang Tunai Diterima (IDR)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-base font-extrabold text-[var(--color-text-2)]">
                  Rp
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={cashInput}
                  onChange={(e) => onCashInputChange(e.target.value)}
                  className="focus:ring-primary-500/20 focus:border-primary-500 h-12 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pr-4 pl-12 text-lg font-bold text-[var(--color-text)] focus:ring-2 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Cash Presets */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {Array.from(new Set([total, 10000, 20000, 50000, 100000, 200000]))
                .filter((v) => v >= total)
                .map((preset, idx) => (
                  <button
                    key={`${preset}-${idx}`}
                    type="button"
                    onClick={() => onCashInputChange(String(preset))}
                    className="press-tactile price cursor-pointer rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2 text-xs font-extrabold whitespace-nowrap text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                  >
                    {preset === total ? "Uang Pas" : formatIDR(preset)}
                  </button>
                ))}
            </div>

            {cashPaid > 0 && (
              <div
                className={`mb-4 rounded-xl border p-3 ${
                  cashPaid >= total
                    ? "border-[var(--color-success)] bg-[var(--color-success-light)]"
                    : "border-[var(--color-danger)] bg-[var(--color-danger-light)]"
                }`}
              >
                <span
                  className={`price text-sm font-extrabold ${
                    cashPaid >= total
                      ? "text-[var(--color-success-text)]"
                      : "text-[var(--color-danger-text)]"
                  }`}
                >
                  {cashPaid >= total
                    ? `Kembalian: ${formatIDR(change)}`
                    : `Kurang Bayar: ${formatIDR(total - cashPaid)}`}
                </span>
              </div>
            )}

            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              disabled={cashPaid < total}
              onClick={onConfirm}
            >
              Selesaikan Pembayaran Tunai
            </Button>
          </>
        ) : (
          <>
            <div className="mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-5 text-center">
              <QrCodeIcon
                size={72}
                weight="duotone"
                className="mx-auto mb-2 text-[var(--color-brand)]"
              />
              <div className="text-sm font-extrabold text-[var(--color-text)]">
                Scan QRIS Pelanggan
              </div>
              <p className="mt-0.5 text-xs text-[var(--color-text-3)]">
                Mendukung GoPay, OVO, Dana, ShopeePay, BCA & LinkAja
              </p>
            </div>
            <Button type="button" variant="primary" size="lg" fullWidth onClick={onConfirm}>
              Konfirmasi Pembayaran QRIS Lunas
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
