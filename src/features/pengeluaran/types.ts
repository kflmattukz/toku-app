import type { Id } from "../../../convex/_generated/dataModel";

export type ExpenseCategory =
  "operasional" | "gaji" | "sewa" | "utilitas" | "bahan_baku" | "lainnya";

export type ExpenseSource = "cash_drawer" | "bank" | "owner";

export type Expense = {
  _id: Id<"expenses">;
  _creationTime: number;
  storeId: Id<"stores">;
  category: ExpenseCategory;
  amount: number;
  date: number;
  notes?: string;
  source?: ExpenseSource;
  shiftId?: string;
  createdBy: string;
  createdAt: number;
};

export type ExpenseFormState = {
  category: ExpenseCategory;
  amount: string;
  date: string; // YYYY-MM-DD
  notes: string;
  source: ExpenseSource;
  deductFromDrawer: boolean;
};

export const EXPENSE_CATEGORIES: Array<{ key: ExpenseCategory; label: string; iconColor: string }> =
  [
    { key: "operasional", label: "Operasional Harian", iconColor: "text-amber-500" },
    { key: "bahan_baku", label: "Belanja Bahan / Kulakan", iconColor: "text-blue-500" },
    { key: "utilitas", label: "Listrik / Air / Internet", iconColor: "text-yellow-500" },
    { key: "gaji", label: "Gaji & Komisi Karyawan", iconColor: "text-purple-500" },
    { key: "sewa", label: "Sewa Tempat / Ruko", iconColor: "text-emerald-500" },
    { key: "lainnya", label: "Pengeluaran Lainnya", iconColor: "text-stone-500" },
  ];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  operasional: "Operasional Harian",
  bahan_baku: "Belanja Bahan / Kulakan",
  utilitas: "Listrik / Air / Internet",
  gaji: "Gaji & Komisi Karyawan",
  sewa: "Sewa Tempat / Ruko",
  lainnya: "Pengeluaran Lainnya",
};
