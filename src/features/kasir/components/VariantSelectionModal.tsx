import { useState, useMemo } from "react";
import { Modal } from "#/components/Modal";
import { formatIDR, calculateItemDiscount } from "#/lib/utils";
import { Button } from "#/components/ui";
import { PackageIcon, CheckIcon, XIcon, WarningIcon } from "@phosphor-icons/react";
import type { Product, ProductVariant } from "../produk/types";

interface VariantSelectionModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onSelectVariant: (product: Product, variant: ProductVariant) => void;
}

export function VariantSelectionModal({
  open,
  onClose,
  product,
  onSelectVariant,
}: VariantSelectionModalProps) {
  if (!open || !product || !product.hasVariants || !product.variants) return null;

  const options = product.variantOptions || [];
  // Initialize selections with first available option value
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const opt of options) {
      if (opt.values && opt.values.length > 0) {
        initial[opt.name] = opt.values[0];
      }
    }
    return initial;
  });

  // Find the variant matching selectedValues
  const currentVariant = useMemo(() => {
    return product.variants?.find((v) => {
      return Object.entries(selectedValues).every(
        ([optName, val]) => v.combination?.[optName] === val,
      );
    });
  }, [product.variants, selectedValues]);

  const isOutOfStock = !currentVariant || currentVariant.stock <= 0;

  const handleSelectValue = (optName: string, val: string) => {
    setSelectedValues((prev) => ({ ...prev, [optName]: val }));
  };

  const handleAdd = () => {
    if (!currentVariant || isOutOfStock) return;
    onSelectVariant(product, currentVariant);
    onClose();
  };

  const disc = currentVariant
    ? calculateItemDiscount(
        currentVariant.price,
        product.discountType,
        product.discountValue,
      )
    : null;

  return (
    <Modal onClose={onClose} maxWidth={460} showCloseButton={false}>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]">
            {product.imageUrl || product.imageId ? (
              <img
                src={product.imageUrl || product.imageId}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <PackageIcon size={24} weight="duotone" className="text-[var(--color-brand)]" />
            )}
          </div>
          <div>
            <span className="eyebrow-tag mb-0.5">PILIH VARIAN</span>
            <h3 className="text-base font-black text-[var(--color-text)]">{product.name}</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:text-[var(--color-text)]"
        >
          <XIcon size={16} weight="bold" />
        </button>
      </div>

      {/* Option Groups Selector */}
      <div className="flex flex-col gap-4 py-2">
        {options.map((opt) => (
          <div key={opt.name}>
            <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
              {opt.name}
            </label>
            <div className="flex flex-wrap gap-2">
              {opt.values.map((val) => {
                const isSelected = selectedValues[opt.name] === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelectValue(opt.name, val)}
                    className={`press-tactile flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                      isSelected
                        ? "border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)] shadow-xs"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] hover:border-[var(--color-brand)]/40"
                    }`}
                  >
                    {isSelected && <CheckIcon size={12} weight="bold" />}
                    <span>{val}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Variant Price & Stock Info Box */}
      <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[var(--color-text-3)]">
              Varian Dipilih:
            </span>
            <div className="text-xs font-black text-[var(--color-text)]">
              {currentVariant ? currentVariant.name : "Kombinasi tidak tersedia"}
            </div>
          </div>
          <div className="text-right">
            {disc ? (
              <div>
                <div className="price text-base font-black text-[var(--color-brand)]">
                  {formatIDR(disc.unitPrice)}
                </div>
                {disc.hasDiscount && (
                  <div className="price text-[10px] text-[var(--color-text-3)] line-through">
                    {formatIDR(currentVariant?.price || 0)}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs font-bold text-rose-500">Tidak tersedia</span>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-[var(--color-border)] pt-2 text-[11px]">
          <span className="font-semibold text-[var(--color-text-3)]">Stok Varian:</span>
          {isOutOfStock ? (
            <span className="flex items-center gap-1 font-bold text-rose-500">
              <WarningIcon size={13} weight="fill" /> Stok Habis
            </span>
          ) : (
            <span className="font-bold text-[var(--color-text)]">
              {currentVariant?.stock} pcs tersedia
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <Button variant="secondary" size="md" onClick={onClose}>
          Batal
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled={isOutOfStock}
          onClick={handleAdd}
        >
          {isOutOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
        </Button>
      </div>
    </Modal>
  );
}
