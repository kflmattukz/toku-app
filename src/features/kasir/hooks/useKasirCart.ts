import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  formatIDR,
  formatIDRInput,
  parseIDRInput,
  calculateItemDiscount,
  calculateCartTotals,
} from "#/lib/utils";
import type { CartItem, ItemDiscountModalState, Product } from "../types";

export function useKasirCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [basketDiscountType, setBasketDiscountType] = useState<"none" | "percentage" | "nominal">(
    "none",
  );
  const [basketDiscountValue, setBasketDiscountValue] = useState<string>("");

  const [itemDiscountModal, setItemDiscountModal] = useState<ItemDiscountModalState>(null);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error(`Stok ${product.name} habis!`, {
        description: "Silakan restok terlebih dahulu",
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) => (i.productId === product._id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          costPrice: product.costPrice,
          qty: 1,
          discountType: product.discountType,
          discountValue: product.discountValue,
        },
      ];
    });

    const disc = calculateItemDiscount(product.price, product.discountType, product.discountValue);
    toast.success(`${product.name} ditambahkan`, {
      description: disc.hasDiscount
        ? `${formatIDR(disc.unitPrice)} (Diskon ${disc.discountLabel})`
        : formatIDR(product.price),
    });

    if (product.stock <= 5) {
      toast.warning(`Peringatan Stok: ${product.name} tersisa ${product.stock} pcs!`);
    }
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
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
