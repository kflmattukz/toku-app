import { useState, useEffect, useMemo } from "react";
import { Modal } from "#/components/Modal";
import { PlusIcon, MinusIcon, ArrowCounterClockwiseIcon, SparkleIcon, WarningIcon } from "@phosphor-icons/react";
import { Button } from "#/components/ui";
import type { Product } from "#/features/produk";

export interface VariantStockAdjustment {
  variantId: string;
  delta: number;
}

interface RestockModalProps {
  product: Product | null;
  onClose: () => void;
  threshold: number;
  restockAmt: string;
  onChangeRestockAmt: (val: string) => void;
  saving: boolean;
  onConfirm: (variantAdjustments?: VariantStockAdjustment[]) => void;
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

  const hasVariants = Boolean(product.hasVariants && product.variants && product.variants.length > 0);
  const variants = useMemo(() => product.variants ?? [], [product]);

  // State for variant deltas: variantId -> delta to add
  const [variantDeltas, setVariantDeltas] = useState<Record<string, number>>({});

  useEffect(() => {
    if (hasVariants) {
      const initial: Record<string, number> = {};
      variants.forEach((v) => {
        initial[v.id] = 0;
      });
      setVariantDeltas(initial);
    }
  }, [product._id, hasVariants, variants]);

  const handleVariantDeltaChange = (variantId: string, value: number) => {
    setVariantDeltas((prev) => ({
      ...prev,
      [variantId]: Math.max(0, value),
    }));
  };

  const handleVariantStep = (variantId: string, step: number) => {
    setVariantDeltas((prev) => {
      const current = prev[variantId] || 0;
      return {
        ...prev,
        [variantId]: Math.max(0, current + step),
      };
    });
  };

  const handleBulkAdd = (amount: number) => {
    setVariantDeltas((prev) => {
      const updated: Record<string, number> = {};
      variants.forEach((v) => {
        updated[v.id] = Math.max(0, (prev[v.id] || 0) + amount);
      });
      return updated;
    });
  };

  const handleResetAll = () => {
    const updated: Record<string, number> = {};
    variants.forEach((v) => {
      updated[v.id] = 0;
    });
    setVariantDeltas(updated);
  };

  const totalVariantAdded = useMemo(() => {
    return Object.values(variantDeltas).reduce((sum, d) => sum + (d > 0 ? d : 0), 0);
  }, [variantDeltas]);

  const handleConfirmVariants = () => {
    const adjustments: VariantStockAdjustment[] = Object.entries(variantDeltas)
      .filter(([_, delta]) => delta > 0)
      .map(([variantId, delta]) => ({ variantId, delta }));
    onConfirm(adjustments);
  };

  // Non-variant calculation
  const currentAmt = parseInt(restockAmt, 10) || 0;
  const handleSingleStep = (delta: number) => {
    const next = Math.max(1, currentAmt + delta);
    onChangeRestockAmt(String(next));
  };
  const handleSinglePreset = (val: number) => {
    onChangeRestockAmt(String(currentAmt + val));
  };

