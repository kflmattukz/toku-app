import { Modal } from "#/components/Modal";
import { Button } from "#/components/ui";
import { formatIDR, formatIDRInput, parseIDRInput, calculateItemDiscount } from "#/lib/utils";
import type { ItemDiscountModalState } from "../types";

interface ItemDiscountModalProps {
  state: ItemDiscountModalState;
  onChangeState: (state: ItemDiscountModalState) => void;
  onSave: () => void;
  onClose: () => void;
}

export function ItemDiscountModal({
  state,
  onChangeState,
  onSave,
  onClose,
}: ItemDiscountModalProps) {
  if (!state) return null;

  const currentValNum =
    state.discountType === "percentage"
      ? parseInt(state.discountValue, 10) || 0
      : parseIDRInput(state.discountValue);

  const preview = calculateItemDiscount(state.item.price, state.discountType, currentValNum);

  return (
    <Modal onClose={onClose} maxWidth={460}>
      <div className="mb-4">
        <div className="eyebrow-tag mb-1">DISKON PRODUK</div>
        <h2 className="text-xl font-extrabold tracking-tight text-[var(--color-text)]">
          Atur Diskon Item
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-3)]">
          Potongan harga khusus untuk produk <strong>{state.item.name}</strong>
        </p>
      </div>

      <div>
        <div className="mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3.5">
          <div className="text-xs font-bold text-[var(--color-text-3)]">Harga Normal Produk:</div>
          <div className="price mt-0.5 text-lg font-black text-[var(--color-text)]">
            {formatIDR(state.item.price)}
          </div>
        </div>

        {/* Type Switcher */}
        <div className="mb-3.5 flex gap-1.5">
          {[
            { key: "none", label: "Tanpa Diskon" },
            { key: "percentage", label: "Persen (%)" },
            { key: "nominal", label: "Nominal (Rp)" },
          ].map((t) => {
            const active = state.discountType === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() =>
                  onChangeState({
                    ...state,
                    discountType: t.key as any,
                    discountValue: t.key === state.discountType ? state.discountValue : "",
                  })
                }
                className={`press-tactile flex-1 cursor-pointer rounded-full border px-1 py-2 text-xs font-extrabold transition-all ${
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

        {state.discountType === "percentage" && (
          <div className="mb-4">
            <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
              Besaran Persentase Diskon
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                min="1"
                max="100"
                placeholder="Contoh: 10"
                value={state.discountValue}
                onChange={(e) =>
                  onChangeState({
                    ...state,
                    discountValue: e.target.value,
                  })
                }
                className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pr-10 pl-4 text-base font-extrabold text-[var(--color-text)] focus:ring-2 focus:outline-none"
                autoFocus
              />
              <span className="absolute right-4 text-base font-extrabold text-[var(--color-brand)]">
                %
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[5, 10, 15, 20, 25, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() =>
                    onChangeState({
                      ...state,
                      discountValue: String(pct),
                    })
                  }
                  className={`press-tactile cursor-pointer rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                    state.discountValue === String(pct)
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

        {state.discountType === "nominal" && (
          <div className="mb-4">
            <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
              Potongan Rupiah (IDR)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-sm font-extrabold text-[var(--color-brand)]">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 5.000"
                value={state.discountValue}
                onChange={(e) =>
                  onChangeState({
                    ...state,
                    discountValue: formatIDRInput(e.target.value),
                  })
                }
                className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pr-4 pl-12 text-base font-extrabold text-[var(--color-text)] focus:ring-2 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[2000, 5000, 10000, 20000, 50000].map((nom) => (
                <button
                  key={nom}
                  type="button"
                  onClick={() =>
                    onChangeState({
                      ...state,
                      discountValue: formatIDRInput(nom),
                    })
                  }
                  className={`press-tactile cursor-pointer rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                    parseIDRInput(state.discountValue) === nom
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

        {/* Live Discount Calculation Box */}
        {state.discountType !== "none" && (
          <div className="mb-4.5 flex items-center justify-between rounded-xl border border-[var(--color-brand)] bg-[var(--color-brand-light)] p-3">
            <div>
              <div className="text-[11px] font-bold text-[var(--color-text-2)]">
                Harga Satuan Baru:
              </div>
              <div className="price text-base font-extrabold text-[var(--color-brand)]">
                {formatIDR(preview.unitPrice)}
              </div>
            </div>
            <div className="rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[11px] font-extrabold text-[var(--color-brand)] shadow-xs">
              Hemat {formatIDR(preview.discountAmount)}/pcs
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            onClick={onSave}
          >
            Terapkan Diskon
          </Button>
        </div>
      </div>
    </Modal>
  );
}
