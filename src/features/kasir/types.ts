import type { VariantOptionGroup, ProductVariant, Product } from "../produk/types";
export type { VariantOptionGroup, ProductVariant, Product };

export type CartItem = {
  productId: string;
  variantId?: string;
  variantName?: string;
  name: string;
  price: number;
  costPrice?: number;
  qty: number;
  discountType?: "percentage" | "nominal";
  discountValue?: number;
};

export type PaymentMethod = "cash" | "qris";

export type ItemDiscountModalState = {
  item: CartItem;
  discountType: "none" | "percentage" | "nominal";
  discountValue: string;
} | null;

