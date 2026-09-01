import { useState } from "react";
import {
  PackageIcon,
  ImageIcon,
  PencilSimpleIcon,
  TrashIcon,
  WarningIcon,
  MagnifyingGlassPlusIcon,
} from "@phosphor-icons/react";
import { formatIDR, calculateItemDiscount } from "#/lib/utils";
import { Pagination } from "#/components/ui/Pagination";
import { ImagePreviewModal } from "#/components/ui/ImagePreviewModal";
import type { Product } from "../types";

interface ProductTableProps {
  products: Product[];
  search: string;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({
  products,
  search,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search)),
  );

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedProducts = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center text-text-3">
          <PackageIcon size={52} className="mb-3 opacity-30" />
          <p className="m-0 text-sm font-semibold">
            {search
              ? `Tidak ada produk yang cocok dengan "${search}"`
              : "Belum ada produk terdaftar"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-only w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  {["Foto", "Nama Produk", "Kategori", "Harga Modal", "Harga Jual", "Stok Barang", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-left text-[11px] font-extrabold tracking-wider text-text-3 uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {pagedProducts.map((p) => {
                  const disc = calculateItemDiscount(p.price, p.discountType, p.discountValue);
                  const effectivePrice = disc.unitPrice;
                  const hasCost = p.costPrice !== undefined && p.costPrice > 0;
                  const profitPerUnit = hasCost ? effectivePrice - (p.costPrice || 0) : null;
                  const marginPct =
                    hasCost && effectivePrice > 0
                      ? (((profitPerUnit || 0) / effectivePrice) * 100).toFixed(0)
                      : null;

                  return (
                    <tr
                      key={p._id}
                      className="border-b border-border transition-colors hover:bg-surface-2"
                    >
                      <td className="px-5 py-3">
                        {p.imageUrl || p.imageId ? (
                          <button
                            type="button"
                            onClick={() => setPreviewProduct(p)}
                            className="group relative flex h-11 w-11 cursor-pointer overflow-hidden rounded-md border border-border transition-all hover:scale-105 hover:ring-2 hover:ring-brand/40"
                            title="Lihat foto produk"
                          >
                            <img
                              src={p.imageUrl || p.imageId}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                              <MagnifyingGlassPlusIcon
                                size={16}
                                className="text-white"
                                weight="bold"
                              />
                            </div>
                          </button>
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-surface-2 text-text-3">
                            <ImageIcon size={20} weight="duotone" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm font-extrabold text-text">{p.name}</div>
                        {p.barcode && (
                          <div className="mt-0.5 font-mono text-[11px] text-text-3">
                            SKU: {p.barcode}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-bold text-text-2">
                          {p.category}
                        </span>
                      </td>
                      {/* Harga Modal (HPP) */}
                      <td className="px-5 py-3">
                        {hasCost ? (
                          <div className="text-xs font-bold text-[var(--color-text-2)]">
                            <span className="price">{formatIDR(p.costPrice || 0)}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-[var(--color-text-3)] italic">
                            Belum diset
                          </span>
                        )}
                      </td>
                      {/* Harga Jual & Margin */}
                      <td className="px-5 py-3">
                        <div>
                          {disc.hasDiscount ? (
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="price text-sm font-extrabold text-[var(--color-brand)]">
                                  {formatIDR(disc.unitPrice)}
                                </span>
                                <span className="rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] px-1.5 py-0.5 text-[10px] font-extrabold text-[var(--color-brand)]">
                                  {p.discountType === "percentage"
                                    ? `${p.discountValue}% OFF`
                                    : `-${formatIDR(p.discountValue || 0)}`}
                                </span>
                              </div>
                              <div className="price mt-0.5 text-[11px] text-[var(--color-text-3)] line-through">
                                {formatIDR(p.price)}
                              </div>
                            </div>
                          ) : (
                            <span className="price text-sm font-extrabold text-[var(--color-text)]">
                              {formatIDR(p.price)}
                            </span>
                          )}

                          {marginPct !== null && (
                            <div className="mt-1">
                              <span
                                className={`inline-block rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                                  (profitPerUnit || 0) >= 0
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : "bg-rose-500/10 text-rose-600"
                                }`}
                              >
                                {(profitPerUnit || 0) >= 0 ? `+${marginPct}% margin` : `${marginPct}% rugi`}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-sm font-extrabold ${
                            p.stock <= 5
                              ? "text-[var(--color-danger-text)]"
                              : "text-[var(--color-text)]"
                          }`}
                        >
                          {p.stock <= 5 && (
                            <WarningIcon
                              size={15}
                              weight="fill"
                              className="text-[var(--color-danger-text)]"
                            />
                          )}
                          {p.stock} pcs
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(p)}
                            className="press-tactile flex cursor-pointer items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                          >
                            <PencilSimpleIcon size={14} weight="bold" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(p)}
                            className="press-tactile flex cursor-pointer items-center gap-1 rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] px-3 py-1.5 text-xs font-bold text-[var(--color-danger-text)]"
                          >
                            <TrashIcon size={14} weight="bold" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="mobile-only flex flex-col divide-y divide-border">
            {pagedProducts.map((p) => {
              const disc = calculateItemDiscount(p.price, p.discountType, p.discountValue);
              const hasCost = p.costPrice !== undefined && p.costPrice > 0;
              const profitPerUnit = hasCost ? disc.unitPrice - (p.costPrice || 0) : null;
              const marginPct =
                hasCost && disc.unitPrice > 0
                  ? (((profitPerUnit || 0) / disc.unitPrice) * 100).toFixed(0)
                  : null;

              return (
                <div key={p._id} className="flex flex-col gap-3 p-4">
                  <div className="flex items-center gap-3">
                    {p.imageUrl || p.imageId ? (
                      <button
                        type="button"
                        onClick={() => setPreviewProduct(p)}
                        className="group relative flex h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border transition-all hover:scale-105"
                        title="Lihat foto produk"
                      >
                        <img
                          src={p.imageUrl || p.imageId}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                          <MagnifyingGlassPlusIcon size={16} className="text-white" weight="bold" />
                        </div>
                      </button>
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-text-3">
                        <ImageIcon size={20} weight="duotone" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-extrabold text-text">{p.name}</div>
                      <div className="mt-0.5 text-xs text-text-3">
                        {p.category} ·{" "}
                        <span className={p.stock <= 5 ? "font-bold text-danger-text" : ""}>
                          Stok: {p.stock} pcs
                        </span>
                      </div>
                      {hasCost && (
                        <div className="mt-0.5 text-[11px] text-text-3">
                          Modal: {formatIDR(p.costPrice || 0)}{" "}
                          {marginPct !== null && (
                            <span className="font-bold text-emerald-600">(+{marginPct}%)</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="price text-sm font-black text-brand">
                        {formatIDR(disc.unitPrice)}
                      </div>
                    </div>
                  </div>


                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      className="press-tactile flex cursor-pointer items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text hover:bg-surface-2"
                    >
                      <PencilSimpleIcon size={13} weight="bold" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p)}
                      className="press-tactile flex cursor-pointer items-center gap-1 rounded-full border border-danger/30 bg-danger-light px-3 py-1.5 text-xs font-bold text-danger-text hover:opacity-90"
                    >
                      <TrashIcon size={13} weight="bold" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unified Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            itemLabel="produk"
          />
        </>
      )}

      {/* Reusable Image Preview Lightbox */}
      <ImagePreviewModal
        isOpen={!!previewProduct}
        onClose={() => setPreviewProduct(null)}
        imageUrl={previewProduct?.imageUrl || previewProduct?.imageId}
        title={previewProduct?.name}
        category={previewProduct?.category}
        price={previewProduct?.price}
        subtitle={
          previewProduct?.barcode
            ? `SKU: ${previewProduct.barcode} · Stok: ${previewProduct.stock} pcs`
            : `Stok: ${previewProduct?.stock} pcs`
        }
      />
    </div>
  );
}
