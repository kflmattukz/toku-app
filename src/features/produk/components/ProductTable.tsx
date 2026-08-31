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
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[18px] overflow-hidden shadow-xs">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 text-[var(--color-text-3)]">
          <PackageIcon size={52} className="opacity-30 mb-3" />
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
                <tr className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                  {["Foto", "Nama Produk", "Kategori", "Harga Jual", "Stok Barang", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        className="py-4 px-5 text-left text-[11px] font-extrabold text-[var(--color-text-3)] uppercase tracking-wider"
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
                      className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
                    >
                      <td className="py-3 px-5">
                        {p.imageUrl || p.imageId ? (
                          <img
                            src={p.imageUrl || p.imageId}
                            alt={p.name}
                            className="w-11 h-11 rounded-[12px] object-cover border border-[var(--color-border)]"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-3)]">
                            <ImageIcon size={20} weight="duotone" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-5">
                        <div className="font-extrabold text-sm text-[var(--color-text)]">
                          {p.name}
                        </div>
                        {p.barcode && (
                          <div className="text-[11px] text-[var(--color-text-3)] mt-0.5 font-mono">
                            SKU: {p.barcode}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-5">
                        <span className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full px-3 py-1 text-xs text-[var(--color-text-2)] font-bold">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        {disc.hasDiscount ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="price font-extrabold text-sm text-[var(--color-brand)]">
                                {formatIDR(disc.unitPrice)}
                              </span>
                              <span className="text-[10px] font-extrabold bg-[var(--color-brand-light)] text-[var(--color-brand)] border border-[var(--color-brand)] px-1.5 py-0.5 rounded-full">
                                {p.discountType === "percentage"
                                  ? `${p.discountValue}% OFF`
                                  : `-${formatIDR(p.discountValue || 0)}`}
                              </span>
                            </div>
                            <div className="price text-[11px] text-[var(--color-text-3)] line-through mt-0.5">
                              {formatIDR(p.price)}
                            </div>
                          </div>
                        ) : (
                          <span className="price font-extrabold text-sm text-[var(--color-text)]">
                            {formatIDR(p.price)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5">
                        <span
                          className={`font-extrabold text-sm inline-flex items-center gap-1.5 ${
                            p.stock <= 5 ? "text-[var(--color-danger-text)]" : "text-[var(--color-text)]"
                          }`}
                        >
                          {p.stock <= 5 && <WarningIcon size={15} weight="fill" className="text-[var(--color-danger-text)]" />}
                          {p.stock} pcs
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(p)}
                            className="press-tactile py-1.5 px-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-[var(--color-surface-2)]"
                          >
                            <PencilSimpleIcon size={14} weight="bold" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(p)}
                            className="press-tactile py-1.5 px-3 rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger-text)] text-xs font-bold flex items-center gap-1 cursor-pointer"
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
                <div key={p._id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    {p.imageUrl || p.imageId ? (
                      <img
                        src={p.imageUrl || p.imageId}
                        alt={p.name}
                        className="w-12 h-12 rounded-[12px] object-cover border border-[var(--color-border)] shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-[12px] bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-3)] shrink-0">
                        <ImageIcon size={20} weight="duotone" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-sm text-[var(--color-text)] truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-[var(--color-text-3)] mt-0.5">
                        {p.category} ·{" "}
                        <span className={p.stock <= 5 ? "text-[var(--color-danger-text)] font-bold" : ""}>
                          Stok: {p.stock} pcs
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="price font-black text-sm text-[var(--color-brand)]">
                        {formatIDR(disc.unitPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      className="press-tactile py-1.5 px-3 rounded-full border border-[var(--color-border)] text-xs font-bold flex items-center gap-1 cursor-pointer bg-[var(--color-surface)] text-[var(--color-text)]"
                    >
                      <PencilSimpleIcon size={13} weight="bold" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p)}
                      className="press-tactile py-1.5 px-3 rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger-text)] text-xs font-bold flex items-center gap-1 cursor-pointer"
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
