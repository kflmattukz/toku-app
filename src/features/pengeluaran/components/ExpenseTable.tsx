import { useState } from "react";
import {
  ReceiptIcon,
  TrashIcon,
  FunnelIcon,
  TagIcon,
} from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  type Expense,
  type ExpenseCategory,
} from "../types";

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (id: any) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

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
          <div className="desktop-only w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  {["Tanggal", "Kategori", "Keperluan / Catatan", "Sumber Dana", "Nominal", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-[11px] font-extrabold tracking-wider text-[var(--color-text-3)] uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => {
                  const dateObj = new Date(exp.date);
                  const formattedDate = dateObj.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={exp._id}
                      className="border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-2)]"
                    >
                      <td className="px-5 py-3 text-xs font-bold text-[var(--color-text)]">
                        {formattedDate}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-text)]">
                          <TagIcon size={12} weight="bold" />
                          <span>{EXPENSE_CATEGORY_LABELS[exp.category] || exp.category}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-xs font-medium text-[var(--color-text)]">
                          {exp.notes || "-"}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-3)]">
                          Dicatat oleh: {exp.createdBy}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs font-medium text-[var(--color-text-2)]">
                        <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-0.5 text-[11px] font-bold">
                          {getSourceLabel(exp.source)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="price text-sm font-black text-rose-600">
                          -{formatIDR(exp.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(exp)}
                          className="press-tactile flex cursor-pointer items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-500/20"
                          title="Hapus pengeluaran"
                        >
                          <TrashIcon size={14} weight="bold" />
                          <span>Hapus</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="mobile-only flex flex-col divide-y divide-[var(--color-border)]">
            {expenses.map((exp) => {
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
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(exp)}
                      className="press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600"
                    >
                      <TrashIcon size={14} weight="bold" />
                    </button>
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
            <h3 className="text-base font-extrabold text-[var(--color-text)]">Hapus Pengeluaran?</h3>
            <p className="mt-1.5 text-xs text-[var(--color-text-2)]">
              Apakah Anda yakin ingin menghapus catatan biaya sebesar{" "}
              <strong>{formatIDR(deleteTarget.amount)}</strong> ({deleteTarget.notes || "Tanpa catatan"})?
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="press-tactile cursor-pointer rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-2 text-xs font-bold text-[var(--color-text)]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(deleteTarget._id);
                  setDeleteTarget(null);
                }}
                className="press-tactile cursor-pointer rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
