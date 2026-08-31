import { useState } from "react";
import {
  WarningIcon,
  CheckCircleIcon,
  PlusIcon,
  PackageIcon,
} from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import { Pagination } from "#/components/ui/Pagination";
import { SearchFilter } from "#/components/ui/SearchFilter";
import type { Product } from "#/features/produk";

interface StockTableProps {
  products: Product[];
  lowStockProducts: Product[];
  threshold: number;
  onOpenRestock: (product: Product) => void;
}

export function StockTable({
  products,
  lowStockProducts,
  threshold,
  onOpenRestock,
}: StockTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search)),
  );

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedProducts = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="flex flex-col gap-6">
      {/* Low stock alert urgent section */}
      {lowStockProducts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3.5">
            <WarningIcon size={20} weight="fill" className="text-[var(--color-danger-text)]" />
            <h2 className="text-base font-extrabold text-[var(--color-text)] m-0">
              Perlu Restock Segera (Stok ≤ {threshold})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {lowStockProducts.map((p) => (
              <div
                key={p._id}
                className="bg-[var(--color-surface)] border border-[var(--color-danger)]/30 rounded-[18px] p-4 shadow-xs flex flex-col justify-between gap-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-[var(--color-text)] truncate">
                      {p.name}
                    </div>
                    <span className="text-xs text-[var(--color-text-3)] font-semibold">
                      {p.category}
                    </span>
                  </div>
                  <span className="price text-lg font-black text-[var(--color-danger-text)] shrink-0">
                    {p.stock} pcs
                  </span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[var(--color-border)]">
                  <span className="price text-xs font-bold text-[var(--color-brand)]">
                    {formatIDR(p.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenRestock(p)}
                    className="press-tactile py-1 px-3 rounded-full bg-[var(--color-brand)] text-white text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-xs shadow-primary-500/20"
                  >
                    <PlusIcon size={13} weight="bold" />
                    <span>Restock</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Products Inventory Table Section */}
      <section>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3.5">
          <h2 className="text-base font-extrabold text-[var(--color-text)] m-0">
            Semua Persediaan Produk ({products.length})
          </h2>
          <div className="w-full sm:w-72">
            <SearchFilter
              search={search}
              onSearchChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Cari nama atau kategori..."
            />
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[18px] overflow-hidden shadow-xs">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14 px-4 text-[var(--color-text-3)]">
              <PackageIcon size={48} className="opacity-30 mb-2" />
              <p className="m-0 text-sm font-semibold">Tidak ada produk yang cocok</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="desktop-only w-full overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                      {["Nama Produk", "Kategori", "Stok Saat Ini", "Status Persediaan", "Aksi Restock"].map(
                        (h, idx) => (
                          <th
                            key={h}
                            className={`py-3.5 px-5 text-[11px] font-extrabold text-[var(--color-text-3)] uppercase tracking-wider ${
                              idx === 4 ? "text-right" : "text-left"
                            }`}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedProducts.map((p) => {
                      const isLow = p.stock <= threshold;
                      return (
                        <tr
                          key={p._id}
                          className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors"
                        >
                          <td className="py-3.5 px-5">
                            <div className="text-sm font-bold text-[var(--color-text)]">
                              {p.name}
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full px-3 py-1 text-xs text-[var(--color-text-2)] font-semibold">
                              {p.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`price text-sm font-black ${
                                isLow ? "text-[var(--color-danger-text)]" : "text-[var(--color-text)]"
                              }`}
                            >
                              {p.stock} pcs
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span
                              className={`inline-flex items-center gap-1 py-1 px-3 rounded-full text-xs font-extrabold ${
                                isLow
                                  ? "bg-[var(--color-danger-light)] text-[var(--color-danger-text)] border border-[var(--color-danger)]/30"
                                  : "bg-[var(--color-brand-light)] text-[var(--color-brand)] border border-[var(--color-brand)]"
                              }`}
                            >
                              {isLow ? (
                                <WarningIcon size={12} weight="fill" />
                              ) : (
                                <CheckCircleIcon size={12} weight="fill" />
                              )}
                              <span>{isLow ? "Stok Rendah" : "Aman"}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => onOpenRestock(p)}
                              className="press-tactile py-1 px-3 rounded-full bg-[var(--color-brand)] text-white text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer shadow-xs shadow-primary-500/20"
                            >
                              <PlusIcon size={13} weight="bold" />
                              <span>Tambah Stok</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="mobile-only flex flex-col divide-y divide-[var(--color-border)]">
                {pagedProducts.map((p) => {
                  const isLow = p.stock <= threshold;
                  return (
                    <div key={p._id} className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="text-sm font-extrabold text-[var(--color-text)]">
                            {p.name}
                          </div>
                          <span className="text-xs text-[var(--color-text-3)] font-semibold">
                            {p.category} · {formatIDR(p.price)}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[10px] font-extrabold ${
                            isLow
                              ? "bg-[var(--color-danger-light)] text-[var(--color-danger-text)] border border-[var(--color-danger)]/30"
                              : "bg-[var(--color-brand-light)] text-[var(--color-brand)] border border-[var(--color-brand)]/20"
                          }`}
                        >
                          {isLow ? "Stok Rendah" : "Aman"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <div className="text-xs text-[var(--color-text-2)] font-bold">
                          Stok:{" "}
                          <span className={isLow ? "text-[var(--color-danger-text)] font-extrabold" : ""}>
                            {p.stock} pcs
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenRestock(p)}
                          className="press-tactile py-1.5 px-3 rounded-full bg-[var(--color-brand)] text-white text-xs font-extrabold flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <PlusIcon size={13} weight="bold" />
                          <span>Restock</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                itemLabel="produk"
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
