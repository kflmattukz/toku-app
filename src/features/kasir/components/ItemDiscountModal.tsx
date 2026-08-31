import { Modal } from "#/components/Modal";
import {
  formatIDR,
  formatIDRInput,
  parseIDRInput,
  calculateItemDiscount,
} from "#/lib/utils";
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
        <h2 className="text-xl font-extrabold text-[var(--color-text)] tracking-tight">
          Atur Diskon Item
        </h2>
        <p className="text-xs text-[var(--color-text-3)] mt-1">
          Potongan harga khusus untuk produk <strong>{state.item.name}</strong>
        </p>
      </div>

      <div>
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-3.5 mb-4">
          <div className="text-xs text-[var(--color-text-3)] font-bold">Harga Normal Produk:</div>
          <div className="price text-lg font-black text-[var(--color-text)] mt-0.5">
            {formatIDR(state.item.price)}
          </div>
        </div>

        {/* Type Switcher */}
        <div className="flex gap-1.5 mb-3.5">
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
                className={`press-tactile flex-1 py-2 px-1 rounded-full text-xs font-extrabold cursor-pointer transition-all border ${
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
            <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
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
                className="w-full pr-10 pl-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-extrabold text-base focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                autoFocus
              />
              <span className="absolute right-4 text-base font-extrabold text-[var(--color-brand)]">
                %
              </span>
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
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
                  className={`press-tactile py-1 px-3 rounded-full text-xs font-bold border transition-all cursor-pointer ${
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
            <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
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
                className="w-full pl-12 pr-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-extrabold text-base focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                autoFocus
              />
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
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
                  className={`press-tactile py-1 px-3 rounded-full text-xs font-bold border transition-all cursor-pointer ${
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
          <div className="p-3 rounded-xl bg-[var(--color-brand-light)] border border-[var(--color-brand)] flex justify-between items-center mb-4.5">
            <div>
              <div className="text-[11px] font-bold text-[var(--color-text-2)]">
                Harga Satuan Baru:
              </div>
              <div className="price text-base font-extrabold text-[var(--color-brand)]">
                {formatIDR(preview.unitPrice)}
              </div>
            </div>
            <div className="text-[11px] font-extrabold text-[var(--color-brand)] bg-[var(--color-surface)] px-2.5 py-1 rounded-full shadow-xs">
              Hemat {formatIDR(preview.discountAmount)}/pcs
            </div>
          </div>
        )}

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="press-tactile flex-1 py-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] text-sm font-bold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSave}
            className="press-tactile flex-1 py-3 rounded-full bg-[var(--color-brand)] text-white text-sm font-extrabold cursor-pointer shadow-md shadow-primary-500/20"
          >
            Terapkan Diskon
          </button>
        </div>
      </div>
    </Modal>
  );
}
