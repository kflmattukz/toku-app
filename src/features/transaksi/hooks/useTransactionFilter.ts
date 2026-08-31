import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CANCEL_REASONS, type Transaction } from "../types";
import type { ActiveCashier } from "#/lib/store-context";

interface UseTransactionFilterProps {
  currentCashier: ActiveCashier | null;
}

export function useTransactionFilter({ currentCashier }: UseTransactionFilterProps) {
  const cancelTxMutation = useMutation(api.transactions.cancel);

  const [selected, setSelected] = useState<Transaction | null>(null);
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "cancelled">("all");

  // Cancel Modal State
  const [cancelTarget, setCancelTarget] = useState<Transaction | null>(null);
  const [selectedReasonId, setSelectedReasonId] = useState<string>("retur_barang");
  const [customReasonNote, setCustomReasonNote] = useState<string>("");
  const [cancelling, setCancelling] = useState(false);

  const handleOpenCancel = (tx: Transaction) => {
    setCancelTarget(tx);
    setSelectedReasonId("retur_barang");
    setCustomReasonNote("");
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    const reasonObj = CANCEL_REASONS.find((r) => r.id === selectedReasonId);
    let finalReason = reasonObj?.label || "Pembatalan pesanan";
    if (customReasonNote.trim()) {
      finalReason += ` — ${customReasonNote.trim()}`;
    }

    try {
      setCancelling(true);
      await cancelTxMutation({
        id: cancelTarget._id,
        reason: finalReason,
        cancelledBy: currentCashier?.name || "Kasir",
      });
      toast.success("Transaksi berhasil dibatalkan!", {
        description: "Stok produk telah dikembalikan otomatis ke inventaris toko.",
      });
      setCancelTarget(null);
      if (selected && selected._id === cancelTarget._id) {
        setSelected({
          ...selected,
          status: "cancelled",
          cancelledAt: Date.now(),
          cancelReason: finalReason,
          cancelledBy: currentCashier?.name || "Kasir",
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal membatalkan transaksi.");
    } finally {
      setCancelling(false);
    }
  };

  return {
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
  };
}
