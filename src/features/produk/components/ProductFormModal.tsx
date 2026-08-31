import { useState } from "react";
import { Modal } from "#/components/Modal";
import { formatIDRInput, parseIDRInput, formatIDR, calculateItemDiscount } from "#/lib/utils";
import {
  PackageIcon,
  CameraIcon,
  CircleNotchIcon,
  XIcon,
  MagnifyingGlassPlusIcon,
} from "@phosphor-icons/react";
import { ImagePreviewModal } from "#/components/ui/ImagePreviewModal";
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

  if (!open) return null;

  const priceNum = parseIDRInput(form.price);
  const discountValNum =
    form.discountType === "percentage"
      ? parseInt(form.discountValue, 10) || 0
      : parseIDRInput(form.discountValue);

  const preview = calculateItemDiscount(priceNum, form.discountType, discountValNum);

  return (
    <Modal onClose={onClose} maxWidth={520}>
      <div className="mb-4">
        <div className="eyebrow-tag mb-1">{editId ? "EDIT PRODUK" : "TAMBAH PRODUK BARU"}</div>
        <h2 className="text-xl font-black tracking-tight text-[var(--color-text)]">
          {editId ? "Edit Informasi Produk" : "Tambah Produk ke Katalog"}
        </h2>
      </div>

      <form onSubmit={onSave} className="flex flex-col gap-4">
        {/* Foto Produk / Upload Box */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
            Foto Produk
          </label>
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface-2 p-3">
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
          <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
            Nama Produk / Jasa
          </label>
          <input
            type="text"
            placeholder="Contoh: Kopi Susu Aren 250ml"
            value={form.name}
            onChange={(e) => onChangeForm((p) => ({ ...p, name: e.target.value }))}
            required
            className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
          />
        </div>

        {/* Kategori & Barcode Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
              Kategori
            </label>
            <input
              type="text"
              placeholder="Contoh: Minuman, Makanan, Servis"
              value={form.category}
              onChange={(e) => onChangeForm((p) => ({ ...p, category: e.target.value }))}
              required
              className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
            />
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

        {/* Harga Jual & Stok Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
              Harga Jual Normal (IDR)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-extrabold text-[var(--color-brand)]">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="15.000"
                value={form.price}
                onChange={(e) =>
                  onChangeForm((p) => ({ ...p, price: formatIDRInput(e.target.value) }))
                }
                required
                className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pr-3.5 pl-10 text-sm font-extrabold text-[var(--color-text)] focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

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
        </div>

        {/* Diskon Produk Section */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3.5">
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
                  className={`press-tactile flex-1 cursor-pointer rounded-full border px-1 py-1.5 text-xs font-bold transition-all ${
                    active
                      ? "border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)]"
                  }`}
                >
                  {t.label}
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

        {/* Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="press-tactile flex-1 cursor-pointer rounded-full border border-border bg-surface-2 py-3 text-xs font-extrabold text-text transition-all hover:bg-surface-3"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="press-tactile flex-1.5 cursor-pointer rounded-full bg-brand py-3 text-xs font-extrabold text-white shadow-md shadow-brand/25 transition-all hover:bg-brand-dark disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Produk"}
          </button>
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
