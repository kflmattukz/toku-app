import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { calculateItemDiscount } from "#/lib/utils";
import type { StorefrontCartItem, StorefrontProduct } from "../types";

export function useStorefrontCart(storeSlug: string) {
  const storageKey = `toku_cart_${storeSlug}`;

  const [cart, setCart] = useState<Record<string, StorefrontCartItem>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      if (Object.keys(cart).length === 0) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(cart));
      }
    } catch {
      // Ignore storage errors (quota/private mode)
    }
  }, [cart, storageKey]);

  const updateQty = useCallback((product: StorefrontProduct, delta: number) => {
    setCart((prev) => {
      const existing = prev[product._id];
      const disc = calculateItemDiscount(
        product.price,
        product.discountType as "percentage" | "nominal" | undefined,
        product.discountValue,
      );
      const unitPrice = disc.unitPrice;
      const currentQty = existing ? existing.qty : 0;
      const nextQty = currentQty + delta;

      if (nextQty <= 0) {
        const next = { ...prev };
        delete next[product._id];
        return next;
      }

      if (nextQty > product.stock) {
        toast.error(`Maksimal stok tersedia hanya ${product.stock}`);
        return prev;
      }

      return {
        ...prev,
        [product._id]: {
          productId: product._id,
          name: product.name,
          price: product.price,
          qty: nextQty,
          subtotal: unitPrice * nextQty,
          discountType: product.discountType as "percentage" | "nominal" | undefined,
          discountValue: product.discountValue,
          maxStock: product.stock,
          imageUrl: product.imageUrl || product.imageId,
        },
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  const { totalItems, subtotal, total } = useMemo(() => {
    let itemsCount = 0;
    let sum = 0;
    Object.values(cart).forEach((item) => {
      itemsCount += item.qty;
      sum += item.subtotal;
    });
    return {
      totalItems: itemsCount,
      subtotal: sum,
      total: sum,
    };
  }, [cart]);

  return {
    cart,
    updateQty,
    clearCart,
    totalItems,
    subtotal,
    total,
  };
}
