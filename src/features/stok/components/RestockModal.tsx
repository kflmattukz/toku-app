import { Modal } from "#/components/Modal";
import { PlusIcon, MinusIcon } from "@phosphor-icons/react";
import type { Product } from "#/features/produk";

interface RestockModalProps {
  product: Product | null;
  onClose: () => void;
  threshold: number;
  restockAmt: string;
  onChangeRestockAmt: (val: string) => void;
  saving: boolean;
  onConfirm: () => void;
}

export function RestockModal({
  product,
  onClose,
  threshold,
  restockAmt,
  onChangeRestockAmt,
  saving,
  onConfirm,
}: RestockModalProps) {
  if (!product) return null;

  const currentAmt = parseInt(restockAmt, 10) || 0;
  const isLow = product.stock <= threshold;

  return (
    <Modal onClose={onClose} maxWidth={440}>
      <div>
        <div className="mb-4">
          <div className="eyebrow-tag mb-1">RESTOCK BARANG</div>
          <h2 className="text-xl font-black tracking-tight text-[var(--color-text)]">
            Tambah Stok: {product.name}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-text-3)]">Kategori: {product.category}</p>
        </div>

        {/* Before / After Comparison Card */}
        <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3.5 text-center">
          <div>
            <div className="text-[10px] font-extrabold tracking-wider text-[var(--color-text-3)] uppercase">
              Stok Saat Ini
            </div>
            <div
              className={`price mt-0.5 text-xl font-black ${
                isLow ? "text-[var(--color-danger-text)]" : "text-[var(--color-text)]"
              }`}
            >
              {product.stock} pcs
            </div>
          </div>

          <div className="text-base font-black text-[var(--color-text-3)] opacity-60">➔</div>

          <div>
            <div className="text-[10px] font-extrabold tracking-wider text-[var(--color-brand)] uppercase">
              Stok Baru
            </div>
            <div className="price mt-0.5 text-xl font-black text-[var(--color-brand)]">
              {product.stock + currentAmt} pcs
            </div>
          </div>
        </div>

        {/* Stepper Input */}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
            Jumlah Tambahan Stok (pcs)
          </label>
          <div className="flex items-center gap-2.5 rounded-[14px] border-2 border-[var(--color-brand)] bg-[var(--color-surface)] p-2 shadow-xs">
            <button
              type="button"
              onClick={() => onChangeRestockAmt(String(Math.max(1, currentAmt - 1)))}
              disabled={currentAmt <= 1 || saving}
              className="press-tactile flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] disabled:opacity-40"
            >
              <MinusIcon size={16} weight="bold" />
            </button>

            <input
              type="text"
              inputMode="numeric"
              value={restockAmt}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                const num = parseInt(raw, 10);
                onChangeRestockAmt(num > 0 ? String(num) : "");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && currentAmt > 0 && !saving) {
                  e.preventDefault();
                  onConfirm();
                }
              }}
              autoFocus
              placeholder="0"
              className="w-full border-none bg-transparent text-center font-mono text-2xl font-black text-[var(--color-text)] outline-none"
            />

            <button
              type="button"
              onClick={() => onChangeRestockAmt(String(currentAmt + 1))}
              disabled={saving}
              className="press-tactile shadow-primary-500/25 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-[var(--color-brand)] text-white shadow-md"
            >
              <PlusIcon size={16} weight="bold" />
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-5">
          <div className="mb-1.5 text-[11px] font-bold text-[var(--color-text-3)]">
            Pilihan Cepat Tambahan:
          </div>
          <div className="flex gap-2">
            {[5, 10, 25, 50].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeRestockAmt(String(preset))}
                className={`press-tactile flex-1 cursor-pointer rounded-full border py-1.5 text-xs font-extrabold transition-all ${
                  currentAmt === preset
                    ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white shadow-sm"
                    : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
                }`}
              >
                +{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="press-tactile flex-1 cursor-pointer rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] py-3 text-xs font-extrabold text-[var(--color-text)]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving || currentAmt <= 0}
            className="press-tactile flex-1.3 shadow-primary-500/25 cursor-pointer rounded-full bg-[var(--color-brand)] py-3 text-xs font-extrabold text-white shadow-md disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Tambahan Stok"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
