import { Modal } from "#/components/Modal";
import { formatIDRInput, parseIDRInput, formatIDR, calculateItemDiscount } from "#/lib/utils";
import {
  PackageIcon,
  CameraIcon,
  CircleNotchIcon,
  XIcon,
} from "@phosphor-icons/react";
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
        <div className="eyebrow-tag mb-1">
          {editId ? "EDIT PRODUK" : "TAMBAH PRODUK BARU"}
        </div>
        <h2 className="text-xl font-black text-[var(--color-text)] tracking-tight">
          {editId ? "Edit Informasi Produk" : "Tambah Produk ke Katalog"}
        </h2>
      </div>

      <form onSubmit={onSave} className="flex flex-col gap-4">
        {/* Foto Produk / Upload Box */}
        <div>
          <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
            Foto Produk
          </label>
          <div className="flex items-center gap-4 p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
              {imageUploading ? (
                <div className="flex flex-col items-center justify-center gap-1 text-[var(--color-brand)]">
                  <CircleNotchIcon size={24} className="animate-spin" />
                  <span className="text-[9px] font-extrabold">Upload...</span>
                </div>
              ) : imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <PackageIcon size={32} weight="duotone" className="text-[var(--color-brand)] opacity-40" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <label
                htmlFor="product-photo-upload"
                className="press-tactile py-2 px-3.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text)] inline-flex items-center gap-1.5 cursor-pointer hover:bg-[var(--color-surface-3)]"
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
              <p className="text-[11px] text-[var(--color-text-3)] mt-1.5 leading-snug">
                Mendukung JPEG, PNG, WebP. Gambar dikompres otomatis hemat memori.
              </p>
            </div>

            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  onChangeForm((prev) => ({ ...prev, imageId: "" }));
                }}
                className="p-1 text-[var(--color-text-3)] hover:text-rose-600 cursor-pointer"
                title="Hapus foto"
              >
                <XIcon size={16} weight="bold" />
              </button>
            )}
          </div>
        </div>

        {/* Nama Produk */}
        <div>
          <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
            Nama Produk / Jasa
          </label>
          <input
            type="text"
            placeholder="Contoh: Kopi Susu Aren 250ml"
            value={form.name}
            onChange={(e) => onChangeForm((p) => ({ ...p, name: e.target.value }))}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        {/* Kategori & Barcode Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
              Kategori
            </label>
            <input
              type="text"
              placeholder="Contoh: Minuman, Makanan, Servis"
              value={form.category}
              onChange={(e) => onChangeForm((p) => ({ ...p, category: e.target.value }))}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
              Barcode / SKU (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: 89912345678"
              value={form.barcode}
              onChange={(e) => onChangeForm((p) => ({ ...p, barcode: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Harga Jual & Stok Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
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
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
              Jumlah Stok Tersedia
            </label>
            <input
              type="number"
              min="0"
              placeholder="Contoh: 50"
              value={form.stock}
              onChange={(e) => onChangeForm((p) => ({ ...p, stock: e.target.value }))}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Diskon Produk Section */}
        <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl p-3.5">
          <label className="block text-xs font-extrabold text-[var(--color-text)] mb-2">
            Diskon Khusus Produk
          </label>

          <div className="flex gap-1.5 mb-2.5">
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
                  className={`press-tactile flex-1 py-1.5 px-1 rounded-full text-xs font-bold cursor-pointer border transition-all ${
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
                  onChange={(e) =>
                    onChangeForm((p) => ({ ...p, discountValue: e.target.value }))
                  }
                  className="w-full pr-10 pl-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs font-extrabold"
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
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs font-extrabold"
                />
              </div>
            </div>
          )}

          {form.discountType !== "none" && preview.hasDiscount && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-[var(--color-brand-light)] border border-[var(--color-brand)] flex justify-between items-center text-xs">
              <span className="text-[var(--color-text-2)] font-semibold">Harga Akhir:</span>
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
            className="press-tactile flex-1 py-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] text-xs font-extrabold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="press-tactile flex-1.5 py-3 rounded-full bg-[var(--color-brand)] text-white text-xs font-extrabold cursor-pointer shadow-md shadow-primary-500/25 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Produk"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
