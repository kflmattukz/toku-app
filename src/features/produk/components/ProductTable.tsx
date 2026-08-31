import {
  PackageIcon,
  ImageIcon,
  PencilSimpleIcon,
  TrashIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { formatIDR, calculateItemDiscount } from "#/lib/utils";
import { Pagination } from "#/components/ui/Pagination";
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
    <div className="overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center text-[var(--color-text-3)]">
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
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  {["Foto", "Nama Produk", "Kategori", "Harga Jual", "Stok Barang", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-left text-[11px] font-extrabold tracking-wider text-[var(--color-text-3)] uppercase"
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
                  return (
                    <tr
                      key={p._id}
                      className="border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-2)]"
                    >
                      <td className="px-5 py-3">
                        {p.imageUrl || p.imageId ? (
                          <img
                            src={p.imageUrl || p.imageId}
                            alt={p.name}
                            className="h-11 w-11 rounded-[12px] border border-[var(--color-border)] object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-3)]">
                            <ImageIcon size={20} weight="duotone" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm font-extrabold text-[var(--color-text)]">
                          {p.name}
                        </div>
                        {p.barcode && (
                          <div className="mt-0.5 font-mono text-[11px] text-[var(--color-text-3)]">
                            SKU: {p.barcode}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1 text-xs font-bold text-[var(--color-text-2)]">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-5 py-3">
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
          <div className="mobile-only flex flex-col divide-y divide-[var(--color-border)]">
            {pagedProducts.map((p) => {
              const disc = calculateItemDiscount(p.price, p.discountType, p.discountValue);
              return (
                <div key={p._id} className="flex flex-col gap-3 p-4">
                  <div className="flex items-center gap-3">
                    {p.imageUrl || p.imageId ? (
                      <img
                        src={p.imageUrl || p.imageId}
                        alt={p.name}
                        className="h-12 w-12 shrink-0 rounded-[12px] border border-[var(--color-border)] object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-3)]">
                        <ImageIcon size={20} weight="duotone" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-extrabold text-[var(--color-text)]">
                        {p.name}
                      </div>
                      <div className="mt-0.5 text-xs text-[var(--color-text-3)]">
                        {p.category} ·{" "}
                        <span
                          className={
                            p.stock <= 5 ? "font-bold text-[var(--color-danger-text)]" : ""
                          }
                        >
                          Stok: {p.stock} pcs
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="price text-sm font-black text-[var(--color-brand)]">
                        {formatIDR(disc.unitPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      className="press-tactile flex cursor-pointer items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-bold text-[var(--color-text)]"
                    >
                      <PencilSimpleIcon size={13} weight="bold" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p)}
                      className="press-tactile flex cursor-pointer items-center gap-1 rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] px-3 py-1.5 text-xs font-bold text-[var(--color-danger-text)]"
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
    </div>
  );
}
