import type { Id } from "../../../convex/_generated/dataModel";

export type Product = {
  _id: Id<"products">;
  _creationTime: number;
  storeId: Id<"stores">;
  name: string;
  category: string;
  price: number;
  stock: number;
  barcode?: string;
  imageId?: string;
  imageUrl?: string;
  discountType?: "percentage" | "nominal";
  discountValue?: number;
};

export type ProductFormState = {
  name: string;
  category: string;
  price: string;
  stock: string;
  barcode: string;
  imageId: string;
  discountType: "none" | "percentage" | "nominal";
  discountValue: string;
};

export const emptyProductForm: ProductFormState = {
  name: "",
  category: "",
  price: "",
  stock: "",
  barcode: "",
  imageId: "",
  discountType: "none",
  discountValue: "",
};
