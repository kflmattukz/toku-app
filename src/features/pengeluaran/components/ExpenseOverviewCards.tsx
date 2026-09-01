import { TagIcon, ReceiptIcon, TrendDownIcon } from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import { EXPENSE_CATEGORY_LABELS, type ExpenseCategory } from "../types";

interface ExpenseOverviewCardsProps {
  totalExpense: number;
  expenseCount: number;
  byCategory: Record<string, number>;
  periodLabel: string;
}

export function ExpenseOverviewCards({
  totalExpense,
  expenseCount,
  byCategory,
  periodLabel,
}: ExpenseOverviewCardsProps) {
  // Find top expense category
  let topCategory: ExpenseCategory = "operasional";
  let topCategoryAmount = 0;

  for (const [cat, amt] of Object.entries(byCategory)) {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategory = cat as ExpenseCategory;
    }
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* 1. Total Pengeluaran */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-rose-600 uppercase">
              TOTAL BIAYA
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600">
              <TrendDownIcon size={22} weight="duotone" />
            </div>
          </div>
          <div className="mb-1 text-xs font-bold text-[var(--color-text-2)]">
            Total Pengeluaran Toko
          </div>
          <div className="price mb-1.5 text-2xl font-black tracking-tight text-rose-600 sm:text-3xl">
            {formatIDR(totalExpense)}
          </div>
          <div className="text-[11px] font-medium text-[var(--color-text-3)]">
            Periode {periodLabel}
          </div>
        </div>
      </div>

      {/* 2. Pengeluaran Terbesar */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-amber-600 uppercase">
              BIAYA TERBESAR
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600">
              <TagIcon size={22} weight="duotone" />
            </div>
          </div>
          <div className="mb-1 text-xs font-bold text-[var(--color-text-2)]">Kategori Dominan</div>
          <div className="mb-1.5 truncate text-xl font-black tracking-tight text-[var(--color-text)]">
            {topCategoryAmount > 0
              ? EXPENSE_CATEGORY_LABELS[topCategory] || topCategory
              : "Belum ada biaya"}
          </div>
          <div className="price text-[11px] font-bold text-amber-600">
            {topCategoryAmount > 0
              ? `${formatIDR(topCategoryAmount)} terpakai`
              : "Toko hemat biaya"}
          </div>
        </div>
      </div>

      {/* 3. Frekuensi Pengeluaran */}
      <div className="doppelrand-shell sm:col-span-2 lg:col-span-1">
        <div className="doppelrand-core">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-[var(--color-brand)] uppercase">
              REKAP CATATAN
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              <ReceiptIcon size={22} weight="duotone" />
            </div>
          </div>
          <div className="mb-1 text-xs font-bold text-[var(--color-text-2)]">Frekuensi Catatan</div>
          <div className="mb-1.5 text-2xl font-black tracking-tight text-[var(--color-text)] sm:text-3xl">
            {expenseCount} Catatan
          </div>
          <div className="text-[11px] font-medium text-[var(--color-text-3)]">
            Pos pengeluaran tercatat
          </div>
        </div>
      </div>
    </div>
  );
}
