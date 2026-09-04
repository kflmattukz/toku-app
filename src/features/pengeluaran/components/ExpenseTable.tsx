import { useState, useMemo } from "react";
import { ReceiptIcon, TrashIcon, FunnelIcon, TagIcon } from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import { Button, DataTable } from "#/components/ui";
import { useAppTable, createAppColumnHelper } from "#/lib/table";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS, type Expense } from "../types";

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (id: any) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

const columnHelper = createAppColumnHelper<Expense>();

export function ExpenseTable({
  expenses,
  onDelete,
  selectedCategory,
  onSelectCategory,
}: ExpenseTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const getSourceLabel = (src?: string) => {
    switch (src) {
      case "cash_drawer":
        return "Laci Kasir";
      case "bank":
        return "Transfer Bank";
      case "owner":
        return "Modal Owner";
      default:
        return "Lainnya";
    }
  };

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("date", {
          header: "Tanggal",
          cell: (info) => {
            const dateObj = new Date(info.getValue());
            const formattedDate = dateObj.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <span className="text-xs font-bold text-[var(--color-text)]">
                {formattedDate}
              </span>
            );
          },
        }),
        columnHelper.accessor("category", {
          header: "Kategori",
          cell: (info) => {
            const cat = info.getValue();
            return (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-text)]">
                <TagIcon size={12} weight="bold" />
                <span>{EXPENSE_CATEGORY_LABELS[cat] || cat}</span>
              </span>
            );
          },
        }),
        columnHelper.accessor("notes", {
          header: "Keperluan / Catatan",
          cell: (info) => {
            const exp = info.row.original;
            return (
              <div>
                <div className="text-xs font-medium text-[var(--color-text)]">
                  {exp.notes || "-"}
                </div>
                <div className="text-[10px] text-[var(--color-text-3)]">
                  Dicatat oleh: {exp.createdBy}
                </div>
              </div>
            );
          },
        }),
        columnHelper.accessor("source", {
          header: "Sumber Dana",
          cell: (info) => (
            <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-text-2)]">
              {getSourceLabel(info.getValue())}
            </span>
          ),
        }),
        columnHelper.accessor("amount", {
          header: "Nominal",
          cell: (info) => (
            <span className="price text-sm font-black text-rose-600">
              -{formatIDR(info.getValue())}
            </span>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: "Aksi",
          enableSorting: false,
          cell: (info) => (
            <Button
              type="button"
              variant="danger-subtle"
              size="xs"
              leftIcon={<TrashIcon size={14} weight="bold" />}
              onClick={() => setDeleteTarget(info.row.original)}
              title="Hapus pengeluaran"
            >
              Hapus
            </Button>
          ),
        }),
      ]),
    [],
  );

  const table = useAppTable({
    data: expenses,
    columns,
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] p-4">
        <div className="flex items-center gap-2">
          <FunnelIcon size={16} weight="bold" className="text-[var(--color-brand)]" />
          <span className="text-xs font-extrabold text-[var(--color-text)]">Filter Kategori:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelectCategory("all")}
            className={`press-tactile cursor-pointer rounded-full border px-3 py-1 text-xs font-bold transition-all ${
              selectedCategory === "all"
                ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white shadow-xs"
                : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)]"
            }`}
          >
            Semua ({expenses.length})
          </button>
          {EXPENSE_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onSelectCategory(cat.key)}
                className={`press-tactile cursor-pointer rounded-full border px-3 py-1 text-xs font-bold transition-all ${
                  active
                    ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white shadow-xs"
                    : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center text-[var(--color-text-3)]">
          <ReceiptIcon size={52} className="mb-3 opacity-30" />
          <p className="m-0 text-sm font-semibold">
            {selectedCategory !== "all"
              ? "Tidak ada pengeluaran pada kategori ini"
              : "Belum ada catatan pengeluaran pada periode ini"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-only w-full">
            <DataTable table={table} />
          </div>

          {/* Mobile Card List View */}
          <div className="mobile-only flex flex-col divide-y divide-[var(--color-border)]">
            {rows.map((row: any) => {
              const exp = row.original as Expense;
              const dateObj = new Date(exp.date);
              const formattedDate = dateObj.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              });

              return (
                <div key={exp._id} className="flex items-center justify-between p-4">
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-text)]">
                        {EXPENSE_CATEGORY_LABELS[exp.category] || exp.category}
                      </span>
                      <span className="text-[11px] font-semibold text-[var(--color-text-3)]">
                        {formattedDate}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-xs font-bold text-[var(--color-text)]">
                      {exp.notes || "Pengeluaran tanpa catatan"}
                    </div>
                    <div className="mt-0.5 text-[10px] text-[var(--color-text-3)]">
                      Sumber: {getSourceLabel(exp.source)}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="price text-sm font-black text-rose-600">
                      -{formatIDR(exp.amount)}
                    </div>
                    <Button
                      type="button"
                      variant="danger-subtle"
                      size="xs"
                      onClick={() => setDeleteTarget(exp)}
                      className="!h-8 !w-8 rounded-full !p-0"
                    >
                      <TrashIcon size={14} weight="bold" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete Confirmation Alert */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl">
            <h3 className="text-base font-extrabold text-[var(--color-text)]">
              Hapus Pengeluaran?
            </h3>
            <p className="mt-1.5 text-xs text-[var(--color-text-2)]">
              Apakah Anda yakin ingin menghapus catatan biaya sebesar{" "}
              <strong>{formatIDR(deleteTarget.amount)}</strong> (
              {deleteTarget.notes || "Tanpa catatan"})?
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => setDeleteTarget(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => {
                  onDelete(deleteTarget._id);
                  setDeleteTarget(null);
                }}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
