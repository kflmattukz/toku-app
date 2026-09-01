import { Modal } from "#/components/Modal";
import { KasirReceipt } from "#/features/kasir";
import { printReceipt } from "#/lib/print";
import { PrinterIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { Button } from "#/components/ui";
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
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            leftIcon={<PrinterIcon size={16} weight="bold" />}
            onClick={() => printReceipt("toku-receipt-content-tx")}
          >
            Cetak Struk
          </Button>
          <Button type="button" variant="secondary" size="md" fullWidth onClick={onClose}>
            Tutup
          </Button>
        </div>

        {/* Cancel Action Button (Only for non-cancelled transactions) */}
        {transaction.status !== "cancelled" && (
          <Button
            type="button"
            variant="danger-subtle"
            shape="rounded"
            size="sm"
            fullWidth
            leftIcon={<ArrowCounterClockwiseIcon size={16} weight="bold" />}
            onClick={() => onOpenCancel(transaction)}
          >
            Batalkan Transaksi / Retur Barang (Kembalikan Stok)
          </Button>
        )}
      </div>
    </Modal>
  );
}
