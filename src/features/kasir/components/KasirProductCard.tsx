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
      className="squircle-card product-card-interactive relative flex min-h-[190px] cursor-pointer flex-col justify-between rounded-2xl p-3 transition-all select-none"
      style={{
        border: inCart ? "2px solid var(--color-brand)" : "1.5px solid var(--color-border)",
        boxShadow: inCart ? "0 8px 24px rgba(234, 88, 12, 0.2)" : "var(--shadow-sm)",
      }}
    >
      {/* 1:1 Box Style Image Container */}
      <div className="relative mb-2.5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-2)]">
        {product.imageUrl || product.imageId ? (
          <img
            src={product.imageUrl || product.imageId}
            alt={product.name}
            className="card-img-zoom h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-[var(--color-surface-2)] text-[var(--color-text-3)]">
            <PackageIcon
              size={38}
              weight="duotone"
              className="text-[var(--color-brand)] opacity-60"
            />
            <span className="text-[10px] font-bold opacity-60">Toku POS</span>
          </div>
        )}

        {inCart && (
          <div className="shadow-primary-500/30 absolute top-2 right-2 z-2 flex items-center gap-1 rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-xs font-extrabold text-white shadow-md">
            <CheckCircleIcon size={13} weight="fill" />
            <span>{inCart.qty}x</span>
          </div>
        )}

        {disc.hasDiscount ? (
          <div className="shadow-primary-500/30 absolute top-2 left-2 z-2 flex items-center gap-0.5 rounded-full bg-[var(--color-brand)] px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-md">
            <TagIcon size={11} weight="fill" />
            <span>
              {product.discountType === "percentage"
                ? `${product.discountValue}%`
                : `-${formatIDR(product.discountValue ?? 0)}`}
            </span>
          </div>
        ) : product.stock <= 5 && !inCart ? (
          <div className="absolute top-2 left-2 z-2 flex items-center gap-0.5 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
            <WarningIcon size={11} weight="fill" />
            <span>Stok {product.stock}</span>
          </div>
        ) : null}
      </div>

      {/* Product Title & Price */}
      <div>
        <div className="mb-1 line-clamp-1 text-sm leading-snug font-extrabold text-[var(--color-text)]">
          {product.name}
        </div>
        <div className="flex flex-wrap items-baseline gap-1.5">
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
        <div className="mt-2.5 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQty(product._id, -1);
            }}
            className="press-tactile flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors"
            title={inCart.qty === 1 ? "Hapus dari keranjang" : "Kurangi"}
            style={{
              background: inCart.qty === 1 ? "rgba(239, 68, 68, 0.1)" : "var(--color-surface-3)",
              color: inCart.qty === 1 ? "var(--color-danger)" : "var(--color-text-2)",
            }}
          >
            {inCart.qty === 1 ? (
              <TrashIcon size={13} weight="bold" />
            ) : (
              <MinusIcon size={12} weight="bold" />
            )}
          </button>

          <span className="font-mono text-xs font-extrabold text-[var(--color-brand)]">
            {inCart.qty} pcs
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateQty(product._id, 1);
            }}
            className="press-tactile flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[var(--color-brand)] text-white shadow-xs"
            title="Tambah"
          >
            <PlusIcon size={12} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
}
