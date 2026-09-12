import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  formatIDRInput,
  parseIDRInput,
  compressImageToBlob,
  generateVariantCombinations,
} from "#/lib/utils";
import { emptyProductForm, type Product, type ProductFormState } from "../types";
import type { Id } from "../../../../convex/_generated/dataModel";

interface UseProductManagerProps {
  storeId?: Id<"stores">;
}

export function useProductManager({ storeId }: UseProductManagerProps) {
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<Id<"products"> | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUploading, setImageUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const openAdd = (initialBarcode?: string) => {
    setEditId(null);
    setForm({
      ...emptyProductForm,
      barcode: initialBarcode ?? "",
    });
    setImagePreview("");
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p._id);
    const hasVariants = Boolean(p.hasVariants);
    let mappedVariants = (p.variants ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      combination: v.combination,
      price: formatIDRInput(v.price),
      costPrice: v.costPrice !== undefined ? formatIDRInput(v.costPrice) : "",
      stock: String(v.stock ?? 0),
      barcode: v.barcode ?? "",
    }));

    // If product has variants enabled and has variant options, but variants array was empty
    if (
      hasVariants &&
      mappedVariants.length === 0 &&
      p.variantOptions &&
      p.variantOptions.length > 0
    ) {
      const combos = generateVariantCombinations(p.variantOptions);
      mappedVariants = combos.map((c, i) => ({
        id: `v_${Date.now()}_${i}`,
        name: c.name,
        combination: c.combination,
        price: formatIDRInput(p.price),
        costPrice: p.costPrice !== undefined ? formatIDRInput(p.costPrice) : "",
        stock: String(p.stock ?? 0),
        barcode: "",
      }));
    }

    // Determine accurate total stock
    let totalStockNum = p.stock ?? 0;
    if (hasVariants && mappedVariants.length > 0) {
      const variantSum = mappedVariants.reduce(
        (sum, v) => sum + (parseInt(v.stock, 10) || 0),
        0,
      );
      // If child variants were never initialized with stock (all 0) but parent product has stock > 0:
      if (variantSum === 0 && totalStockNum > 0 && mappedVariants.length === 1) {
        mappedVariants[0].stock = String(totalStockNum);
      }
      totalStockNum = mappedVariants.reduce(
        (sum, v) => sum + (parseInt(v.stock, 10) || 0),
        0,
      );
    }

    const categories =
      p.categories && p.categories.length > 0
        ? p.categories
        : p.category
          ? [p.category]
          : [];

    setForm({
      name: p.name,
      category: categories[0] ?? "",
      categories,
      price: formatIDRInput(p.price),
      costPrice: p.costPrice !== undefined ? formatIDRInput(p.costPrice) : "",
      stock: String(totalStockNum),
      barcode: p.barcode ?? "",
      imageId: p.imageId ?? "",
      discountType: p.discountType ?? "none",
      discountValue:
        p.discountType === "percentage"
          ? String(p.discountValue ?? "")
          : p.discountType === "nominal"
            ? formatIDRInput(p.discountValue ?? "")
            : "",
      hasVariants,
      variantOptions: p.variantOptions ?? [],
      variants: mappedVariants,
    });
    setImagePreview(p.imageUrl ?? p.imageId ?? "");
    setShowModal(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const blob = await compressImageToBlob(file);
      const localPreview = URL.createObjectURL(blob);
      setImagePreview(localPreview);

      const postUrl = await generateUploadUrl();
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();

      setForm((prev) => ({ ...prev, imageId: storageId }));
      toast.success("Foto produk berhasil diunggah!");
    } catch {
      toast.error("Gagal mengunggah foto. Silakan coba lagi.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (overrideForm?: ProductFormState | React.FormEvent) => {
    if (overrideForm && "preventDefault" in overrideForm) {
      overrideForm.preventDefault();
    }
    if (!storeId) return;
    if (imageUploading) {
      toast.error("Mohon tunggu proses upload foto selesai");
      return;
    }
    const currentData =
      overrideForm && "name" in overrideForm ? (overrideForm as ProductFormState) : form;
    const priceNum = parseIDRInput(currentData.price);
    const costPriceNum = currentData.costPrice.trim()
      ? parseIDRInput(currentData.costPrice)
      : undefined;
    const stockNum = parseInt(currentData.stock, 10) || 0;

    const cleanedCategories = Array.from(
      new Set(
        (currentData.categories || [currentData.category || ""])
          .map((c) => c.trim())
          .filter(Boolean),
      ),
    );

    if (!currentData.name.trim() || cleanedCategories.length === 0) {
      toast.error("Mohon lengkapi nama dan minimal 1 kategori produk");
      return;
    }

    if (!currentData.hasVariants && priceNum <= 0) {
      toast.error("Mohon masukkan harga produk yang valid");
      return;
    }

    // Process variants if enabled
    let mappedVariants = undefined;
    let finalBasePrice = priceNum;
    let finalTotalStock = stockNum;

    if (currentData.hasVariants) {
      if (!currentData.variants || currentData.variants.length === 0) {
        toast.error("Mohon tambahkan minimal 1 kombinasi varian");
        return;
      }
      mappedVariants = currentData.variants.map((v) => {
        const vPrice = parseIDRInput(v.price);
        const vCost = v.costPrice.trim() ? parseIDRInput(v.costPrice) : undefined;
        const vStock = parseInt(v.stock, 10) || 0;
        return {
          id: v.id,
          name: v.name,
          combination: v.combination,
          price: vPrice,
          costPrice: vCost,
          stock: vStock,
          barcode: v.barcode.trim() || undefined,
        };
      });

      // Validate variant prices
      const invalidVariant = mappedVariants.find((v) => v.price <= 0);
      if (invalidVariant) {
        toast.error(`Harga untuk varian "${invalidVariant.name}" harus lebih dari 0`);
        return;
      }

      finalBasePrice = Math.min(...mappedVariants.map((v) => v.price));
      finalTotalStock = mappedVariants.reduce((sum, v) => sum + v.stock, 0);
    }

    let discountTypeVal: "percentage" | "nominal" | undefined = undefined;
    let discountNum: number | undefined = undefined;

    if (currentData.discountType === "percentage") {
      const pct = Math.min(100, Math.max(0, parseInt(currentData.discountValue, 10) || 0));
      if (pct > 0) {
        discountTypeVal = "percentage";
        discountNum = pct;
      }
    } else if (currentData.discountType === "nominal") {
      const nom = parseIDRInput(currentData.discountValue);
      if (nom > 0) {
        discountTypeVal = "nominal";
        discountNum = Math.min(finalBasePrice, nom);
      }
    }

    setSaving(true);
    try {
      if (editId) {
        await updateProduct({
          id: editId,
          name: currentData.name.trim(),
          category: cleanedCategories[0],
          categories: cleanedCategories,
          price: finalBasePrice,
          costPrice: costPriceNum,
          stock: finalTotalStock,
          barcode: currentData.barcode.trim() || undefined,
          imageId: currentData.imageId.trim() || undefined,
          discountType: discountTypeVal,
          discountValue: discountNum,
          hasVariants: currentData.hasVariants,
          variantOptions: currentData.hasVariants ? currentData.variantOptions : undefined,
          variants: currentData.hasVariants ? mappedVariants : undefined,
        });
        toast.success(`Produk "${currentData.name}" berhasil diperbarui`);
      } else {
        await createProduct({
          storeId,
          name: currentData.name.trim(),
          category: cleanedCategories[0],
          categories: cleanedCategories,
          price: finalBasePrice,
          costPrice: costPriceNum,
          stock: finalTotalStock,
          barcode: currentData.barcode.trim() || undefined,
          imageId: currentData.imageId.trim() || undefined,
          discountType: discountTypeVal,
          discountValue: discountNum,
          hasVariants: currentData.hasVariants,
          variantOptions: currentData.hasVariants ? currentData.variantOptions : undefined,
          variants: currentData.hasVariants ? mappedVariants : undefined,
        });
        toast.success(`Produk "${currentData.name}" berhasil ditambahkan`);
      }
      setShowModal(false);
    } catch {
      toast.error("Gagal menyimpan produk. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeProduct({ id: deleteTarget._id });
      toast.success(`Produk "${deleteTarget.name}" berhasil dihapus`);
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus produk. Silakan coba lagi.");
    } finally {
      setDeleting(false);
    }
  };

  return {
    showModal,
    setShowModal,
    editId,
    form,
    setForm,
    imagePreview,
    imageUploading,
    saving,
    deleteTarget,
    setDeleteTarget,
    deleting,
    search,
    setSearch,
    pageSize,
    setPageSize,
    page,
    setPage,
    openAdd,
    openEdit,
    handleImageFileChange,
    handleSave,
    handleConfirmDelete,
  };
}
