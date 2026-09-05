import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatIDRInput, parseIDRInput, compressImageToBlob } from "#/lib/utils";
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
    setForm({
      name: p.name,
      category: p.category,
      price: formatIDRInput(p.price),
      costPrice: p.costPrice !== undefined ? formatIDRInput(p.costPrice) : "",
      stock: String(p.stock),
      barcode: p.barcode ?? "",
      imageId: p.imageId ?? "",
      discountType: p.discountType ?? "none",
      discountValue:
        p.discountType === "percentage"
          ? String(p.discountValue ?? "")
          : p.discountType === "nominal"
            ? formatIDRInput(p.discountValue ?? "")
            : "",
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    if (imageUploading) {
      toast.error("Mohon tunggu proses upload foto selesai");
      return;
    }
    const priceNum = parseIDRInput(form.price);
    const costPriceNum = form.costPrice.trim() ? parseIDRInput(form.costPrice) : undefined;
    const stockNum = parseInt(form.stock, 10) || 0;
    if (!form.name.trim() || !form.category.trim() || priceNum <= 0) {
      toast.error("Mohon lengkapi nama, kategori, dan harga yang valid");
      return;
    }

    let discountTypeVal: "percentage" | "nominal" | undefined = undefined;
    let discountNum: number | undefined = undefined;

    if (form.discountType === "percentage") {
      const pct = Math.min(100, Math.max(0, parseInt(form.discountValue, 10) || 0));
      if (pct > 0) {
        discountTypeVal = "percentage";
        discountNum = pct;
      }
    } else if (form.discountType === "nominal") {
      const nom = parseIDRInput(form.discountValue);
      if (nom > 0) {
        discountTypeVal = "nominal";
        discountNum = Math.min(priceNum, nom);
      }
    }

    setSaving(true);
    try {
      if (editId) {
        await updateProduct({
          id: editId,
          name: form.name.trim(),
          category: form.category.trim(),
          price: priceNum,
          costPrice: costPriceNum,
          stock: stockNum,
          barcode: form.barcode.trim() || undefined,
          imageId: form.imageId.trim() || undefined,
          discountType: discountTypeVal,
          discountValue: discountNum,
        });
        toast.success(`Produk "${form.name}" berhasil diperbarui`);
      } else {
        await createProduct({
          storeId,
          name: form.name.trim(),
          category: form.category.trim(),
          price: priceNum,
          costPrice: costPriceNum,
          stock: stockNum,
          barcode: form.barcode.trim() || undefined,
          imageId: form.imageId.trim() || undefined,
          discountType: discountTypeVal,
          discountValue: discountNum,
        });
        toast.success(`Produk "${form.name}" berhasil ditambahkan`);
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
