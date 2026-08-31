import { Modal } from "#/components/Modal";
import { KasirReceipt } from "./KasirReceipt";
import { printReceipt } from "#/lib/print";
import { PrinterIcon, CheckCircleIcon } from "@phosphor-icons/react";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  tx: any;
  storeName: string;
}

export function ReceiptModal({ open, onClose, tx, storeName }: ReceiptModalProps) {
  if (!open || !tx) return null;

  return (
    <Modal onClose={onClose} maxWidth={440}>
      <div id="toku-receipt-content" className="receipt-print">
        <KasirReceipt tx={tx} storeName={storeName} />
      </div>

      <div className="no-print flex gap-2.5 mt-5">
        <button
          type="button"
          onClick={() => printReceipt("toku-receipt-content")}
          className="press-tactile flex-1 py-3 px-4 rounded-full bg-[var(--color-brand)] text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary-500/20"
        >
          <PrinterIcon size={18} weight="bold" />
          <span>Cetak Struk</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="press-tactile flex-1 py-3 px-4 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircleIcon size={18} weight="bold" />
          <span>Selesai</span>
        </button>
      </div>
    </Modal>
  );
}
