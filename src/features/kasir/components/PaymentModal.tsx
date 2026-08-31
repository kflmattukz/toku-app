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
        <h2 className="text-xl font-extrabold text-(--color-text) tracking-tight">
          Konfirmasi Transaksi
        </h2>
        <p className="text-xs text-(--color-text-3) mt-1">
          Tinjau total keranjang, atur diskon transaksi, dan pilih metode bayar
        </p>
      </div>

      <div className="flex flex-col">
        {/* Payment Method Switcher */}
        <div className="flex gap-2.5 mb-4">
          {(["cash", "qris"] as PaymentMethod[]).map((m) => {
            const active = payMethod === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onPayMethodChange(m)}
                className={`press-tactile flex-1 py-3 px-2.5 rounded-full font-extrabold text-xs cursor-pointer flex items-center justify-center gap-2 border-2 transition-all ${
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
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
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
                className="bg-none border-none text-[var(--color-text-3)] text-[11px] font-bold cursor-pointer hover:text-rose-500"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Basket Discount Type Toggle */}
          <div className="flex gap-1.5 mb-2">
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
                  className={`press-tactile flex-1 py-1.5 px-0.5 rounded-full text-[11px] font-extrabold cursor-pointer border transition-all ${
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
                  className="w-full pr-10 pl-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 h-10"
                />
                <span className="absolute right-3.5 text-sm font-extrabold text-[var(--color-brand)]">
                  %
                </span>
              </div>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {[5, 10, 15, 20, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => onBasketDiscountValueChange(String(pct))}
                    className={`press-tactile py-0.5 px-2.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
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
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 h-10"
                />
              </div>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {[5000, 10000, 20000, 50000].map((nom) => (
                  <button
                    key={nom}
                    type="button"
                    onClick={() => onBasketDiscountValueChange(formatIDRInput(nom))}
                    className={`press-tactile py-0.5 px-2.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
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
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-1 text-xs text-[var(--color-text-2)]">
            <span>Subtotal Barang:</span>
            <span className="price font-bold">{formatIDR(subtotal)}</span>
          </div>

          {basketDiscountAmount > 0 && (
            <div className="flex justify-between items-center mb-1 text-xs text-[var(--color-brand)] font-bold">
              <span>Diskon Keranjang:</span>
              <span className="price">-{formatIDR(basketDiscountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-2 mt-1.5 border-t border-[var(--color-border)]">
            <div>
              <div className="text-[11px] text-[var(--color-text-3)] font-bold uppercase tracking-wider">
                Total Akhir Bayar
              </div>
              {totalSavings > 0 && (
                <span className="text-[10px] font-extrabold text-[var(--color-brand)] bg-[var(--color-brand-light)] px-1.5 py-0.5 rounded-full mt-0.5 inline-block">
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
              <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
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
                  className="w-full pl-12 pr-4 py-2.5 text-lg font-bold rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 h-12"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Cash Presets */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {Array.from(new Set([total, 10000, 20000, 50000, 100000, 200000]))
                .filter((v) => v >= total)
                .map((preset, idx) => (
                  <button
                    key={`${preset}-${idx}`}
                    type="button"
                    onClick={() => onCashInputChange(String(preset))}
                    className="press-tactile price py-2 px-3.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs font-extrabold cursor-pointer text-[var(--color-text)] whitespace-nowrap hover:bg-[var(--color-surface)]"
                  >
                    {preset === total ? "Uang Pas" : formatIDR(preset)}
                  </button>
                ))}
            </div>

            {cashPaid > 0 && (
              <div
                className={`p-3 rounded-xl border mb-4 ${
                  cashPaid >= total
                    ? "bg-[var(--color-success-light)] border-[var(--color-success)]"
                    : "bg-[var(--color-danger-light)] border-[var(--color-danger)]"
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

            <button
              type="button"
              onClick={onConfirm}
              disabled={cashPaid < total}
              className={`press-tactile w-full py-3.5 px-5 rounded-full font-extrabold text-sm text-white cursor-pointer shadow-lg transition-all ${
                cashPaid >= total
                  ? "bg-[var(--color-brand)] shadow-primary-500/30"
                  : "bg-[var(--color-border)] cursor-not-allowed opacity-60"
              }`}
            >
              Selesaikan Pembayaran Tunai
            </button>
          </>
        ) : (
          <>
            <div className="text-center py-5 px-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl mb-4">
              <QrCodeIcon
                size={72}
                weight="duotone"
                className="text-[var(--color-brand)] mx-auto mb-2"
              />
              <div className="text-sm font-extrabold text-[var(--color-text)]">
                Scan QRIS Pelanggan
              </div>
              <p className="text-xs text-[var(--color-text-3)] mt-0.5">
                Mendukung GoPay, OVO, Dana, ShopeePay, BCA & LinkAja
              </p>
            </div>
            <button
              type="button"
              onClick={onConfirm}
              className="press-tactile w-full py-3.5 px-5 rounded-full font-extrabold text-sm text-white cursor-pointer bg-[var(--color-brand)] shadow-lg shadow-primary-500/30"
            >
              Konfirmasi Pembayaran QRIS Lunas
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
