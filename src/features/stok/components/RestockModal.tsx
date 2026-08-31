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
          <h2 className="text-xl font-black text-[var(--color-text)] tracking-tight">
            Tambah Stok: {product.name}
          </h2>
          <p className="text-xs text-[var(--color-text-3)] mt-0.5">
            Kategori: {product.category}
          </p>
        </div>

        {/* Before / After Comparison Card */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-3.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[14px] mb-5 text-center">
          <div>
            <div className="text-[10px] font-extrabold text-[var(--color-text-3)] uppercase tracking-wider">
              Stok Saat Ini
            </div>
            <div
              className={`price text-xl font-black mt-0.5 ${
                isLow ? "text-[var(--color-danger-text)]" : "text-[var(--color-text)]"
              }`}
            >
              {product.stock} pcs
            </div>
          </div>

          <div className="text-base font-black text-[var(--color-text-3)] opacity-60">➔</div>

          <div>
            <div className="text-[10px] font-extrabold text-[var(--color-brand)] uppercase tracking-wider">
              Stok Baru
            </div>
            <div className="price text-xl font-black text-[var(--color-brand)] mt-0.5">
              {product.stock + currentAmt} pcs
            </div>
          </div>
        </div>

        {/* Stepper Input */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
            Jumlah Tambahan Stok (pcs)
          </label>
          <div className="flex items-center gap-2.5 bg-[var(--color-surface)] border-2 border-[var(--color-brand)] rounded-[14px] p-2 shadow-xs">
            <button
              type="button"
              onClick={() => onChangeRestockAmt(String(Math.max(1, currentAmt - 1)))}
              disabled={currentAmt <= 1 || saving}
              className="press-tactile w-10 h-10 rounded-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] flex items-center justify-center cursor-pointer disabled:opacity-40 shrink-0"
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
              className="w-full text-center text-2xl font-black text-[var(--color-text)] border-none bg-transparent outline-none font-mono"
            />

            <button
              type="button"
              onClick={() => onChangeRestockAmt(String(currentAmt + 1))}
              disabled={saving}
              className="press-tactile w-10 h-10 rounded-[10px] bg-[var(--color-brand)] text-white flex items-center justify-center cursor-pointer shadow-md shadow-primary-500/25 shrink-0"
            >
              <PlusIcon size={16} weight="bold" />
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-5">
          <div className="text-[11px] font-bold text-[var(--color-text-3)] mb-1.5">
            Pilihan Cepat Tambahan:
          </div>
          <div className="flex gap-2">
            {[5, 10, 25, 50].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeRestockAmt(String(preset))}
                className={`press-tactile flex-1 py-1.5 rounded-full text-xs font-extrabold cursor-pointer border transition-all ${
                  currentAmt === preset
                    ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-sm"
                    : "bg-[var(--color-surface-2)] text-[var(--color-text)] border-[var(--color-border)]"
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
            className="press-tactile flex-1 py-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] text-xs font-extrabold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving || currentAmt <= 0}
            className="press-tactile flex-1.3 py-3 rounded-full bg-[var(--color-brand)] text-white text-xs font-extrabold cursor-pointer shadow-md shadow-primary-500/25 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan Tambahan Stok"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
