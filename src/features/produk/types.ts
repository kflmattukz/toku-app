import type { Id } from "../../../convex/_generated/dataModel";

export type VariantOptionGroup = {
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  name: string;
  combination: Record<string, string>;
  price: number;
  costPrice?: number;
  stock: number;
  barcode?: string;
};

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
  hasVariants?: boolean;
  variantOptions?: VariantOptionGroup[];
  variants?: ProductVariant[];
};

export type ProductVariantFormItem = {
  id: string;
  name: string;
  combination: Record<string, string>;
  price: string;
  costPrice: string;
  stock: string;
  barcode: string;
};

export type ProductFormState = {
  name: string;
  category: string;
  price: string;
  costPrice: string;
  stock: string;
  barcode: string;
  imageId: string;
  discountType: "none" | "percentage" | "nominal";
  discountValue: string;
  hasVariants: boolean;
  variantOptions: VariantOptionGroup[];
  variants: ProductVariantFormItem[];
};

export const emptyProductForm: ProductFormState = {
  name: "",
  category: "",
  price: "",
  costPrice: "",
  stock: "",
  barcode: "",
  imageId: "",
  discountType: "none",
  discountValue: "",
  hasVariants: false,
  variantOptions: [],
  variants: [],
};
