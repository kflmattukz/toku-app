import type { Id } from "../../../convex/_generated/dataModel";

export type CartItem = {
  productId: string;
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

export type Product = {
  _id: Id<"products">;
  _creationTime: number;
  storeId: Id<"stores">;
  name: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  barcode?: string;
  imageId?: string;
  imageUrl?: string | null;
  discountType?: "percentage" | "nominal";
  discountValue?: number;
};
