import { useState, useEffect } from "react";
import { Modal } from "#/components/Modal";
import { formatIDRInput, parseIDRInput, formatIDR, calculateItemDiscount } from "#/lib/utils";
import {
  PackageIcon,
  CameraIcon,
  CircleNotchIcon,
  XIcon,
  MagnifyingGlassPlusIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { ImagePreviewModal } from "#/components/ui/ImagePreviewModal";
import { Button } from "#/components/ui";
import type { ProductFormState } from "../types";

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
  onSave: (e: React.FormEvent) => void;
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
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setSubmitted(false);
    }
  }, [open, editId]);

  if (!open) return null;

  const priceNum = parseIDRInput(form.price);
  const discountValNum =
    form.discountType === "percentage"
      ? parseInt(form.discountValue, 10) || 0
      : parseIDRInput(form.discountValue);

  const preview = calculateItemDiscount(priceNum, form.discountType, discountValNum);

  const isNameInvalid = submitted && !form.name.trim();
  const isCategoryInvalid = submitted && !form.category.trim();
  const isPriceInvalid = submitted && priceNum <= 0;
  const hasErrors = isNameInvalid || isCategoryInvalid || isPriceInvalid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!form.name.trim() || !form.category.trim() || priceNum <= 0) {
      if (!form.name.trim()) {
        document.getElementById("input-product-name")?.focus();
      } else if (!form.category.trim()) {
        document.getElementById("input-product-category")?.focus();
      } else if (priceNum <= 0) {
        document.getElementById("input-product-price")?.focus();
      }
      return;
    }
    onSave(e);
  };

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

      <form onSubmit={handleSubmit} noValidate className="flex flex-col">
        {/* Contained Form Card with Inset Scroll */}
        <div className="custom-scrollbar max-h-[56vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 shadow-inner sm:max-h-[60vh] sm:p-4">
          <div className="flex flex-col gap-4">
            {/* Error Banner when form submission fails */}
            {submitted && hasErrors && (
              <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-bold text-rose-600 dark:text-rose-400">
                <WarningCircleIcon size={18} weight="fill" className="shrink-0 text-rose-500" />
                <span>Mohon lengkapi bagian bertanda merah sebelum menyimpan produk.</span>
              </div>
            )}
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
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
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
        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-[var(--color-text)]">
            <span>
              Nama Produk / Jasa <span className="text-rose-500">*</span>
            </span>
            {isNameInvalid && (
              <span className="text-[10px] font-extrabold text-rose-500">Wajib diisi</span>
            )}
          </label>
          <input
            id="input-product-name"
            type="text"
            placeholder="Contoh: Kopi Susu Aren 250ml"
            value={form.name}
            onChange={(e) => onChangeForm((p) => ({ ...p, name: e.target.value }))}
            className={`w-full rounded-xl border bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
              isNameInvalid
                ? "border-rose-500 text-[var(--color-text)] focus:border-rose-500 focus:ring-rose-500/20"
                : "border-[var(--color-border)] text-[var(--color-text)] focus:border-primary-500 focus:ring-primary-500/20"
            }`}
          />
          {isNameInvalid && (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-500">
              <WarningCircleIcon size={14} weight="fill" className="shrink-0" />
              Nama produk tidak boleh kosong
            </p>
          )}
        </div>

        {/* Kategori & Barcode Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-[var(--color-text)]">
              <span>
                Kategori <span className="text-rose-500">*</span>
              </span>
              {isCategoryInvalid && (
                <span className="text-[10px] font-extrabold text-rose-500">Wajib diisi</span>
              )}
            </label>
            <input
              id="input-product-category"
              type="text"
              placeholder="Contoh: Minuman, Makanan, Servis"
              value={form.category}
              onChange={(e) => onChangeForm((p) => ({ ...p, category: e.target.value }))}
              className={`w-full rounded-xl border bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
                isCategoryInvalid
                  ? "border-rose-500 text-[var(--color-text)] focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-[var(--color-border)] text-[var(--color-text)] focus:border-primary-500 focus:ring-primary-500/20"
              }`}
            />
            {isCategoryInvalid && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-500">
                <WarningCircleIcon size={14} weight="fill" className="shrink-0" />
                Kategori produk wajib diisi
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
              Barcode / SKU (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: 89912345678"
              value={form.barcode}
              onChange={(e) => onChangeForm((p) => ({ ...p, barcode: e.target.value }))}
              className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
            />
          </div>
        </div>

        {/* Harga Jual, Modal (HPP), dan Stok */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-[var(--color-text)]">
              <span>
                Harga Jual Normal (IDR) <span className="text-rose-500">*</span>
              </span>
              {isPriceInvalid && (
                <span className="text-[10px] font-extrabold text-rose-500">Wajib &gt; 0</span>
              )}
            </label>
            <div className="relative flex items-center">
              <span className={`absolute left-3.5 text-xs font-extrabold ${isPriceInvalid ? "text-rose-500" : "text-[var(--color-brand)]"}`}>
                Rp
              </span>
              <input
                id="input-product-price"
                type="text"
                inputMode="numeric"
                placeholder="15.000"
                value={form.price}
                onChange={(e) =>
                  onChangeForm((p) => ({ ...p, price: formatIDRInput(e.target.value) }))
                }
                className={`w-full rounded-xl border bg-[var(--color-surface)] py-2.5 pr-3.5 pl-10 text-sm font-extrabold transition-colors focus:ring-2 focus:outline-none ${
                  isPriceInvalid
                    ? "border-rose-500 text-[var(--color-text)] focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-[var(--color-border)] text-[var(--color-text)] focus:border-primary-500 focus:ring-primary-500/20"
                }`}
              />
            </div>
            {isPriceInvalid && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-500">
                <WarningCircleIcon size={14} weight="fill" className="shrink-0" />
                Harga jual harus lebih dari Rp 0
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-[var(--color-text)]">
              <span>Harga Modal / Beli (HPP)</span>
              <span className="text-[10px] font-normal text-[var(--color-text-3)]">Opsional</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-extrabold text-[var(--color-text-3)]">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 10.000"
                value={form.costPrice}
                onChange={(e) =>
                  onChangeForm((p) => ({ ...p, costPrice: formatIDRInput(e.target.value) }))
                }
                className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pr-3.5 pl-10 text-sm font-bold text-[var(--color-text)] focus:ring-2 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Estimasi Cuan/Margin per pcs */}
        {(() => {
          const costNum = parseIDRInput(form.costPrice);
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
                <span>{isLoss ? "⚠️ Peringatan Rugi:" : "💡 Estimasi Laba Kotor per pcs:"}</span>
                <span className="price font-black">
                  {formatIDR(profitPerPcs)} ({marginPct}%)
                </span>
              </div>
            );
          }
          return null;
        })()}

        {/* Stok Barang */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
            Jumlah Stok Tersedia
          </label>
          <input
            type="number"
            min="0"
            placeholder="Contoh: 50"
            value={form.stock}
            onChange={(e) => onChangeForm((p) => ({ ...p, stock: e.target.value }))}
            required
            className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-bold text-[var(--color-text)] focus:ring-2 focus:outline-none"
          />
        </div>

        {/* Diskon Produk Section */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
          <label className="mb-2 block text-xs font-extrabold text-[var(--color-text)]">
            Diskon Khusus Produk
          </label>

          <div className="mb-2.5 flex gap-1.5">
            {[
              { key: "none", label: "Tanpa Diskon" },
              { key: "percentage", label: "Persen (%)" },
              { key: "nominal", label: "Nominal (Rp)" },
            ].map((t) => {
              const active = form.discountType === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() =>
                    onChangeForm((p) => ({
                      ...p,
                      discountType: t.key as any,
                      discountValue: t.key === p.discountType ? p.discountValue : "",
                    }))
                  }
                  className={`press-tactile flex-1 min-w-0 cursor-pointer rounded-full border px-1 py-1.5 text-center text-[11px] font-bold transition-all sm:text-xs ${
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

          {form.discountType === "percentage" && (
            <div>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Contoh: 10"
                  value={form.discountValue}
                  onChange={(e) => onChangeForm((p) => ({ ...p, discountValue: e.target.value }))}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-10 pl-3.5 text-xs font-extrabold text-[var(--color-text)]"
                />
                <span className="absolute right-3.5 text-xs font-extrabold text-[var(--color-brand)]">
                  %
                </span>
              </div>
            </div>
          )}

          {form.discountType === "nominal" && (
            <div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-extrabold text-[var(--color-brand)]">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Contoh: 5.000"
                  value={form.discountValue}
                  onChange={(e) =>
                    onChangeForm((p) => ({
                      ...p,
                      discountValue: formatIDRInput(e.target.value),
                    }))
                  }
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pr-3.5 pl-10 text-xs font-extrabold text-[var(--color-text)]"
                />
              </div>
            </div>
          )}

          {form.discountType !== "none" && preview.hasDiscount && (
            <div className="mt-2.5 flex items-center justify-between rounded-xl border border-[var(--color-brand)] bg-[var(--color-brand-light)] p-2.5 text-xs">
              <span className="font-semibold text-[var(--color-text-2)]">Harga Akhir:</span>
              <span className="price font-black text-[var(--color-brand)]">
                {formatIDR(preview.unitPrice)}
              </span>
            </div>
          )}
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
        price={priceNum}
      />
    </Modal>
  );
}