  return (
    <Modal onClose={onClose} maxWidth={hasVariants ? 560 : 440}>
      <div>
        <div className="eyebrow-tag mb-1">RESTOCK BARANG</div>
        <h2 className="text-xl font-black tracking-tight text-[var(--color-text)]">
          {hasVariants ? "Tambah Stok Varian Produk" : "Tambah Stok Produk"}
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-2)]">
          {hasVariants
            ? "Perbarui jumlah stok untuk masing-masing varian fisik barang ini."
            : "Perbarui jumlah stok fisik yang masuk ke toko Anda."}
        </p>

        {/* Product Info Banner */}
        <div className="my-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-[var(--color-text)]">{product.name}</span>
            {hasVariants && (
              <span className="rounded-full bg-[var(--color-brand)] px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-xs">
                {variants.length} Varian
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-[var(--color-text-2)]">
            <span>
              Total Stok Saat Ini:{" "}
              <strong className="font-extrabold text-[var(--color-text)]">{product.stock} pcs</strong>
            </span>
            <span>
              Batas Menipis:{" "}
              <strong className="font-extrabold text-[var(--color-warning-text)]">
                {threshold} pcs
              </strong>
            </span>
          </div>
        </div>

        {/* VARIANT RESTOCK UI */}
        {hasVariants ? (
          <div className="mb-4 space-y-3">
            {/* Quick Bulk Actions */}
            <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-2)]">
                <SparkleIcon size={14} className="text-[var(--color-brand)]" weight="fill" />
                <span>Aksi Semua:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleBulkAdd(5)}
                  className="press-tactile cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1 text-xs font-extrabold text-[var(--color-text)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                >
                  +5 Semua
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkAdd(10)}
                  className="press-tactile cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1 text-xs font-extrabold text-[var(--color-text)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                >
                  +10 Semua
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkAdd(20)}
                  className="press-tactile cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1 text-xs font-extrabold text-[var(--color-text)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                >
                  +20 Semua
                </button>
                {totalVariantAdded > 0 && (
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="press-tactile flex cursor-pointer items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs font-bold text-rose-500 hover:bg-rose-500/20"
                    title="Reset semua ke 0"
                  >
                    <ArrowCounterClockwiseIcon size={12} weight="bold" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* List of Variants */}
            <div className="max-h-[340px] space-y-2.5 overflow-y-auto pr-1">
              {variants.map((v) => {
                const delta = variantDeltas[v.id] || 0;
                const resultingStock = v.stock + delta;
                const isOutOfStock = v.stock <= 0;
                const isLow = !isOutOfStock && v.stock <= threshold;

                return (
                  <div
                    key={v.id}
                    className={`rounded-xl border p-3 transition-colors ${
                      delta > 0
                        ? "border-[var(--color-brand)]/50 bg-[var(--color-brand-light)]/20"
                        : "border-[var(--color-border)] bg-[var(--color-surface)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-[var(--color-text)] truncate">
                            {v.name || Object.values(v.combination).join(" / ")}
                          </span>
                          {isOutOfStock ? (
                            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.2 text-[10px] font-extrabold text-rose-500">
                              <WarningIcon size={10} weight="fill" /> Habis
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-extrabold text-amber-500">
                              <WarningIcon size={10} weight="fill" /> Menipis
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-0.5 text-[11px] text-[var(--color-text-2)]">
                          Stok saat ini:{" "}
                          <strong
                            className={`font-mono font-bold ${
                              isOutOfStock
                                ? "text-rose-500"
                                : isLow
                                  ? "text-amber-500"
                                  : "text-[var(--color-text)]"
                            }`}
                          >
                            {v.stock} pcs
                          </strong>
                          {delta > 0 && (
                            <span className="ml-1.5 font-bold text-[var(--color-brand)]">
                              → Menjadi {resultingStock} pcs (+{delta})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stepper controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={delta <= 0}
                          onClick={() => handleVariantStep(v.id, -1)}
                          className="press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface-3)] disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <MinusIcon size={13} weight="bold" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={delta === 0 ? "" : delta}
                          placeholder="0"
                          onChange={(e) =>
                            handleVariantDeltaChange(v.id, parseInt(e.target.value, 10) || 0)
                          }
                          className="h-8 w-14 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-center text-xs font-mono font-black text-[var(--color-text)] focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleVariantStep(v.id, 1)}
                          className="press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface-3)]"
                        >
                          <PlusIcon size={13} weight="bold" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVariantStep(v.id, 5)}
                          className="press-tactile ml-0.5 cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-1.5 py-1 text-[10px] font-black text-[var(--color-text-2)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVariantStep(v.id, 10)}
                          className="press-tactile cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-1.5 py-1 text-[10px] font-black text-[var(--color-text-2)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total summary bar */}
            <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-2)] p-3 border border-[var(--color-border)]">
              <div>
                <span className="text-xs text-[var(--color-text-2)]">Total Tambahan Stok:</span>
                <span className="ml-1.5 text-sm font-mono font-black text-[var(--color-brand)]">
                  +{totalVariantAdded} pcs
                </span>
              </div>
              <div>
                <span className="text-xs text-[var(--color-text-2)]">Total Stok Produk:</span>
                <span className="ml-1.5 text-sm font-mono font-black text-[var(--color-text)]">
                  {product.stock + totalVariantAdded} pcs
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* NON-VARIANT RESTOCK UI */
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
              Jumlah Stok Masuk (Pcs)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSingleStep(-10)}
                disabled={currentAmt <= 1}
                className="press-tactile flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-40"
                title="Kurang 10"
              >
                <span className="text-xs font-black">-10</span>
              </button>
              <button
                type="button"
                onClick={() => handleSingleStep(-1)}
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
                onClick={() => handleSingleStep(1)}
                className="press-tactile flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              >
                <PlusIcon size={16} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => handleSingleStep(10)}
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
                  onClick={() => handleSinglePreset(preset)}
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
        )}

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
            onClick={hasVariants ? handleConfirmVariants : () => onConfirm()}
            loading={saving}
            loadingText="Menyimpan..."
            disabled={hasVariants ? totalVariantAdded <= 0 : currentAmt <= 0}
          >
            {hasVariants ? `Simpan Restock (+${totalVariantAdded} Pcs)` : "Simpan Stok"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
