import { useState, useMemo } from "react";
import { WarningIcon, CheckCircleIcon, PlusIcon, PackageIcon } from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import { Pagination } from "#/components/ui/Pagination";
import { SearchFilter } from "#/components/ui/SearchFilter";
import { Button, DataTable } from "#/components/ui";
import { useAppTable, createAppColumnHelper } from "#/lib/table";
import type { Product } from "#/features/produk";

interface StockTableProps {
  products: Product[];
  lowStockProducts: Product[];
  threshold: number;
  onOpenRestock: (product: Product) => void;
}

const columnHelper = createAppColumnHelper<Product>();

export function StockTable({
  products,
  lowStockProducts,
  threshold,
  onOpenRestock,
}: StockTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search)),
    );
  }, [products, search]);

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("name", {
          header: "Nama Produk",
          cell: (info) => (
            <div className="text-sm font-bold text-[var(--color-text)]">
              {info.getValue()}
            </div>
          ),
        }),
        columnHelper.accessor("category", {
          header: "Kategori",
          cell: (info) => (
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--color-text-2)]">
              {info.getValue()}
            </span>
          ),
        }),
        columnHelper.accessor("stock", {
          header: "Stok Saat Ini",
          cell: (info) => {
            const stock = info.getValue();
            const isLow = stock <= threshold;
            return (
              <span
                className={`price text-sm font-black ${
                  isLow ? "text-[var(--color-danger-text)]" : "text-[var(--color-text)]"
                }`}
              >
                {stock} pcs
              </span>
            );
          },
        }),
        columnHelper.accessor((row) => (row.stock <= threshold ? "low" : "safe"), {
          id: "status",
          header: "Status Persediaan",
          cell: (info) => {
            const isLow = info.row.original.stock <= threshold;
            return (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${
                  isLow
                    ? "border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger-text)]"
                    : "border border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]"
                }`}
              >
                {isLow ? (
                  <WarningIcon size={12} weight="fill" />
                ) : (
                  <CheckCircleIcon size={12} weight="fill" />
                )}
                <span>{isLow ? "Stok Rendah" : "Aman"}</span>
              </span>
            );
          },
        }),
        columnHelper.display({
          id: "actions",
          header: "Aksi Restock",
          enableSorting: false,
          cell: (info) => (
            <div className="text-right">
              <Button
                type="button"
                variant="primary"
                size="xs"
                leftIcon={<PlusIcon size={13} weight="bold" />}
                onClick={() => onOpenRestock(info.row.original)}
              >
                Tambah Stok
              </Button>
            </div>
          ),
        }),
      ]),
    [onOpenRestock, threshold],
  );

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const table = useAppTable({
    data: filtered,
    columns,
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    autoResetPageIndex: false,
  });

  const pagedRows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-6">
      {/* Low stock alert urgent section */}
      {lowStockProducts.length > 0 && (
        <section>
          <div className="mb-3.5 flex items-center gap-2">
            <WarningIcon size={20} weight="fill" className="text-[var(--color-danger-text)]" />
            <h2 className="m-0 text-base font-extrabold text-[var(--color-text)]">
              Perlu Restock Segera (Stok ≤ {threshold})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {lowStockProducts.map((p) => (
              <div
                key={p._id}
                className="flex flex-col justify-between gap-3 rounded-[18px] border border-[var(--color-danger)]/30 bg-[var(--color-surface)] p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-extrabold text-[var(--color-text)]">
                      {p.name}
                    </div>
                    <span className="text-xs font-semibold text-[var(--color-text-3)]">
                      {p.category}
                    </span>
                  </div>
                  <span className="price shrink-0 text-lg font-black text-[var(--color-danger-text)]">
                    {p.stock} pcs
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                  <span className="price text-xs font-bold text-[var(--color-brand)]">
                    {formatIDR(p.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenRestock(p)}
                    className="press-tactile shadow-primary-500/20 flex cursor-pointer items-center gap-1 rounded-full bg-[var(--color-brand)] px-3 py-1 text-xs font-extrabold text-white shadow-xs"
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
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 text-base font-extrabold text-[var(--color-text)]">
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

        <div className="overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-14 text-center text-[var(--color-text-3)]">
              <PackageIcon size={48} className="mb-2 opacity-30" />
              <p className="m-0 text-sm font-semibold">Tidak ada produk yang cocok</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="desktop-only w-full">
                <DataTable table={table} />
              </div>

              {/* Mobile Card List */}
              <div className="mobile-only flex flex-col divide-y divide-[var(--color-border)]">
                {pagedRows.map((row: any) => {
                  const p = row.original;
                  const isLow = p.stock <= threshold;
                  return (
                    <div key={p._id} className="flex flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-extrabold text-[var(--color-text)]">
                            {p.name}
                          </div>
                          <span className="text-xs font-semibold text-[var(--color-text-3)]">
                            {p.category} · {formatIDR(p.price)}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            isLow
                              ? "border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger-text)]"
                              : "border border-[var(--color-brand)]/20 bg-[var(--color-brand-light)] text-[var(--color-brand)]"
                          }`}
                        >
                          {isLow ? "Stok Rendah" : "Aman"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs font-bold text-[var(--color-text-2)]">
                          Stok:{" "}
                          <span
                            className={
                              isLow ? "font-extrabold text-[var(--color-danger-text)]" : ""
                            }
                          >
                            {p.stock} pcs
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="primary"
                          size="xs"
                          leftIcon={<PlusIcon size={13} weight="bold" />}
                          onClick={() => onOpenRestock(p)}
                        >
                          Tambah Stok
                        </Button>
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
