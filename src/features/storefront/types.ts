import type { VariantOptionGroup, ProductVariant } from "../produk/types";

export interface StorefrontCartItem {
  productId: string;
  variantId?: string;
  variantName?: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
  discountType?: "percentage" | "nominal";
  discountValue?: number;
  maxStock: number;
  imageUrl?: string;
}

export interface StorefrontProduct {
  _id: string;
  name: string;
  category: string;
  categories?: string[];
  price: number;
  stock: number;
  discountType?: "percentage" | "nominal" | string;
  discountValue?: number;
  imageUrl?: string;
  imageId?: string;
  hasVariants?: boolean;
  variantOptions?: VariantOptionGroup[];
  variants?: ProductVariant[];
}

export interface StorefrontStore {
  _id: string;
  name: string;
  address?: string;
  onlineStoreEnabled?: boolean;
}

export interface CheckoutFormValues {
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
}
