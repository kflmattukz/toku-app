import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  formatIDR,
  formatIDRInput,
  parseIDRInput,
  calculateItemDiscount,
  calculateCartTotals,
} from "#/lib/utils";
import type { CartItem, ItemDiscountModalState, Product } from "../types";
import type { ProductVariant } from "../../produk/types";

const EMPTY_PRODUCTS: Product[] = [];

export function useKasirCart(products: Product[] = EMPTY_PRODUCTS) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [basketDiscountType, setBasketDiscountType] = useState<"none" | "percentage" | "nominal">(
    "none",
  );
  const [basketDiscountValue, setBasketDiscountValue] = useState<string>("");

  const [itemDiscountModal, setItemDiscountModal] = useState<ItemDiscountModalState>(null);
  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  });

  // Sync cart quantities when products stock updates in real-time
  useEffect(() => {
    if (!products || products.length === 0 || cartRef.current.length === 0) return;

    const productsById = new Map<string, Product>(products.map((p) => [p._id, p]));
    let changed = false;
    const nextCart: CartItem[] = [];
    const notifications: Array<
      { type: "out_of_stock"; name: string } | { type: "adjusted"; name: string; stock: number }
    > = [];

    for (const item of cartRef.current) {
      const prod = productsById.get(item.productId);
      if (!prod) {
        nextCart.push(item);
        continue;
      }

      let availableStock = prod.stock;
      if (item.variantId && prod.hasVariants && prod.variants) {
        const v = prod.variants.find((v) => v.id === item.variantId);
        availableStock = v ? v.stock : 0;
      }

      if (availableStock <= 0) {
        changed = true;
        notifications.push({ type: "out_of_stock", name: item.name });
        continue;
      }

      if (item.qty > availableStock) {
        changed = true;
        notifications.push({ type: "adjusted", name: item.name, stock: availableStock });
        nextCart.push({ ...item, qty: availableStock });
      } else {
        nextCart.push(item);
      }
    }

    if (changed) {
      setCart(nextCart);
      for (const notif of notifications) {
        if (notif.type === "out_of_stock") {
          toast.warning(`Stok ${notif.name} habis`, {
            description: "Produk otomatis dikeluarkan dari keranjang",
          });
        } else {
          toast.warning(`Stok ${notif.name} disesuaikan`, {
            description: `Jumlah dikurangi menjadi ${notif.stock} pcs sesuai stok toko saat ini`,
          });
        }
      }
    }
  }, [products]);

  const addToCart = (product: Product, variant?: ProductVariant) => {
    const isVariant = Boolean(variant);
    const stockToCheck = isVariant ? variant!.stock : product.stock;
    const priceToCharge = isVariant ? variant!.price : product.price;
    const costToCharge = isVariant ? variant!.costPrice : product.costPrice;
    const displayName = isVariant ? `${product.name} (${variant!.name})` : product.name;

    if (stockToCheck <= 0) {
      toast.error(`Stok ${displayName} habis!`, {
        description: "Silakan restok terlebih dahulu",
      });
      return;
    }

    const existing = cart.find(
      (i) => i.productId === product._id && i.variantId === (variant?.id ?? undefined),
    );
    if (existing && existing.qty >= stockToCheck) {
      toast.warning(`Maksimal stok ${displayName} tercapai (${stockToCheck} pcs)`);
      return;
    }

    setCart((prev) => {
      const exists = prev.find(
        (i) => i.productId === product._id && i.variantId === (variant?.id ?? undefined),
      );
      if (exists) {
        return prev.map((i) =>
          i.productId === product._id && i.variantId === (variant?.id ?? undefined)
            ? { ...i, qty: i.qty + 1 }
            : i,
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          variantId: variant?.id,
          variantName: variant?.name,
          name: displayName,
          price: priceToCharge,
          costPrice: costToCharge,
          qty: 1,
          discountType: product.discountType,
          discountValue: product.discountValue,
        },
      ];
    });

    const disc = calculateItemDiscount(priceToCharge, product.discountType, product.discountValue);
    toast.success(`${displayName} ditambahkan`, {
      description: disc.hasDiscount
        ? `${formatIDR(disc.unitPrice)} (Diskon ${disc.discountLabel})`
        : formatIDR(priceToCharge),
    });

    if (stockToCheck <= 5) {
      toast.warning(`Peringatan Stok: ${displayName} tersisa ${stockToCheck} pcs!`);
    }
  };

  const updateQty = (productId: string, delta: number, variantId?: string) => {
    const current = cart.find(
      (i) => i.productId === productId && (variantId ? i.variantId === variantId : !i.variantId),
    );
    if (!current) return;

    if (delta > 0) {
      const product = products.find((p) => p._id === productId);
      let maxStock = product?.stock ?? 999;
      if (variantId && product?.hasVariants && product.variants) {
        const v = product.variants.find((v) => v.id === variantId);
        if (v) maxStock = v.stock;
      }
      if (current.qty >= maxStock) {
        toast.warning(`Maksimal stok ${current.name} tercapai (${maxStock} pcs)`);
        return;
      }
    }

    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId && (variantId ? i.variantId === variantId : !i.variantId)
            ? { ...i, qty: i.qty + delta }
            : i,
        )
        .filter((i) => i.qty > 0),
    );
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && (variantId ? i.variantId === variantId : !i.variantId)),
      ),
    );
  };

  const clearCart = () => {
    setCart([]);
    setBasketDiscountType("none");
    setBasketDiscountValue("");
  };

  const openItemDiscountModal = (item: CartItem) => {
    setItemDiscountModal({
      item,
      discountType: item.discountType ?? "none",
      discountValue:
        item.discountType === "percentage"
          ? String(item.discountValue ?? "")
          : item.discountType === "nominal"
            ? formatIDRInput(item.discountValue ?? "")
            : "",
    });
  };

  const saveItemDiscount = () => {
    if (!itemDiscountModal) return;
    const { item, discountType, discountValue } = itemDiscountModal;

    let discountTypeVal: "percentage" | "nominal" | undefined = undefined;
    let discountNum: number | undefined = undefined;

    if (discountType === "percentage") {
      const pct = Math.min(100, Math.max(0, parseInt(discountValue, 10) || 0));
      if (pct > 0) {
        discountTypeVal = "percentage";
        discountNum = pct;
      }
    } else if (discountType === "nominal") {
      const nom = parseIDRInput(discountValue);
      if (nom > 0) {
        discountTypeVal = "nominal";
        discountNum = Math.min(item.price, nom);
      }
    }

    setCart((prev) =>
      prev.map((i) =>
        i.productId === item.productId
          ? {
              ...i,
              discountType: discountTypeVal,
              discountValue: discountNum,
            }
          : i,
      ),
    );
    setItemDiscountModal(null);
    toast.success(`Diskon ${item.name} berhasil diperbarui`);
  };

  const basketDiscountValNum = useMemo(() => {
    return basketDiscountType === "percentage"
      ? parseInt(basketDiscountValue, 10) || 0
      : basketDiscountType === "nominal"
        ? parseIDRInput(basketDiscountValue)
        : 0;
  }, [basketDiscountType, basketDiscountValue]);

  const cartTotals = useMemo(() => {
    return calculateCartTotals(
      cart,
      basketDiscountType === "none" ? undefined : basketDiscountType,
      basketDiscountValNum,
    );
  }, [cart, basketDiscountType, basketDiscountValNum]);

  const totalItems = useMemo(() => cart.reduce((sum, i) => sum + i.qty, 0), [cart]);

  return {
    cart,
    setCart,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    itemDiscountModal,
    setItemDiscountModal,
    openItemDiscountModal,
    saveItemDiscount,
    basketDiscountType,
    setBasketDiscountType,
    basketDiscountValue,
    setBasketDiscountValue,
    basketDiscountValNum,
    cartTotals,
    totalItems,
    subtotal: cartTotals.itemsSubtotal,
    total: cartTotals.finalTotal,
    basketDiscountAmount: cartTotals.basketDiscountAmount,
    totalSavings: cartTotals.totalSavings,
  };
}
