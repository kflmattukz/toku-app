import { useState } from "react";
import { Modal } from "#/components/Modal";
import { KasirReceipt } from "./KasirReceipt";
import {
  printReceipt,
  downloadReceiptImage,
  shareReceiptWhatsApp,
} from "#/lib/print";
import {
  PrinterIcon,
  DownloadSimpleIcon,
  WhatsappLogoIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { Button } from "#/components/ui";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  tx: any;
  storeName: string;
  storeAddress?: string;
}

export function ReceiptModal({
  open,
  onClose,
  tx,
  storeName,
  storeAddress,
}: ReceiptModalProps) {
  const [paperWidth, setPaperWidth] = useState<"58mm" | "80mm">("80mm");
  const [isDownloading, setIsDownloading] = useState(false);

  if (!open || !tx) return null;

  const now = new Date(tx.createdAt || Date.now());
  const txId = tx._id
    ? `TX-${String(tx._id).slice(-6).toUpperCase()}`
    : `TX-${now.getTime().toString().slice(-6)}`;

  const handleDownloadImage = async () => {
    setIsDownloading(true);
    try {
      await downloadReceiptImage(
        {
          tx,
          storeName,
          storeAddress,
          paperWidth,
        },
        `struk-${txId}.png`,
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    printReceipt("toku-receipt-content", {
      paperWidth,
      title: `Struk Toku POS - ${txId}`,
    });
  };

  const handleShareWhatsApp = () => {
    shareReceiptWhatsApp(tx, storeName, storeAddress);
  };

  return (
    <Modal onClose={onClose} maxWidth={460}>
      {/* Top Header & Paper Width Toggle */}
      <div className="no-print mb-4 flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div>
          <h2 className="text-sm font-extrabold text-[var(--color-text)]">
            Struk Pembayaran
          </h2>
          <p className="text-[11px] text-[var(--color-text-3)]">
            Cetak, simpan gambar, atau kirim ke pelanggan
          </p>
        </div>

        {/* 58mm / 80mm Switcher */}
        <div className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] p-1">
          <button
            type="button"
            onClick={() => setPaperWidth("58mm")}
            className={`press-tactile cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
              paperWidth === "58mm"
                ? "bg-[var(--color-surface)] text-[var(--color-brand)] shadow-xs"
                : "text-[var(--color-text-3)] hover:text-[var(--color-text)]"
            }`}
          >
            58mm
          </button>
          <button
            type="button"
            onClick={() => setPaperWidth("80mm")}
            className={`press-tactile cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
              paperWidth === "80mm"
                ? "bg-[var(--color-surface)] text-[var(--color-brand)] shadow-xs"
                : "text-[var(--color-text-3)] hover:text-[var(--color-text)]"
            }`}
          >
            80mm
          </button>
        </div>
      </div>

      {/* Rendered Receipt Card (Exact Preview) */}
      <div className="flex justify-center overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3.5 shadow-inner">
        <div id="toku-receipt-content" className="receipt-print w-full flex justify-center">
          <KasirReceipt
            tx={tx}
            storeName={storeName}
            storeAddress={storeAddress}
            paperWidth={paperWidth}
          />
        </div>
      </div>

      {/* Action Buttons Suite */}
      <div className="no-print mt-4.5 flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            leftIcon={<PrinterIcon size={18} weight="bold" />}
            onClick={handlePrint}
          >
            Cetak Struk ({paperWidth})
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            leftIcon={<CheckCircleIcon size={18} weight="bold" />}
            onClick={onClose}
          >
            Selesai Transaksi
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            fullWidth
            loading={isDownloading}
            loadingText="Menyimpan..."
            leftIcon={<DownloadSimpleIcon size={16} weight="bold" />}
            onClick={handleDownloadImage}
          >
            Simpan PNG
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            fullWidth
            leftIcon={<WhatsappLogoIcon size={16} weight="bold" className="text-emerald-600" />}
            onClick={handleShareWhatsApp}
          >
            Kirim WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  );
}
