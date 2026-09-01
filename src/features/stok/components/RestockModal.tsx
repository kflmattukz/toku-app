import { Modal } from "#/components/Modal";
import { PlusIcon, MinusIcon } from "@phosphor-icons/react";
import { Button } from "#/components/ui";
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

  const handleStep = (delta: number) => {
    const next = Math.max(1, currentAmt + delta);
    onChangeRestockAmt(String(next));
  };

  const handlePreset = (val: number) => {
    onChangeRestockAmt(String(currentAmt + val));
  };

  return (
    <Modal onClose={onClose} maxWidth={440}>
      <div>
        <div className="eyebrow-tag mb-1">RESTOCK BARANG</div>
        <h2 className="text-xl font-black tracking-tight text-[var(--color-text)]">
          Tambah Stok Produk
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-2)]">
          Perbarui jumlah stok fisik yang masuk ke toko Anda.
        </p>

        {/* Product Info Banner */}
        <div className="my-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
          <div className="text-sm font-extrabold text-[var(--color-text)]">{product.name}</div>
          <div className="mt-1 flex items-center justify-between text-xs text-[var(--color-text-2)]">
            <span>
              Stok Saat Ini:{" "}
              <strong className="font-extrabold text-[var(--color-text)]">{product.stock}</strong>
            </span>
            <span>
              Batas Menipis:{" "}
              <strong className="font-extrabold text-[var(--color-warning-text)]">
                {threshold}
              </strong>
            </span>
          </div>
        </div>

        {/* Restock Counter */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
            Jumlah Stok Masuk (Pcs)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStep(-10)}
              disabled={currentAmt <= 1}
              className="press-tactile flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-40"
              title="Kurang 10"
            >
              <span className="text-xs font-black">-10</span>
            </button>
            <button
              type="button"
              onClick={() => handleStep(-1)}
              disabled={currentAmt <= 1}
              className="press-tactile flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MinusIcon size={16} weight="bold" />
            </button>
            <input
              type="number"
              min="1"
              value={restockAmt}
              onChange={(e) => onChangeRestockAmt(e.target.value)}
              className="h-11 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-center text-lg font-black text-[var(--color-text)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleStep(1)}
              className="press-tactile flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
            >
              <PlusIcon size={16} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => handleStep(10)}
              className="press-tactile flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              title="Tambah 10"
            >
              <span className="text-xs font-black">+10</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[10px] font-bold text-[var(--color-text-3)]">Cepat:</span>
            {[10, 25, 50, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePreset(preset)}
                className={`press-tactile cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${
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
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            onClick={onConfirm}
            loading={saving}
            loadingText="Menyimpan..."
            disabled={currentAmt <= 0}
          >
            Simpan Stok
          </Button>
        </div>
      </div>
    </Modal>
  );
}
