import { useState, useMemo, useEffect } from "react";
import { Modal } from "#/components/Modal";
import { formatIDR, calculateItemDiscount, cn } from "#/lib/utils";
import { Button } from "#/components/ui";
import { PackageIcon, CheckIcon, XIcon, WarningIcon } from "@phosphor-icons/react";
import type { Product, ProductVariant } from "../types";

interface VariantSelectionModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onSelectVariant: (product: Product, variant: ProductVariant) => void;
  cartItems?: { productId: string; variantId?: string; qty: number }[];
}

export function VariantSelectionModal({
  open,
  onClose,
  product,
  onSelectVariant,
  cartItems,
}: VariantSelectionModalProps) {
  if (!open || !product || !product.hasVariants || !product.variants) return null;

  const options = product.variantOptions || [];

  // Helper to find initial selection: prefer first variant with remaining stock > 0
  const getInitialSelection = (): Record<string, string> => {
    if (!product?.variants || product.variants.length === 0) {
      const initial: Record<string, string> = {};
      for (const opt of options) {
        if (opt.values && opt.values.length > 0) {
          initial[opt.name] = opt.values[0];
        }
      }
      return initial;
    }

    const inStockVariant = product.variants.find((v) => {
      const inCart = cartItems?.find((i) => i.productId === product._id && i.variantId === v.id)?.qty ?? 0;
      return v.stock > inCart;
    }) || product.variants.find((v) => v.stock > 0);

    if (inStockVariant?.combination) {
      return { ...inStockVariant.combination };
    }

    const firstVariant = product.variants[0];
    if (firstVariant?.combination) {
      return { ...firstVariant.combination };
    }

    const fallback: Record<string, string> = {};
    for (const opt of options) {
      if (opt.values && opt.values.length > 0) {
        fallback[opt.name] = opt.values[0];
      }
    }
    return fallback;
  };

  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(getInitialSelection);

  useEffect(() => {
    if (open && product) {
      setSelectedValues(getInitialSelection());
    }
  }, [open, product?._id]);

  // Find the variant matching selectedValues
  const currentVariant = useMemo(() => {
    return product.variants?.find((v) => {
      return Object.entries(selectedValues).every(
        ([optName, val]) => v.combination?.[optName] === val,
      );
    });
  }, [product.variants, selectedValues]);

  const qtyInCart = useMemo(() => {
    if (!currentVariant || !cartItems) return 0;
    return cartItems.find((i) => i.productId === product._id && i.variantId === currentVariant.id)?.qty ?? 0;
  }, [cartItems, currentVariant, product._id]);

  const remainingStock = currentVariant ? Math.max(0, currentVariant.stock - qtyInCart) : 0;
  const isOutOfStock = !currentVariant || currentVariant.stock <= 0;
  const isMaxCartStock = !isOutOfStock && remainingStock <= 0;
  const isAddDisabled = isOutOfStock || isMaxCartStock;

  // Determine option value status (disabled, label: "Habis" | "Maksimal")
  const getOptionValueStatus = (optName: string, val: string) => {
    if (!product?.variants || product.variants.length === 0) return { disabled: false, label: "" };

    const candidateCombination = { ...selectedValues, [optName]: val };
    const exactMatch = product.variants.find((v) =>
      Object.entries(candidateCombination).every(
        ([k, vVal]) => v.combination?.[k] === vVal,
      ),
    );

    if (exactMatch) {
      if (exactMatch.stock <= 0) return { disabled: true, label: "Habis" };
      const inCart = cartItems?.find((i) => i.productId === product._id && i.variantId === exactMatch.id)?.qty ?? 0;
      if (inCart >= exactMatch.stock) return { disabled: true, label: "Maksimal" };
      return { disabled: false, label: "" };
    }

    const hasAnyInStock = product.variants.some((v) => v.combination?.[optName] === val && v.stock > 0);
    if (!hasAnyInStock) return { disabled: true, label: "Habis" };

    const hasAnyAvailable = product.variants.some((v) => {
      if (v.combination?.[optName] !== val) return false;
      const inCart = cartItems?.find((i) => i.productId === product._id && i.variantId === v.id)?.qty ?? 0;
      return v.stock > inCart;
    });
    if (!hasAnyAvailable) return { disabled: true, label: "Maksimal" };

    return { disabled: false, label: "" };
  };

  const handleSelectValue = (optName: string, val: string) => {
    setSelectedValues((prev) => ({ ...prev, [optName]: val }));
  };

  const handleAdd = () => {
    if (!currentVariant || isAddDisabled) return;
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
                const status = getOptionValueStatus(opt.name, val);
                return (
                  <button
                    key={val}
                    type="button"
                    disabled={status.disabled}
                    onClick={() => handleSelectValue(opt.name, val)}
                    className={cn(
                      "press-tactile flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all",
                      status.disabled
                        ? "cursor-not-allowed border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text-3)] opacity-60 line-through"
                        : isSelected
                          ? "cursor-pointer border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)] shadow-xs"
                          : "cursor-pointer border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] hover:border-[var(--color-brand)]/40 hover:text-[var(--color-text)]",
                    )}
                    title={status.disabled ? `${val} (${status.label})` : val}
                  >
                    {isSelected && !status.disabled && <CheckIcon size={12} weight="bold" />}
                    <span>{val}</span>
                    {status.disabled && (
                      <span className="no-underline text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-rose-500/10 text-rose-500 ml-0.5">
                        {status.label}
                      </span>
                    )}
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
          ) : isMaxCartStock ? (
            <span className="flex items-center gap-1 font-bold text-amber-500">
              <WarningIcon size={13} weight="fill" /> Maksimal di keranjang ({currentVariant?.stock} pcs)
            </span>
          ) : (
            <span className="font-bold text-[var(--color-text)]">
              {remainingStock} pcs tersedia {qtyInCart > 0 && <span className="font-normal text-[var(--color-text-3)]">({qtyInCart} di keranjang)</span>}
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
          disabled={isAddDisabled}
          onClick={handleAdd}
        >
          {isOutOfStock
            ? "Stok Habis"
            : isMaxCartStock
              ? "Maksimal di Keranjang"
              : "Tambah ke Keranjang"}
        </Button>
      </div>
    </Modal>
  );
}
