import {
  PackageIcon,
  CheckCircleIcon,
  TagIcon,
  WarningIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { formatIDR, calculateItemDiscount } from "#/lib/utils";
import type { CartItem, Product } from "../types";

interface KasirProductCardProps {
  product: Product;
  inCart?: CartItem;
  onAddToCart: (product: Product) => void;
  onUpdateQty: (productId: string, delta: number) => void;
}

export function KasirProductCard({
  product,
  inCart,
  onAddToCart,
  onUpdateQty,
}: KasirProductCardProps) {
  const disc = calculateItemDiscount(product.price, product.discountType, product.discountValue);

  return (
    <div
      onClick={() => onAddToCart(product)}
      className="squircle-card product-card-interactive select-none cursor-pointer flex flex-col justify-between p-3 rounded-2xl min-h-[190px] relative transition-all"
      style={{
        border: inCart ? "2px solid var(--color-brand)" : "1.5px solid var(--color-border)",
        boxShadow: inCart ? "0 8px 24px rgba(234, 88, 12, 0.2)" : "var(--shadow-sm)",
      }}
    >
      {/* 1:1 Box Style Image Container */}
      <div className="relative w-full aspect-square rounded-[12px] overflow-hidden mb-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center">
        {product.imageUrl || product.imageId ? (
          <img
            src={product.imageUrl || product.imageId}
            alt={product.name}
            className="card-img-zoom w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[var(--color-text-3)] bg-[var(--color-surface-2)]">
            <PackageIcon
              size={38}
              weight="duotone"
              className="text-[var(--color-brand)] opacity-60"
            />
            <span className="text-[10px] font-bold opacity-60">Toku POS</span>
          </div>
        )}

        {inCart && (
          <div className="absolute top-2 right-2 bg-[var(--color-brand)] text-white px-2 py-0.5 rounded-full flex items-center gap-1 text-xs font-extrabold shadow-md shadow-primary-500/30 z-2">
            <CheckCircleIcon size={13} weight="fill" />
            <span>{inCart.qty}x</span>
          </div>
        )}

        {disc.hasDiscount ? (
          <div className="absolute top-2 left-2 bg-[var(--color-brand)] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md shadow-primary-500/30 z-2">
            <TagIcon size={11} weight="fill" />
            <span>
              {product.discountType === "percentage"
                ? `${product.discountValue}%`
                : `-${formatIDR(product.discountValue ?? 0)}`}
            </span>
          </div>
        ) : product.stock <= 5 && !inCart ? (
          <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs z-2">
            <WarningIcon size={11} weight="fill" />
            <span>Stok {product.stock}</span>
          </div>
        ) : null}
      </div>

      {/* Product Title & Price */}
      <div>
        <div className="text-sm font-extrabold text-[var(--color-text)] leading-snug mb-1 line-clamp-1">
          {product.name}
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="price text-sm font-extrabold text-[var(--color-brand)]">
            {formatIDR(disc.unitPrice)}
          </span>
          {disc.hasDiscount && (
            <span className="price text-[11px] text-[var(--color-text-3)] line-through">
              {formatIDR(product.price)}
            </span>
          )}
        </div>
      </div>

      {/* Integrated Quantity Stepper Controls (When in cart) */}
      {inCart && (
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQty(product._id, -1);
            }}
            className="press-tactile w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors"
            title={inCart.qty === 1 ? "Hapus dari keranjang" : "Kurangi"}
            style={{
              background:
                inCart.qty === 1 ? "rgba(239, 68, 68, 0.1)" : "var(--color-surface-3)",
              color: inCart.qty === 1 ? "var(--color-danger)" : "var(--color-text-2)",
            }}
          >
            {inCart.qty === 1 ? (
              <TrashIcon size={13} weight="bold" />
            ) : (
              <MinusIcon size={12} weight="bold" />
            )}
          </button>

          <span className="text-xs font-extrabold text-[var(--color-brand)] font-mono">
            {inCart.qty} pcs
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQty(product._id, 1);
            }}
            className="press-tactile w-7 h-7 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center cursor-pointer shadow-xs"
            title="Tambah"
          >
            <PlusIcon size={12} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}
