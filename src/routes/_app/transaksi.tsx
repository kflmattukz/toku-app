import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { ReceiptIcon } from "@phosphor-icons/react";
import {
  useTransactionFilter,
  TransactionTable,
  TransactionDetailModal,
  TransactionCancelModal,
  type Transaction,
} from "#/features/transaksi";

export const Route = createFileRoute("/_app/transaksi")({ component: Transaksi });

function Transaksi() {
  const { store, currentCashier } = useAppStore();
  const rawTransactions = useQuery(
    api.transactions.list,
    store ? { storeId: store._id } : "skip",
  );
  const transactions = (rawTransactions as Transaction[] | undefined) ?? [];

  const {
    selected,
    setSelected,
    pageSize,
    setPageSize,
    page,
    setPage,
    statusFilter,
    setStatusFilter,
    cancelTarget,
    setCancelTarget,
    selectedReasonId,
    setSelectedReasonId,
    customReasonNote,
    setCustomReasonNote,
    cancelling,
    handleOpenCancel,
    handleConfirmCancel,
  } = useTransactionFilter({ currentCashier });

  if (!store || !rawTransactions) return <TransaksiLoader />;

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    if (statusFilter === "completed") return t.status !== "cancelled";
    if (statusFilter === "cancelled") return t.status === "cancelled";
    return true;
  });

  const completedCount = transactions.filter((t) => t.status !== "cancelled").length;
  const cancelledCount = transactions.filter((t) => t.status === "cancelled").length;

  return (
    <div className="w-full pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
        <div>
          <div className="eyebrow-tag">ARUS KAS & STRUK</div>
          <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight mt-0.5">
            Riwayat Transaksi
          </h1>
          <p className="text-xs text-[var(--color-text-2)] mt-1">
            {transactions.length} total transaksi tercatat ({completedCount} selesai,{" "}
            {cancelledCount} dibatalkan)
          </p>
        </div>

        {/* Filter Status Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full">
          {[
            { key: "all", label: "Semua", count: transactions.length },
            { key: "completed", label: "Selesai", count: completedCount },
            { key: "cancelled", label: "Dibatalkan", count: cancelledCount },
          ].map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.key as any);
                  setPage(1);
                }}
                className={`press-tactile py-1.5 px-3.5 rounded-full text-xs cursor-pointer flex items-center gap-1.5 transition-all border-none ${
                  active
                    ? "bg-[var(--color-brand)] text-white font-extrabold shadow-sm shadow-primary-500/30"
                    : "bg-transparent text-[var(--color-text-2)] font-semibold hover:text-[var(--color-text)]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] py-0.5 px-1.5 rounded-full font-extrabold ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-[var(--color-surface)] text-[var(--color-text-3)]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction Table */}
      <TransactionTable
        transactions={filteredTransactions}
        totalCount={filteredTransactions.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSelect={setSelected}
      />

      {/* Receipt Details Modal */}
      <TransactionDetailModal
        transaction={selected}
        storeName={store.name}
        onClose={() => setSelected(null)}
        onOpenCancel={handleOpenCancel}
      />

      {/* Cancel Confirmation Modal */}
      <TransactionCancelModal
        cancelTarget={cancelTarget}
        onClose={() => setCancelTarget(null)}
        selectedReasonId={selectedReasonId}
        onSelectReasonId={setSelectedReasonId}
        customReasonNote={customReasonNote}
        onCustomReasonNoteChange={setCustomReasonNote}
        cancelling={cancelling}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}

function TransaksiLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <ReceiptIcon
        size={48}
        weight="duotone"
        className="text-[var(--color-brand)] opacity-50 animate-pulse"
      />
      <p className="text-[var(--color-text-2)] text-sm font-bold">Memuat transaksi...</p>
    </div>
  );
}
