import { Modal } from "#/components/Modal";
import { KasirReceipt } from "#/features/kasir";
import { printReceipt } from "#/lib/print";
import { PrinterIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import type { Transaction } from "../types";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  storeName: string;
  onClose: () => void;
  onOpenCancel: (tx: Transaction) => void;
}

export function TransactionDetailModal({
  transaction,
  storeName,
  onClose,
  onOpenCancel,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <Modal onClose={onClose} maxWidth={440}>
      <div id="toku-receipt-content-tx" className="receipt-print">
        <KasirReceipt tx={transaction} storeName={storeName} />
      </div>

      <div className="no-print mt-5 flex flex-col gap-2.5">
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => printReceipt("toku-receipt-content-tx")}
            className="press-tactile shadow-primary-500/25 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--color-brand)] px-4 py-3 text-xs font-extrabold text-white shadow-md"
          >
            <PrinterIcon size={16} weight="bold" />
            <span>Cetak Struk</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="press-tactile flex-1 cursor-pointer rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-xs font-extrabold text-[var(--color-text)]"
          >
            Tutup
          </button>
        </div>

        {/* Cancel Action Button (Only for non-cancelled transactions) */}
        {transaction.status !== "cancelled" && (
          <button
            type="button"
            onClick={() => onOpenCancel(transaction)}
            className="press-tactile flex cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] px-4 py-2.5 text-xs font-bold text-[var(--color-danger-text)] transition-colors"
          >
            <ArrowCounterClockwiseIcon size={16} weight="bold" />
            <span>Batalkan Transaksi / Retur Barang (Kembalikan Stok)</span>
          </button>
        )}
      </div>
    </Modal>
  );
}
