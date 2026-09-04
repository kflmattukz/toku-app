import { useState } from "react";
import { Modal } from "#/components/Modal";
import { KasirReceipt } from "#/features/kasir";
import {
  printReceipt,
  downloadReceiptImage,
  shareReceiptWhatsApp,
} from "#/lib/print";
import {
  PrinterIcon,
  DownloadSimpleIcon,
  WhatsappLogoIcon,
  ArrowCounterClockwiseIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button } from "#/components/ui";
import type { Transaction } from "../types";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  storeName: string;
  storeAddress?: string;
  onClose: () => void;
  onOpenCancel: (tx: Transaction) => void;
}

export function TransactionDetailModal({
  transaction,
  storeName,
  storeAddress,
  onClose,
  onOpenCancel,
}: TransactionDetailModalProps) {
  const [paperWidth, setPaperWidth] = useState<"58mm" | "80mm">("80mm");
  const [isDownloading, setIsDownloading] = useState(false);

  if (!transaction) return null;

  const now = new Date(transaction.createdAt || Date.now());
  const txId = transaction._id
    ? `TX-${String(transaction._id).slice(-6).toUpperCase()}`
    : `TX-${now.getTime().toString().slice(-6)}`;

  const handleDownloadImage = async () => {
    setIsDownloading(true);
    try {
      await downloadReceiptImage(
        {
          tx: transaction,
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
    printReceipt("toku-receipt-content-tx", {
      paperWidth,
      title: `Struk Toku POS - ${txId}`,
    });
  };

  const handleShareWhatsApp = () => {
    shareReceiptWhatsApp(transaction, storeName, storeAddress);
  };

  return (
    <Modal onClose={onClose} maxWidth={460} showCloseButton={false}>
      {/* Header, Paper Switcher & Close Button */}
      <div className="no-print mb-3.5 flex items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-extrabold text-[var(--color-text)]">
            Rincian Transaksi
          </h2>
          <p className="truncate text-[11px] text-[var(--color-text-3)]">
            #{txId} · {transaction.status === "cancelled" ? "Dibatalkan" : "Selesai"}
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

      {/* Rendered Receipt with contained scroll */}
      <div className="custom-scrollbar max-h-[52vh] sm:max-h-[56vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 sm:p-4 shadow-inner">
        <div id="toku-receipt-content-tx" className="receipt-print flex w-full justify-center py-1">
          <KasirReceipt
            tx={transaction}
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
            onClick={onClose}
          >
            Tutup
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
