import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { useState } from "react";
import { toast } from "sonner";
import { dayRange, weekRange, monthRange, parseIDRInput } from "#/lib/utils";
import { PlusIcon, CoinsIcon } from "@phosphor-icons/react";
import { ReportPeriodFilter, type Range } from "#/features/laporan";
import { Button } from "#/components/ui";
import {
  ExpenseOverviewCards,
  ExpenseTable,
  ExpenseFormModal,
  type ExpenseFormState,
  type Expense,
} from "#/features/pengeluaran";

export const Route = createFileRoute("/_app/pengeluaran")({
  component: Pengeluaran,
});

function Pengeluaran() {
  const { store, currentCashier } = useAppStore();
  const [range, setRange] = useState<Range>("bulan");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { startOfDay, endOfDay } =
    range === "hari" ? dayRange() : range === "minggu" ? weekRange() : monthRange();

  const periodLabel =
    range === "hari" ? "hari ini" : range === "minggu" ? "minggu ini" : "bulan ini";

  const rawExpenses = useQuery(
    api.expenses.list,
    store
      ? {
          storeId: store._id,
          startDate: startOfDay,
          endDate: endOfDay,
          category: selectedCategory,
        }
      : "skip",
  );

  const expenseSummary = useQuery(
    api.expenses.summary,
    store
      ? {
          storeId: store._id,
          startDate: startOfDay,
          endDate: endOfDay,
        }
      : "skip",
  );

  const activeShift = useQuery(api.shifts.getActive, store ? { storeId: store._id } : "skip");

  const createExpense = useMutation(api.expenses.create);
  const removeExpense = useMutation(api.expenses.remove);

  const expenses = (rawExpenses as Expense[] | undefined) ?? [];
  const totalExpense = expenseSummary?.total ?? 0;
  const expenseCount = expenseSummary?.count ?? 0;
  const byCategory = expenseSummary?.byCategory ?? {};

  const handleSaveExpense = async (form: ExpenseFormState) => {
    if (!store) return;
    const amountNum = parseIDRInput(form.amount);
    if (amountNum <= 0) {
      toast.error("Nominal pengeluaran tidak boleh 0");
      return;
    }

    setSaving(true);
    try {
      // Parse date string (YYYY-MM-DD) to timestamp
      const [y, m, d] = form.date.split("-").map(Number);
      const dateTimestamp = new Date(y, m - 1, d, 12, 0, 0).getTime();

      await createExpense({
        storeId: store._id,
        category: form.category,
        amount: amountNum,
        date: dateTimestamp,
        notes: form.notes.trim() || undefined,
        source: form.source,
        shiftId: form.deductFromDrawer && activeShift ? (activeShift._id as string) : undefined,
        createdBy: currentCashier?.name || "Kasir",
      });

      toast.success("Catatan pengeluaran berhasil disimpan!");
      setModalOpen(false);
    } catch {
      toast.error("Gagal menyimpan pengeluaran. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id: any) => {
    try {
      await removeExpense({ id });
      toast.success("Catatan pengeluaran berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus pengeluaran");
    }
  };

  if (!store || !rawExpenses || !expenseSummary) return <PengeluaranLoader />;

  return (
    <div className="w-full pb-12">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="eyebrow-tag">BIAYA OPERASIONAL & BEBAN</div>
          <h1 className="mt-0.5 text-2xl font-black tracking-tight text-[var(--color-text)]">
            Catat Pengeluaran
          </h1>
          <p className="mt-1 text-xs text-[var(--color-text-2)]">
            Kelola pos biaya dan pengeluaran toko agar laporan laba bersih akurat
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ReportPeriodFilter range={range} onRangeChange={setRange} />

          <Button
            type="button"
            variant="primary"
            size="sm"
            leftIcon={<PlusIcon size={16} weight="bold" />}
            onClick={() => setModalOpen(true)}
          >
            Catat Pengeluaran
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <ExpenseOverviewCards
        totalExpense={totalExpense}
        expenseCount={expenseCount}
        byCategory={byCategory}
        periodLabel={periodLabel}
      />

      {/* Expense History Table */}
      <ExpenseTable
        expenses={expenses}
        onDelete={handleDeleteExpense}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Modal Form */}
      <ExpenseFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        saving={saving}
        onSave={handleSaveExpense}
        activeShift={activeShift}
      />
    </div>
  );
}

function PengeluaranLoader() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <CoinsIcon
        size={48}
        weight="duotone"
        className="animate-pulse text-[var(--color-brand)] opacity-50"
      />
      <p className="text-sm font-bold text-[var(--color-text-2)]">Memuat data pengeluaran...</p>
    </div>
  );
}
