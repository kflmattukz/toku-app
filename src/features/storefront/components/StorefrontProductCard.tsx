import { memo } from "react";
import { PlusIcon, MinusIcon, PackageIcon } from "@phosphor-icons/react";
import { formatIDR, calculateItemDiscount, cn } from "#/lib/utils";
import type { StorefrontProduct } from "../types";

interface StorefrontProductCardProps {
  product: StorefrontProduct;
  cartQty: number;
  onUpdateQty: (product: StorefrontProduct, delta: number) => void;
}

export const StorefrontProductCard = memo(function StorefrontProductCard({
  product,
  cartQty,
  onUpdateQty,
}: StorefrontProductCardProps) {
  const disc = calculateItemDiscount(
    product.price,
    product.discountType as "percentage" | "nominal" | undefined,
    product.discountValue,
  );
  const isOutOfStock = product.stock <= 0;
  const imageSource = product.imageUrl || product.imageId;

  return (
    <article
      role="button"
      tabIndex={isOutOfStock ? -1 : 0}
      aria-label={`${product.name}, harga ${formatIDR(disc.unitPrice)}, ${isOutOfStock ? "stok habis" : `stok ${product.stock}`}`}
      onClick={() => {
        if (!isOutOfStock) onUpdateQty(product, 1);
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !isOutOfStock) {
          e.preventDefault();
          onUpdateQty(product, 1);
        }
      }}
      className={cn(
        "group relative flex flex-col justify-between p-3.5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] transition-all select-none outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]",
        isOutOfStock
          ? "opacity-60 grayscale cursor-not-allowed"
          : "cursor-pointer hover:border-[var(--color-brand)]/60 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 press-tactile",
      )}
    >
      <div>
        {/* Product Image Box */}
        <div className="relative mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          {imageSource ? (
            <img
              src={imageSource}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-[var(--color-text-3)]">
              <PackageIcon size={36} weight="duotone" className="text-[var(--color-brand)] opacity-50" />
              <span className="text-[10px] font-bold opacity-60">Toku POS</span>
            </div>
          )}

          {/* Discount Badge */}
          {disc.hasDiscount && (
            <div className="absolute top-2 left-2 z-10 rounded-lg bg-rose-500 text-white px-2 py-0.5 text-[10px] font-black shadow-xs">
              {product.discountType === "percentage"
                ? `-${product.discountValue}%`
                : `-${formatIDR(product.discountValue || 0)}`}
            </div>
          )}

          {/* Cart Quantity Badge */}
          {cartQty > 0 && (
            <div
              aria-label={`${cartQty} dalam keranjang`}
              className="absolute top-2 right-2 z-10 flex items-center justify-center rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-xs font-black text-white shadow-md animate-in zoom-in-75 duration-200"
            >
              <span>{cartQty}x</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex items-start justify-between gap-1.5 mb-2">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-3)] tracking-wider">
              {product.category}
            </span>
            <h3 className="font-semibold text-sm text-[var(--color-text)] line-clamp-2 mt-0.5 group-hover:text-[var(--color-brand)] transition-colors">
              {product.name}
            </h3>
          </div>
          <span
            className={cn(
              "shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold",
              product.stock > 5
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : product.stock > 0
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-rose-500/10 text-rose-600",
            )}
          >
            {product.stock > 0 ? `Sisa ${product.stock}` : "Habis"}
          </span>
        </div>
      </div>

      {/* Pricing & Actions */}
      <div className="mt-3 pt-2.5 border-t border-[var(--color-border)] flex items-center justify-between min-h-[38px] gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-base font-black text-[var(--color-brand)] font-mono tracking-tight">
            {formatIDR(disc.unitPrice)}
          </span>
          {disc.hasDiscount && (
            <span className="text-xs text-[var(--color-text-3)] line-through font-mono">
              {formatIDR(product.price)}
            </span>
          )}
        </div>

        {/* Stepper or Quick Add Button */}
        {isOutOfStock ? (
          <span className="text-xs text-[var(--color-text-3)] font-semibold">Habis</span>
        ) : cartQty > 0 ? (
          <div
            className="flex items-center gap-1 bg-[var(--color-surface)] rounded-xl p-0.5 border border-[var(--color-border)] shadow-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQty(product, -1);
              }}
              aria-label={`Kurangi 1 ${product.name}`}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] active:scale-90 transition-all press-tactile"
            >
              <MinusIcon size={12} weight="bold" />
            </button>
            <span
              className="w-6 text-center text-xs font-black text-[var(--color-text)] font-mono"
              aria-label={`Jumlah ${cartQty}`}
            >
              {cartQty}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQty(product, 1);
              }}
              aria-label={`Tambah 1 ${product.name}`}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--color-brand)] text-white hover:opacity-90 active:scale-90 transition-all press-tactile"
            >
              <PlusIcon size={12} weight="bold" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQty(product, 1);
            }}
            aria-label={`Pilih ${product.name}`}
            className="w-8 h-8 rounded-xl bg-[var(--color-brand)] text-white flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 transition-all press-tactile"
          >
            <PlusIcon size={16} weight="bold" />
          </button>
        )}
      </div>
    </article>
  );
});
