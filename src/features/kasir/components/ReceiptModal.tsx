import { useState, lazy, Suspense } from "react";
import { Modal } from "#/components/Modal";
import { KasirReceipt } from "./KasirReceipt";
import { printReceipt, downloadReceiptImage, shareReceiptWhatsAppImage } from "#/lib/print";
import {
  PrinterIcon,
  DownloadSimpleIcon,
  WhatsappLogoIcon,
  CheckCircleIcon,
  XIcon,
  BluetoothIcon,
} from "@phosphor-icons/react";
import { Button } from "#/components/ui";

const ThermalPrintDialog = lazy(() =>
  import("#/components/ThermalPrintDialog").then((m) => ({
    default: m.ThermalPrintDialog,
  })),
);

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  tx: any;
  storeName: string;
  storeAddress?: string;
}

export function ReceiptModal({ open, onClose, tx, storeName, storeAddress }: ReceiptModalProps) {
  const [paperWidth, setPaperWidth] = useState<"58mm" | "80mm">("80mm");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showThermalDialog, setShowThermalDialog] = useState(false);

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

  const handleShareWhatsApp = async () => {
    setIsSharing(true);
    try {
      await shareReceiptWhatsAppImage(tx, storeName, storeAddress, paperWidth);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth={460} showCloseButton={false}>
      {/* Top Header, Paper Width Toggle & Close Button */}
      <div className="no-print mb-3.5 flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-extrabold text-[var(--color-text)]">
            Struk Pembayaran
          </h2>
          <p className="truncate text-[11px] text-[var(--color-text-3)]">
            Cetak, simpan gambar, atau kirim ke pelanggan
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
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

          {/* Integrated Close Button (Never overlaps switcher) */}
          <button
            type="button"
            onClick={onClose}
            className="press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]"
            aria-label="Tutup"
          >
            <XIcon size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* Rendered Receipt Card with contained scroll */}
      <div className="custom-scrollbar max-h-[52vh] overflow-x-hidden overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 shadow-inner sm:max-h-[56vh] sm:p-4">
        <div id="toku-receipt-content" className="receipt-print flex w-full justify-center py-1">
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
            leftIcon={<BluetoothIcon size={18} weight="bold" />}
            onClick={() => setShowThermalDialog(true)}
          >
            Cetak Thermal (BT/USB)
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            fullWidth
            leftIcon={<PrinterIcon size={18} weight="bold" />}
            onClick={handlePrint}
          >
            Cetak Biasa ({paperWidth})
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
            loading={isSharing}
            loadingText="Memproses..."
            leftIcon={<WhatsappLogoIcon size={16} weight="bold" className="text-emerald-600" />}
            onClick={handleShareWhatsApp}
          >
            Kirim WhatsApp
          </Button>
        </div>

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

      {showThermalDialog && (
        <Suspense fallback={null}>
          <ThermalPrintDialog
            open={showThermalDialog}
            onClose={() => setShowThermalDialog(false)}
            tx={tx}
            storeName={storeName}
            storeAddress={storeAddress}
            paperWidth={paperWidth}
          />
        </Suspense>
      )}
    </Modal>
  );
}
