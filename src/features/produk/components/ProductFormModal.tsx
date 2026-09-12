import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Modal } from "#/components/Modal";
import {
  formatIDRInput,
  parseIDRInput,
  formatIDR,
  calculateItemDiscount,
  generateVariantCombinations,
} from "#/lib/utils";
import {
  PackageIcon,
  CameraIcon,
  CircleNotchIcon,
  XIcon,
  MagnifyingGlassPlusIcon,
  WarningCircleIcon,
  BarcodeIcon,
  PlusIcon,
  TrashIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { ImagePreviewModal } from "#/components/ui/ImagePreviewModal";
import { BarcodeScannerModal } from "#/components/BarcodeScannerModal";
import { triggerScanFeedback } from "#/lib/scan-feedback";
import { Button } from "#/components/ui";
import type { ProductFormState, VariantOptionGroup, ProductVariantFormItem } from "../types";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  editId: any;
  form: ProductFormState;
  onChangeForm: (updater: (prev: ProductFormState) => ProductFormState) => void;
  imagePreview: string;
  imageUploading: boolean;
  onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saving: boolean;
  onSave: (formData?: ProductFormState | React.FormEvent) => void;
}

export function ProductFormModal({
  open,
  onClose,
  editId,
  form,
  onChangeForm,
  imagePreview,
  imageUploading,
  onImageFileChange,
  saving,
  onSave,
}: ProductFormModalProps) {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValueInputs, setNewOptionValueInputs] = useState<Record<number, string>>({});

  const productForm = useForm({
    defaultValues: form,
    onSubmit: async ({ value }) => {
      setSubmitted(true);
      const priceNum = parseIDRInput(value.price);
      if (!value.name.trim()) {
        document.getElementById("input-product-name")?.focus();
        return;
      }
      if (!value.category.trim()) {
        document.getElementById("input-product-category")?.focus();
        return;
      }
      if (!value.hasVariants && priceNum <= 0) {
        document.getElementById("input-product-price")?.focus();
        return;
      }
      if (value.hasVariants) {
        if (!value.variants || value.variants.length === 0) {
          toast.error("Harap tambahkan kombinasi varian");
          return;
        }
        const hasInvalidPrice = value.variants.some((v) => parseIDRInput(v.price) <= 0);
        if (hasInvalidPrice) {
          toast.error("Setiap varian harus memiliki harga lebih dari Rp 0");
          return;
        }
      }
      onSave(value);
    },
  });

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevEditId, setPrevEditId] = useState(editId);

  if (open !== prevOpen || editId !== prevEditId) {
    setPrevOpen(open);
    setPrevEditId(editId);
    if (open) {
      setSubmitted(false);
    }
  }

  useEffect(() => {
    if (open) {
      productForm.reset(form);
    }
  }, [open, editId]);

  const [prevImageId, setPrevImageId] = useState(form.imageId);
  if (form.imageId !== prevImageId) {
    setPrevImageId(form.imageId);
    if (form.imageId !== productForm.getFieldValue("imageId")) {
      productForm.setFieldValue("imageId", form.imageId);
    }
  }

  if (!open) return null;

  return (
    <Modal onClose={onClose} maxWidth={540} showCloseButton={false}>
      {/* Modal Header */}
      <div className="mb-3.5 flex items-start justify-between sm:mb-4">
        <div>
          <div className="eyebrow-tag mb-1">{editId ? "EDIT PRODUK" : "TAMBAH PRODUK BARU"}</div>
          <h2 className="text-xl font-black tracking-tight text-[var(--color-text)]">
            {editId ? "Edit Informasi Produk" : "Tambah Produk ke Katalog"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]"
          aria-label="Tutup"
        >
          <XIcon size={16} weight="bold" />
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSubmitted(true);
          productForm.handleSubmit();
        }}
        noValidate
        className="flex flex-col"
      >
        {/* Contained Form Card with Inset Scroll */}
        <div className="custom-scrollbar max-h-[56vh] overflow-x-hidden overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 shadow-inner sm:max-h-[60vh] sm:p-4">
          <div className="flex flex-col gap-4">
            {/* Error Banner when form submission fails */}
            <productForm.Subscribe
              selector={(state) => ({
                name: state.values.name,
                category: state.values.category,
                price: state.values.price,
              })}
            >
              {({ name, category, price }) => {
                const priceNum = parseIDRInput(price);
                const hasErrors = submitted && (!name.trim() || !category.trim() || priceNum <= 0);

                if (!hasErrors) return null;

                return (
                  <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <WarningCircleIcon size={18} weight="fill" className="shrink-0 text-rose-500" />
                    <span>Mohon lengkapi bagian bertanda merah sebelum menyimpan produk.</span>
                  </div>
                );
              }}
            </productForm.Subscribe>

            {/* Foto Produk / Upload Box */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
                Foto Produk
              </label>
              <div className="flex items-center gap-3.5 rounded-xl border border-border bg-surface p-3 sm:gap-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
                  {imageUploading ? (
                    <div className="flex flex-col items-center justify-center gap-1 text-brand">
                      <CircleNotchIcon size={24} className="animate-spin" />
                      <span className="text-[9px] font-extrabold">Upload...</span>
                    </div>
                  ) : imagePreview ? (
                    <button
                      type="button"
                      onClick={() => setShowImagePreview(true)}
                      className="group relative h-full w-full cursor-pointer"
                      title="Klik untuk melihat ukuran penuh"
                    >
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                        <MagnifyingGlassPlusIcon size={20} className="text-white" weight="bold" />
                      </div>
                    </button>
                  ) : (
                    <PackageIcon size={32} weight="duotone" className="text-brand opacity-40" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="product-photo-upload"
                    className="press-tactile inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-3)]"
                  >
                    <CameraIcon size={16} weight="bold" />
                    <span>{imagePreview ? "Ganti Foto" : "Pilih Foto Produk"}</span>
                  </label>
                  <input
                    id="product-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={onImageFileChange}
                    className="hidden"
                  />
                  <p className="mt-1.5 text-[11px] leading-snug text-[var(--color-text-3)]">
                    Mendukung JPEG, PNG, WebP. Gambar dikompres otomatis hemat memori.
                  </p>
                </div>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      productForm.setFieldValue("imageId", "");
                      onChangeForm((prev) => ({ ...prev, imageId: "" }));
                    }}
                    className="cursor-pointer p-1 text-[var(--color-text-3)] hover:text-rose-600"
                    title="Hapus foto"
                  >
                    <XIcon size={16} weight="bold" />
                  </button>
                )}
              </div>
            </div>

            {/* Nama Produk */}
            <productForm.Field
              name="name"
              validators={{
                onChange: ({ value }) =>
                  !value.trim() ? "Nama produk tidak boleh kosong" : undefined,
              }}
            >
              {(field) => {
                const isInvalid = Boolean(submitted && !field.state.value.trim());
                return (
                  <div>
                    <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-[var(--color-text)]">
                      <span>
                        Nama Produk / Jasa <span className="text-rose-500">*</span>
                      </span>
                      {isInvalid && (
                        <span className="text-[10px] font-extrabold text-rose-500">
                          Wajib diisi
                        </span>
                      )}
                    </label>
                    <input
                      id="input-product-name"
                      type="text"
                      placeholder="Contoh: Kopi Susu Aren 250ml"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        field.handleChange(e.target.value);
                        onChangeForm((p) => ({ ...p, name: e.target.value }));
                      }}
                      className={`w-full rounded-xl border bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
                        isInvalid
                          ? "border-rose-500 text-[var(--color-text)] focus:border-rose-500 focus:ring-rose-500/20"
                          : "focus:border-primary-500 focus:ring-primary-500/20 border-[var(--color-border)] text-[var(--color-text)]"
                      }`}
                    />
                    {isInvalid && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-500">
                        <WarningCircleIcon size={14} weight="fill" className="shrink-0" />
                        Nama produk tidak boleh kosong
                      </p>
                    )}
                  </div>
                );
              }}
            </productForm.Field>

            {/* Kategori & Barcode Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <productForm.Field
                name="category"
                validators={{
                  onChange: ({ value }) =>
                    !value.trim() ? "Kategori produk wajib diisi" : undefined,
                }}
              >
                {(field) => {
                  const isInvalid = Boolean(submitted && !field.state.value.trim());
                  return (
                    <div>
                      <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-[var(--color-text)]">
                        <span>
                          Kategori <span className="text-rose-500">*</span>
                        </span>
                        {isInvalid && (
                          <span className="text-[10px] font-extrabold text-rose-500">
                            Wajib diisi
                          </span>
                        )}
                      </label>
                      <input
                        id="input-product-category"
                        type="text"
                        placeholder="Contoh: Minuman, Makanan, Servis"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          onChangeForm((p) => ({ ...p, category: e.target.value }));
                        }}
                        className={`w-full rounded-xl border bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
                          isInvalid
                            ? "border-rose-500 text-[var(--color-text)] focus:border-rose-500 focus:ring-rose-500/20"
                            : "focus:border-primary-500 focus:ring-primary-500/20 border-[var(--color-border)] text-[var(--color-text)]"
                        }`}
                      />
                      {isInvalid && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-500">
                          <WarningCircleIcon size={14} weight="fill" className="shrink-0" />
                          Kategori produk wajib diisi
                        </p>
                      )}
                    </div>
                  );
                }}
              </productForm.Field>

              <productForm.Field name="barcode">
                {(field) => (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
                      Barcode / SKU (Opsional)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="Contoh: 89912345678"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          onChangeForm((p) => ({ ...p, barcode: e.target.value }));
                        }}
                        className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pr-24 pl-3.5 text-sm font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBarcodeScanner(true)}
                        className="press-tactile absolute right-1.5 flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-brand)] hover:bg-[var(--color-surface-3)]"
                        title="Pindai barcode dengan kamera"
                      >
                        <BarcodeIcon size={16} weight="bold" />
                        <span>Scan</span>
                      </button>
                    </div>
                  </div>
                )}
              </productForm.Field>
            </div>

            {/* Toggle Produk Memiliki Varian */}
            <productForm.Field name="hasVariants">
              {(field) => (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                        <SlidersHorizontalIcon size={18} weight="bold" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--color-text)]">
                          Produk Memiliki Varian
                        </div>
                        <div className="text-[11px] text-[var(--color-text-3)]">
                          Aktifkan untuk ukuran (M/L), suhu (Hot/Cold), rasa, atau warna
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={field.state.value}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          field.handleChange(checked);
                          onChangeForm((p) => ({ ...p, hasVariants: checked }));
                        }}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-[var(--color-border)] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--color-brand)] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                  </div>

                  {/* Varian Builder Container */}
                  {field.state.value && (
                    <div className="mt-4 flex flex-col gap-4 border-t border-[var(--color-border)] pt-4">
                      {/* 1. Opsi / Atribut Varian */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-xs font-bold text-[var(--color-text)]">
                            Tipe Pilihan / Atribut (maks. 3)
                          </label>
                          <span className="text-[10px] text-[var(--color-text-3)]">
                            cth: Ukuran, Suhu, Rasa
                          </span>
                        </div>

                        {/* List existing options */}
                        <div className="flex flex-col gap-3">
                          {productForm.getFieldValue("variantOptions").map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3"
                            >
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-black text-[var(--color-brand)]">
                                  {opt.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentOpts = [
                                      ...productForm.getFieldValue("variantOptions"),
                                    ];
                                    currentOpts.splice(optIdx, 1);
                                    productForm.setFieldValue("variantOptions", currentOpts);

                                    // Regenerate combinations
                                    const combos = generateVariantCombinations(currentOpts);
                                    const newVariants: ProductVariantFormItem[] = combos.map(
                                      (c, i) => ({
                                        id: `v_${Date.now()}_${i}`,
                                        name: c.name,
                                        combination: c.combination,
                                        price: form.price || "0",
                                        costPrice: form.costPrice || "",
                                        stock: "10",
                                        barcode: "",
                                      }),
                                    );
                                    productForm.setFieldValue("variants", newVariants);
                                    onChangeForm((p) => ({
                                      ...p,
                                      variantOptions: currentOpts,
                                      variants: newVariants,
                                    }));
                                  }}
                                  className="text-[var(--color-text-3)] hover:text-rose-500"
                                >
                                  <TrashIcon size={14} weight="bold" />
                                </button>
                              </div>

                              {/* Value Pills */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {opt.values.map((val, valIdx) => (
                                  <span
                                    key={valIdx}
                                    className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs font-bold text-[var(--color-text)]"
                                  >
                                    {val}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentOpts = [
                                          ...productForm.getFieldValue("variantOptions"),
                                        ];
                                        currentOpts[optIdx].values.splice(valIdx, 1);
                                        productForm.setFieldValue("variantOptions", currentOpts);

                                        const combos = generateVariantCombinations(currentOpts);
                                        const newVariants: ProductVariantFormItem[] = combos.map(
                                          (c, i) => ({
                                            id: `v_${Date.now()}_${i}`,
                                            name: c.name,
                                            combination: c.combination,
                                            price: form.price || "0",
                                            costPrice: form.costPrice || "",
                                            stock: "10",
                                            barcode: "",
                                          }),
                                        );
                                        productForm.setFieldValue("variants", newVariants);
                                        onChangeForm((p) => ({
                                          ...p,
                                          variantOptions: currentOpts,
                                          variants: newVariants,
                                        }));
                                      }}
                                      className="text-[var(--color-text-3)] hover:text-rose-500"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}

                                {/* Add value pill input */}
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    placeholder="+ Nilai (lalu Enter)"
                                    value={newOptionValueInputs[optIdx] || ""}
                                    onChange={(e) =>
                                      setNewOptionValueInputs((prev) => ({
                                        ...prev,
                                        [optIdx]: e.target.value,
                                      }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        const val = (newOptionValueInputs[optIdx] || "").trim();
                                        if (val) {
                                          const currentOpts = [
                                            ...productForm.getFieldValue("variantOptions"),
                                          ];
                                          if (!currentOpts[optIdx].values.includes(val)) {
                                            currentOpts[optIdx].values.push(val);
                                            productForm.setFieldValue(
                                              "variantOptions",
                                              currentOpts,
                                            );
                                            setNewOptionValueInputs((prev) => ({
                                              ...prev,
                                              [optIdx]: "",
                                            }));

                                            const combos = generateVariantCombinations(currentOpts);
                                            const existing =
                                              productForm.getFieldValue("variants") || [];
                                            const newVariants: ProductVariantFormItem[] =
                                              combos.map((c, i) => {
                                                const match = existing.find(
                                                  (ex) => ex.name === c.name,
                                                );
                                                return (
                                                  match ?? {
                                                    id: `v_${Date.now()}_${i}`,
                                                    name: c.name,
                                                    combination: c.combination,
                                                    price: form.price || "0",
                                                    costPrice: form.costPrice || "",
                                                    stock: "10",
                                                    barcode: "",
                                                  }
                                                );
                                              });
                                            productForm.setFieldValue("variants", newVariants);
                                            onChangeForm((p) => ({
                                              ...p,
                                              variantOptions: currentOpts,
                                              variants: newVariants,
                                            }));
                                          }
                                        }
                                      }
                                    }}
                                    className="h-7 w-28 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs text-[var(--color-text)] focus:border-[var(--color-brand)] focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Form add new option group */}
                          {productForm.getFieldValue("variantOptions").length < 3 && (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="Nama opsi baru (cth: Ukuran)"
                                value={newOptionName}
                                onChange={(e) => setNewOptionName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const trimmed = newOptionName.trim();
                                    if (trimmed) {
                                      const current = [
                                        ...productForm.getFieldValue("variantOptions"),
                                        { name: trimmed, values: [] },
                                      ];
                                      productForm.setFieldValue("variantOptions", current);
                                      onChangeForm((p) => ({ ...p, variantOptions: current }));
                                      setNewOptionName("");
                                    }
                                  }
                                }}
                                className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-medium text-[var(--color-text)] focus:border-[var(--color-brand)] focus:outline-none"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                leftIcon={<PlusIcon size={14} weight="bold" />}
                                onClick={() => {
                                  const trimmed = newOptionName.trim();
                                  if (trimmed) {
                                    const current = [
                                      ...productForm.getFieldValue("variantOptions"),
                                      { name: trimmed, values: [] },
                                    ];
                                    productForm.setFieldValue("variantOptions", current);
                                    onChangeForm((p) => ({ ...p, variantOptions: current }));
                                    setNewOptionName("");
                                  }
                                }}
                              >
                                Tambah Opsi
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. SKU Combination Matrix Table */}
                      {productForm.getFieldValue("variants").length > 0 && (
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <label className="text-xs font-black text-[var(--color-text)]">
                              Daftar Kombinasi Varian (
                              {productForm.getFieldValue("variants").length})
                            </label>
                            {/* Bulk fill action */}
                            <button
                              type="button"
                              onClick={() => {
                                const firstPrice =
                                  productForm.getFieldValue("variants")[0]?.price || form.price;
                                const firstCost =
                                  productForm.getFieldValue("variants")[0]?.costPrice ||
                                  form.costPrice;
                                const firstStock =
                                  productForm.getFieldValue("variants")[0]?.stock || "10";

                                const updated = productForm
                                  .getFieldValue("variants")
                                  .map((v) => ({
                                    ...v,
                                    price: firstPrice,
                                    costPrice: firstCost,
                                    stock: firstStock,
                                  }));
                                productForm.setFieldValue("variants", updated);
                                onChangeForm((p) => ({ ...p, variants: updated }));
                                toast.success("Harga & stok disamakan ke semua varian");
                              }}
                              className="text-[11px] font-bold text-[var(--color-brand)] hover:underline"
                            >
                              Samakan Harga & Stok
                            </button>
                          </div>

                          <div className="flex flex-col gap-2">
                            {productForm.getFieldValue("variants").map((vItem, vIdx) => (
                              <div
                                key={vItem.id || vIdx}
                                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5"
                              >
                                <div className="mb-1.5 flex items-center justify-between">
                                  <span className="text-xs font-bold text-[var(--color-text)]">
                                    {vItem.name}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="mb-1 block text-[10px] font-bold text-[var(--color-text-3)]">
                                      Harga Jual *
                                    </label>
                                    <div className="relative flex items-center">
                                      <span className="absolute left-2 text-[10px] font-bold text-[var(--color-brand)]">
                                        Rp
                                      </span>
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        value={vItem.price}
                                        onChange={(e) => {
                                          const formatted = formatIDRInput(e.target.value);
                                          const list = [
                                            ...productForm.getFieldValue("variants"),
                                          ];
                                          list[vIdx] = { ...list[vIdx], price: formatted };
                                          productForm.setFieldValue("variants", list);
                                          onChangeForm((p) => ({ ...p, variants: list }));
                                        }}
                                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] py-1.5 pr-2 pl-6 text-xs font-extrabold text-[var(--color-text)] focus:border-[var(--color-brand)] focus:outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="mb-1 block text-[10px] font-bold text-[var(--color-text-3)]">
                                      Modal (HPP)
                                    </label>
                                    <div className="relative flex items-center">
                                      <span className="absolute left-2 text-[10px] font-bold text-[var(--color-text-3)]">
                                        Rp
                                      </span>
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        value={vItem.costPrice}
                                        placeholder="Opsional"
                                        onChange={(e) => {
                                          const formatted = formatIDRInput(e.target.value);
                                          const list = [
                                            ...productForm.getFieldValue("variants"),
                                          ];
                                          list[vIdx] = { ...list[vIdx], costPrice: formatted };
                                          productForm.setFieldValue("variants", list);
                                          onChangeForm((p) => ({ ...p, variants: list }));
                                        }}
                                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] py-1.5 pr-2 pl-6 text-xs font-bold text-[var(--color-text)] focus:border-[var(--color-brand)] focus:outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="mb-1 block text-[10px] font-bold text-[var(--color-text-3)]">
                                      Stok *
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      value={vItem.stock}
                                      onChange={(e) => {
                                        const list = [...productForm.getFieldValue("variants")];
                                        list[vIdx] = { ...list[vIdx], stock: e.target.value };
                                        productForm.setFieldValue("variants", list);
                                        onChangeForm((p) => ({ ...p, variants: list }));
                                      }}
                                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-text)] focus:border-[var(--color-brand)] focus:outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </productForm.Field>

            {/* Harga Jual, Modal (HPP), dan Stok (Hanya Tampil Jika Produk TIDAK Memiliki Varian) */}
            <productForm.Subscribe selector={(state) => state.values.hasVariants}>
              {(hasVariants) => {
                if (hasVariants) return null;
                return (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <productForm.Field
                        name="price"
                        validators={{
                          onChange: ({ value }) =>
                            parseIDRInput(value) <= 0
                              ? "Harga jual harus lebih dari Rp 0"
                              : undefined,
                        }}
                      >
                        {(field) => {
                          const priceNum = parseIDRInput(field.state.value);
                          const isInvalid = Boolean(submitted && priceNum <= 0);
                          return (
                            <div>
                              <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-[var(--color-text)]">
                                <span>
                                  Harga Jual Normal (IDR) <span className="text-rose-500">*</span>
                                </span>
                                {isInvalid && (
                                  <span className="text-[10px] font-extrabold text-rose-500">
                                    Wajib &gt; 0
                                  </span>
                                )}
                              </label>
                              <div className="relative flex items-center">
                                <span
                                  className={`absolute left-3.5 text-xs font-extrabold ${isInvalid ? "text-rose-500" : "text-[var(--color-brand)]"}`}
                                >
                                  Rp
                                </span>
                                <input
                                  id="input-product-price"
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="15.000"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) => {
                                    const formatted = formatIDRInput(e.target.value);
                                    field.handleChange(formatted);
                                    onChangeForm((p) => ({ ...p, price: formatted }));
                                  }}
                                  className={`w-full rounded-xl border bg-[var(--color-surface)] py-2.5 pr-3.5 pl-10 text-sm font-extrabold transition-colors focus:ring-2 focus:outline-none ${
                                    isInvalid
                                      ? "border-rose-500 text-[var(--color-text)] focus:border-rose-500 focus:ring-rose-500/20"
                                      : "focus:border-primary-500 focus:ring-primary-500/20 border-[var(--color-border)] text-[var(--color-text)]"
                                  }`}
                                />
                              </div>
                              {isInvalid && (
                                <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-500">
                                  <WarningCircleIcon
                                    size={14}
                                    weight="fill"
                                    className="shrink-0"
                                  />
                                  Harga jual harus lebih dari Rp 0
                                </p>
                              )}
                            </div>
                          );
                        }}
                      </productForm.Field>

                      <productForm.Field name="costPrice">
                        {(field) => (
                          <div>
                            <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-[var(--color-text)]">
                              <span>Harga Modal / Beli (HPP)</span>
                              <span className="text-[10px] font-normal text-[var(--color-text-3)]">
                                Opsional
                              </span>
                            </label>
                            <div className="relative flex items-center">
                              <span className="absolute left-3.5 text-xs font-extrabold text-[var(--color-text-3)]">
                                Rp
                              </span>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Contoh: 10.000"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => {
                                  const formatted = formatIDRInput(e.target.value);
                                  field.handleChange(formatted);
                                  onChangeForm((p) => ({ ...p, costPrice: formatted }));
                                }}
                                className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pr-3.5 pl-10 text-sm font-bold text-[var(--color-text)] focus:ring-2 focus:outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </productForm.Field>
                    </div>

                    {/* Live Estimasi Cuan/Margin per pcs */}
                    <productForm.Subscribe
                      selector={(state) => ({
                        price: state.values.price,
                        costPrice: state.values.costPrice,
                      })}
                    >
                      {({ price, costPrice }) => {
                        const priceNum = parseIDRInput(price);
                        const costNum = parseIDRInput(costPrice);
                        if (priceNum > 0 && costNum > 0) {
                          const profitPerPcs = priceNum - costNum;
                          const marginPct = ((profitPerPcs / priceNum) * 100).toFixed(1);
                          const isLoss = profitPerPcs < 0;
                          return (
                            <div
                              className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold ${
                                isLoss
                                  ? "border-rose-500/30 bg-rose-500/10 text-rose-600"
                                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                              }`}
                            >
                              <span>
                                {isLoss ? "⚠️ Peringatan Rugi:" : "💡 Estimasi Laba Kotor per pcs:"}
                              </span>
                              <span className="price font-black">
                                {formatIDR(profitPerPcs)} ({marginPct}%)
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    </productForm.Subscribe>

                    {/* Stok Barang */}
                    <productForm.Field name="stock">
                      {(field) => (
                        <div>
                          <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
                            Jumlah Stok Tersedia
                          </label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Contoh: 50"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              field.handleChange(e.target.value);
                              onChangeForm((p) => ({ ...p, stock: e.target.value }));
                            }}
                            required
                            className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-bold text-[var(--color-text)] focus:ring-2 focus:outline-none"
                          />
                        </div>
                      )}
                    </productForm.Field>
                  </>
                );
              }}
            </productForm.Subscribe>

            {/* Diskon Produk Section */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
              <label className="mb-2 block text-xs font-extrabold text-[var(--color-text)]">
                Diskon Khusus Produk
              </label>

              <productForm.Field name="discountType">
                {(typeField) => (
                  <div className="mb-2.5 flex gap-1.5">
                    {[
                      { key: "none", label: "Tanpa Diskon" },
                      { key: "percentage", label: "Persen (%)" },
                      { key: "nominal", label: "Nominal (Rp)" },
                    ].map((t) => {
                      const active = typeField.state.value === t.key;
                      return (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => {
                            typeField.handleChange(t.key as any);
                            if (t.key !== typeField.state.value) {
                              productForm.setFieldValue("discountValue", "");
                            }
                            onChangeForm((p) => ({
                              ...p,
                              discountType: t.key as any,
                              discountValue: t.key === p.discountType ? p.discountValue : "",
                            }));
                          }}
                          className={`press-tactile min-w-0 flex-1 cursor-pointer rounded-full border px-1 py-1.5 text-center text-[11px] font-bold transition-all sm:text-xs ${
                            active
                              ? "border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]"
                              : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)]"
                          }`}
                        >
                          <span className="truncate">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </productForm.Field>

              <productForm.Subscribe
                selector={(state) => ({
                  discountType: state.values.discountType,
                  discountValue: state.values.discountValue,
                  price: state.values.price,
                })}
              >
                {({ discountType, discountValue, price }) => {
                  const priceNum = parseIDRInput(price);
                  const discountValNum =
                    discountType === "percentage"
                      ? parseInt(discountValue, 10) || 0
                      : parseIDRInput(discountValue);
                  const preview = calculateItemDiscount(priceNum, discountType, discountValNum);

                  return (
                    <>
                      {discountType === "percentage" && (
                        <productForm.Field name="discountValue">
                          {(valField) => (
                            <div>
                              <div className="relative flex items-center">
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  placeholder="Contoh: 10"
                                  value={valField.state.value}
                                  onBlur={valField.handleBlur}
                                  onChange={(e) => {
                                    valField.handleChange(e.target.value);
                                    onChangeForm((p) => ({ ...p, discountValue: e.target.value }));
                                  }}
                                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-10 pl-3.5 text-xs font-extrabold text-[var(--color-text)]"
                                />
                                <span className="absolute right-3.5 text-xs font-extrabold text-[var(--color-brand)]">
                                  %
                                </span>
                              </div>
                            </div>
                          )}
                        </productForm.Field>
                      )}

                      {discountType === "nominal" && (
                        <productForm.Field name="discountValue">
                          {(valField) => (
                            <div>
                              <div className="relative flex items-center">
                                <span className="absolute left-3.5 text-xs font-extrabold text-[var(--color-brand)]">
                                  Rp
                                </span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  placeholder="Contoh: 5.000"
                                  value={valField.state.value}
                                  onBlur={valField.handleBlur}
                                  onChange={(e) => {
                                    const formatted = formatIDRInput(e.target.value);
                                    valField.handleChange(formatted);
                                    onChangeForm((p) => ({ ...p, discountValue: formatted }));
                                  }}
                                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-3.5 pl-10 text-xs font-extrabold text-[var(--color-text)]"
                                />
                              </div>
                            </div>
                          )}
                        </productForm.Field>
                      )}

                      {discountType !== "none" && preview.hasDiscount && (
                        <div className="mt-2.5 flex items-center justify-between rounded-xl border border-[var(--color-brand)] bg-[var(--color-brand-light)] p-2.5 text-xs">
                          <span className="font-semibold text-[var(--color-text-2)]">
                            Harga Akhir:
                          </span>
                          <span className="price font-black text-[var(--color-brand)]">
                            {formatIDR(preview.unitPrice)}
                          </span>
                        </div>
                      )}
                    </>
                  );
                }}
              </productForm.Subscribe>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={saving}
            loadingText="Menyimpan..."
          >
            {editId ? "Simpan Perubahan" : "Tambah Produk"}
          </Button>
        </div>
      </form>

      {/* Image Preview Lightbox */}
      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        imageUrl={imagePreview}
        title={form.name || "Preview Foto Produk"}
        category={form.category}
        price={parseIDRInput(form.price)}
      />

      {/* Barcode Camera Scanner */}
      <BarcodeScannerModal
        open={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        continuous={false}
        title="Pindai Barcode Produk"
        subtitle="Arahkan kamera ke barcode untuk mengisi otomatis"
        onScanSuccess={(code) => {
          productForm.setFieldValue("barcode", code);
          onChangeForm((p) => ({ ...p, barcode: code }));
          triggerScanFeedback(true);
          toast.success(`Barcode ${code} berhasil dipindai`);
          setShowBarcodeScanner(false);
        }}
      />
    </Modal>
  );
}
