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

      <div className="no-print mt-5 flex gap-2.5">
        <button
          type="button"
          onClick={() => printReceipt("toku-receipt-content")}
          className="press-tactile shadow-primary-500/20 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--color-brand)] px-4 py-3 text-sm font-extrabold text-white shadow-md"
        >
          <PrinterIcon size={18} weight="bold" />
          <span>Cetak Struk</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="press-tactile flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-sm font-extrabold text-[var(--color-text)]"
        >
          <CheckCircleIcon size={18} weight="bold" />
          <span>Selesai</span>
        </button>
      </div>
    </Modal>
  );
}
