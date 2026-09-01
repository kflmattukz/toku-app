import { Modal } from "#/components/Modal";
import { KasirReceipt } from "./KasirReceipt";
import { printReceipt } from "#/lib/print";
import { PrinterIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { Button } from "#/components/ui";

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

      <div className="no-print mt-5 grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="primary"
          size="md"
          fullWidth
          leftIcon={<PrinterIcon size={18} weight="bold" />}
          onClick={() => printReceipt("toku-receipt-content")}
        >
          Cetak Struk
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="md"
          fullWidth
          leftIcon={<CheckCircleIcon size={18} weight="bold" />}
          onClick={onClose}
        >
          Selesai
        </Button>
      </div>
    </Modal>
  );
}
