import { useState, useMemo } from "react";
import {
  WarningIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  PackageIcon,
} from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import { Pagination } from "#/components/ui/Pagination";
import { SearchFilter } from "#/components/ui/SearchFilter";
import { Button, DataTable } from "#/components/ui";
import { useAppTable, createAppColumnHelper } from "#/lib/table";
import type { Product, ProductVariant } from "#/features/produk";

interface StockTableProps {
  products: Product[];
  lowStockProducts: Product[];
  threshold: number;
  onOpenRestock: (product: Product) => void;
}

type StockLevel = "empty" | "low" | "safe";

interface ProductStockStatus {
  level: StockLevel;
  emptyVariants: ProductVariant[];
  lowVariants: ProductVariant[];
  totalLowVariants: ProductVariant[];
  hasVariants: boolean;
}

function getProductStockStatus(product: Product, threshold: number): ProductStockStatus {
  const hasVariants = Boolean(product.hasVariants && product.variants && product.variants.length > 0);
  if (!hasVariants) {
    const level: StockLevel = product.stock <= 0 ? "empty" : product.stock <= threshold ? "low" : "safe";
    return {
      level,
      emptyVariants: [],
      lowVariants: [],
      totalLowVariants: [],
      hasVariants: false,
    };
  }

  const variants = product.variants || [];
  const emptyVariants = variants.filter((v) => v.stock <= 0);
  const lowVariants = variants.filter((v) => v.stock > 0 && v.stock <= threshold);
  const totalLowVariants = [...emptyVariants, ...lowVariants];

  let level: StockLevel = "safe";
  if (product.stock <= 0 || emptyVariants.length > 0) {
    level = "empty";
  } else if (product.stock <= threshold || lowVariants.length > 0) {
    level = "low";
  }

  return {
    level,
    emptyVariants,
    lowVariants,
    totalLowVariants,
    hasVariants: true,
  };
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
    const q = search.toLowerCase();
    return products.filter((p) => {
      const cats =
        p.categories && p.categories.length > 0
          ? p.categories
          : p.category
            ? [p.category]
            : [];
      const matchCat = cats.some((c) => c.toLowerCase().includes(q));
      return (
        p.name.toLowerCase().includes(q) ||
        matchCat ||
        (p.barcode && p.barcode.includes(search)) ||
        (p.variants &&
          p.variants.some((v) => v.name.toLowerCase().includes(q)))
      );
    });
  }, [products, search]);

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("name", {
          header: "Nama Produk",
          cell: (info) => {
            const p = info.row.original;
            const status = getProductStockStatus(p, threshold);
            return (
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[var(--color-text)]">{p.name}</span>
                  {status.hasVariants && (
                    <span className="rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-brand)]">
                      {p.variants?.length} Varian
                    </span>
                  )}
                </div>
                {status.hasVariants && status.totalLowVariants.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {status.totalLowVariants.map((v) => {
                      const isVEmpty = v.stock <= 0;
                      return (
                        <span
                          key={v.id}
                          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${
                            isVEmpty
                              ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          <span>{v.name || Object.values(v.combination).join("/")}</span>
                          <span className="font-mono font-extrabold">{v.stock} pcs</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          },
        }),
        columnHelper.accessor(
          (row) =>
            row.categories && row.categories.length > 0
              ? row.categories
              : row.category
                ? [row.category]
                : [],
          {
            id: "categories",
            header: "Kategori",
            cell: (info) => {
              const cats = (info.getValue() as string[]) || [];
              if (cats.length === 0)
                return <span className="text-xs text-[var(--color-text-3)]">-</span>;
              const displayCats = cats.slice(0, 2);
              const remaining = cats.length - 2;

              return (
                <div className="flex flex-wrap items-center gap-1" title={cats.join(", ")}>
                  {displayCats.map((cat, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-text-2)]"
                    >
                      {cat}
                    </span>
                  ))}
                  {remaining > 0 && (
                    <span
                      className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-3)] px-1.5 py-0.5 text-[10px] font-extrabold text-[var(--color-text-3)]"
                      title={cats.slice(2).join(", ")}
                    >
                      +{remaining}
                    </span>
                  )}
                </div>
              );
            },
          }
        ),
        columnHelper.accessor("stock", {
          header: "Stok Saat Ini",
          cell: (info) => {
            const p = info.row.original;
            const status = getProductStockStatus(p, threshold);
            return (
              <div className="flex flex-col">
                <span
                  className={`price text-sm ${
                    status.level === "empty"
                      ? "font-black text-rose-600 dark:text-rose-400"
                      : status.level === "low"
                        ? "font-black text-amber-600 dark:text-amber-400"
                        : "font-black text-[var(--color-text)]"
                  }`}
                >
                  {p.stock} pcs
                </span>
                {status.hasVariants && (
                  <span className="text-[10px] text-[var(--color-text-3)] font-semibold">
                    Total semua varian
                  </span>
                )}
              </div>
            );
          },
        }),
        columnHelper.display({
          id: "status",
          header: "Status Persediaan",
          cell: (info) => {
            const p = info.row.original;
            const status = getProductStockStatus(p, threshold);

            if (status.hasVariants) {
              if (status.emptyVariants.length > 0) {
                return (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-extrabold text-rose-600 dark:text-rose-400">
                    <XCircleIcon size={13} weight="fill" />
                    <span>{status.emptyVariants.length} Varian Habis</span>
                  </span>
                );
              }
              if (status.lowVariants.length > 0) {
                return (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-xs font-extrabold text-amber-600 dark:text-amber-400">
                    <WarningIcon size={12} weight="fill" />
                    <span>{status.lowVariants.length} Varian Menipis</span>
                  </span>
                );
              }
              return (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] px-3 py-1 text-xs font-extrabold text-[var(--color-brand)]">
                  <CheckCircleIcon size={12} weight="fill" />
                  <span>Semua Aman</span>
                </span>
              );
            }

            if (status.level === "empty") {
              return (
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-extrabold text-rose-600 dark:text-rose-400">
                  <XCircleIcon size={13} weight="fill" />
                  <span>Stok Habis</span>
                </span>
              );
            }
            if (status.level === "low") {
              return (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-xs font-extrabold text-amber-600 dark:text-amber-400">
                  <WarningIcon size={12} weight="fill" />
                  <span>Stok Menipis</span>
                </span>
              );
            }
            return (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] px-3 py-1 text-xs font-extrabold text-[var(--color-brand)]">
                <CheckCircleIcon size={12} weight="fill" />
                <span>Aman</span>
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
            {lowStockProducts.map((p) => {
              const status = getProductStockStatus(p, threshold);
              const isEmpty = status.level === "empty";
              return (
                <div
                  key={p._id}
                  className={`flex flex-col justify-between gap-3 rounded-[18px] border p-4 shadow-xs transition-colors ${
                    isEmpty
                      ? "border-rose-500/35 bg-rose-500/[0.02]"
                      : "border-amber-500/35 bg-amber-500/[0.02]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-extrabold text-[var(--color-text)]">
                          {p.name}
                        </span>
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                            isEmpty
                              ? "border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              : "border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {status.hasVariants
                            ? status.emptyVariants.length > 0
                              ? `${status.emptyVariants.length} Varian Habis`
                              : `${status.lowVariants.length} Varian Menipis`
                            : isEmpty
                              ? "Habis"
                              : "Menipis"}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[var(--color-text-3)]">
                        {(p.categories && p.categories.length > 0 ? p.categories : [p.category]).join(", ")}{" "}
                        {status.hasVariants && `· ${p.variants?.length} Varian`}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`price text-lg font-black ${
                          isEmpty
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {p.stock} pcs
                      </span>
                      {status.hasVariants && (
                        <div className="text-[10px] font-semibold text-[var(--color-text-3)]">
                          Total
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warning chips for low / empty variants */}
                  {status.hasVariants && status.totalLowVariants.length > 0 && (
                    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-2">
                      <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-text-3)]">
                        Varian Perlu Restok:
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-0.5">
                        {status.totalLowVariants.map((v) => {
                          const isVEmpty = v.stock <= 0;
                          return (
                            <span
                              key={v.id}
                              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-bold ${
                                isVEmpty
                                  ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                  : "border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              <span>{v.name || Object.values(v.combination).join("/")}</span>
                              <span className="font-mono font-black">({v.stock} pcs)</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
              );
            })}
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
              placeholder="Cari nama, kategori, varian..."
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
                <DataTable
                  table={table}
                  rowClassName={(row) => {
                    const status = getProductStockStatus(row.original, threshold);
                    if (status.level === "empty") return "bg-rose-500/[0.035] hover:bg-rose-500/[0.07]";
                    if (status.level === "low") return "bg-amber-500/[0.035] hover:bg-amber-500/[0.07]";
                    return "hover:bg-[var(--color-surface-2)]";
                  }}
                />
              </div>

              {/* Mobile Card List */}
              <div className="mobile-only flex flex-col divide-y divide-[var(--color-border)]">
                {pagedRows.map((row: any) => {
                  const p = row.original;
                  const status = getProductStockStatus(p, threshold);
                  const isEmpty = status.level === "empty";
                  return (
                    <div
                      key={p._id}
                      className={`flex flex-col gap-3 p-4 transition-colors ${
                        isEmpty
                          ? "bg-rose-500/[0.035]"
                          : status.level === "low"
                            ? "bg-amber-500/[0.035]"
                            : "bg-[var(--color-surface)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-extrabold text-[var(--color-text)]">
                              {p.name}
                            </span>
                            {status.hasVariants && (
                              <span className="rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] px-1.5 py-0.2 text-[10px] font-extrabold text-[var(--color-brand)]">
                                {p.variants?.length} Varian
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-[var(--color-text-3)]">
                            {(p.categories && p.categories.length > 0 ? p.categories : [p.category]).join(", ")} · {formatIDR(p.price)}
                          </span>
                        </div>
                        {status.hasVariants ? (
                          status.emptyVariants.length > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-600 dark:text-rose-400">
                              <XCircleIcon size={12} weight="fill" />
                              <span>{status.emptyVariants.length} Varian Habis</span>
                            </span>
                          ) : status.lowVariants.length > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                              <WarningIcon size={11} weight="fill" />
                              <span>{status.lowVariants.length} Varian Menipis</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-brand)]/20 bg-[var(--color-brand-light)] px-2.5 py-0.5 text-[10px] font-extrabold text-[var(--color-brand)]">
                              <CheckCircleIcon size={11} weight="fill" />
                              <span>Aman</span>
                            </span>
                          )
                        ) : isEmpty ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-600 dark:text-rose-400">
                            <XCircleIcon size={12} weight="fill" />
                            <span>Stok Habis</span>
                          </span>
                        ) : status.level === "low" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                            <WarningIcon size={11} weight="fill" />
                            <span>Stok Menipis</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-brand)]/20 bg-[var(--color-brand-light)] px-2.5 py-0.5 text-[10px] font-extrabold text-[var(--color-brand)]">
                            <CheckCircleIcon size={11} weight="fill" />
                            <span>Aman</span>
                          </span>
                        )}
                      </div>

                      {/* Variant chips in mobile card */}
                      {status.hasVariants && status.totalLowVariants.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {status.totalLowVariants.map((v) => {
                            const isVEmpty = v.stock <= 0;
                            return (
                              <span
                                key={v.id}
                                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${
                                  isVEmpty
                                    ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                    : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                }`}
                              >
                                <span>{v.name || Object.values(v.combination).join("/")}</span>
                                <span className="font-mono font-extrabold">{v.stock} pcs</span>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs font-bold text-[var(--color-text-2)]">
                          Stok:{" "}
                          <span
                            className={`font-black ${
                              isEmpty
                                ? "text-rose-600 dark:text-rose-400"
                                : status.level === "low"
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-[var(--color-text)]"
                            }`}
                          >
                            {p.stock} pcs
                          </span>
                          {status.hasVariants && (
                            <span className="text-[10px] text-[var(--color-text-3)] font-normal ml-1">
                              (Total)
                            </span>
                          )}
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
