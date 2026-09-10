import { useState } from "react";
import { Modal } from "#/components/Modal";
import { toast } from "sonner";
import {
  BluetoothIcon,
  UsbIcon,
  CircleNotchIcon,
  PrinterIcon,
  XIcon,
  InfoIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react";
import {
  renderThermalReceipt,
  printViaBluetooth,
  printViaSerial,
  downloadReceiptBin,
  isBluetoothSupported,
  isSerialSupported,
} from "#/lib/thermal-print";

interface ThermalPrintDialogProps {
  open: boolean;
  onClose: () => void;
  tx: any;
  storeName: string;
  storeAddress?: string;
  paperWidth?: "58mm" | "80mm";
}

export function ThermalPrintDialog({
  open,
  onClose,
  tx,
  storeName,
  storeAddress,
  paperWidth = "80mm",
}: ThermalPrintDialogProps) {
  const [loadingMode, setLoadingMode] = useState<"bluetooth" | "serial" | null>(null);

  if (!open || !tx) return null;

  const hasBluetooth = isBluetoothSupported();
  const hasSerial = isSerialSupported();

  const handlePrintBluetooth = async () => {
    setLoadingMode("bluetooth");
    const toastId = toast.loading("Menghubungkan ke printer Bluetooth...");

    try {
      const data = await renderThermalReceipt({
        tx,
        storeName,
        storeAddress,
        paperWidth,
      });

      await printViaBluetooth(data);
      toast.dismiss(toastId);
      toast.success("Struk berhasil dikirim ke printer Bluetooth!");
      onClose();
    } catch (err: any) {
      toast.dismiss(toastId);
      if (err?.name === "NotFoundError" || err?.message?.includes("cancelled")) {
        // User cancelled picker dialog
        return;
      }
      console.error(err);
      toast.error("Gagal mencetak Bluetooth", {
        description: err?.message || "Pastikan printer menyala dan Bluetooth aktif.",
      });
    } finally {
      setLoadingMode(null);
    }
  };

  const handlePrintSerial = async () => {
    setLoadingMode("serial");
    const toastId = toast.loading("Menghubungkan ke printer USB/Serial...");

    try {
      const data = await renderThermalReceipt({
        tx,
        storeName,
        storeAddress,
        paperWidth,
      });

      await printViaSerial(data);
      toast.dismiss(toastId);
      toast.success("Struk berhasil dicetak via USB!");
      onClose();
    } catch (err: any) {
      toast.dismiss(toastId);
      if (err?.name === "NotFoundError" || err?.message?.includes("cancelled")) {
        // User cancelled port selection
        return;
      }
      console.error(err);
      toast.error("Gagal mencetak USB", {
        description: err?.message || "Pastikan kabel USB terhubung dengan baik.",
      });
    } finally {
      setLoadingMode(null);
    }
  };

  const handleDownloadBin = async () => {
    try {
      const data = await renderThermalReceipt({
        tx,
        storeName,
        storeAddress,
        paperWidth,
      });
      const txId = tx._id
        ? String(tx._id).slice(-6).toUpperCase()
        : Date.now().toString().slice(-6);
      downloadReceiptBin(data, `struk-escpos-${txId}.bin`);
      toast.success("File binary ESC/POS berhasil diunduh!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat file struk binary.");
    }
  };

  return (
    <Modal onClose={onClose} maxWidth={420} showCloseButton={false}>
      <div className="flex flex-col gap-4 select-none">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
              <PrinterIcon size={20} weight="duotone" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[var(--color-text)]">
                Cetak Thermal Langsung (ESC/POS)
              </h2>
              <p className="text-[11px] text-[var(--color-text-3)]">
                Kirim data cetak instan tanpa dialog browser ({paperWidth})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="press-tactile flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]"
          >
            <XIcon size={14} weight="bold" />
          </button>
        </div>

        {/* Browser Warning if not Chrome/Edge */}
        {!hasBluetooth && !hasSerial && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-300/60 bg-amber-50/80 p-3 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <InfoIcon size={18} weight="fill" className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              Fitur Web Bluetooth & Web Serial memerlukan browser <strong>Google Chrome</strong>{" "}
              atau <strong>Microsoft Edge</strong>. Pada browser lain, gunakan tombol Cetak Biasa.
            </div>
          </div>
        )}

        {/* Connection Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Bluetooth Card Button */}
          <button
            type="button"
            disabled={!hasBluetooth || loadingMode !== null}
            onClick={handlePrintBluetooth}
            className="press-tactile group flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3.5 text-left transition-all hover:border-orange-500/60 hover:bg-[var(--color-surface-3)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                {loadingMode === "bluetooth" ? (
                  <CircleNotchIcon size={20} weight="bold" className="animate-spin" />
                ) : (
                  <BluetoothIcon size={20} weight="duotone" />
                )}
              </div>
              <div>
                <div className="text-xs font-black text-[var(--color-text)]">
                  Printer Bluetooth (Nirkabel)
                </div>
                <div className="text-[11px] text-[var(--color-text-3)]">
                  Cocok untuk mini thermal printer 58mm / 80mm portabel
                </div>
              </div>
            </div>
            <span className="ml-2 shrink-0 text-[10px] font-bold text-[var(--color-brand)]">
              Sambungkan →
            </span>
          </button>

          {/* USB / Serial Card Button */}
          <button
            type="button"
            disabled={!hasSerial || loadingMode !== null}
            onClick={handlePrintSerial}
            className="press-tactile group flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3.5 text-left transition-all hover:border-orange-500/60 hover:bg-[var(--color-surface-3)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                {loadingMode === "serial" ? (
                  <CircleNotchIcon size={20} weight="bold" className="animate-spin" />
                ) : (
                  <UsbIcon size={20} weight="duotone" />
                )}
              </div>
              <div>
                <div className="text-xs font-black text-[var(--color-text)]">
                  Printer USB / Kabel Serial
                </div>
                <div className="text-[11px] text-[var(--color-text-3)]">
                  Untuk desktop POS printer kabel USB (Epson, Xprinter, dll)
                </div>
              </div>
            </div>
            <span className="ml-2 shrink-0 text-[10px] font-bold text-[var(--color-brand)]">
              Pilih Port →
            </span>
          </button>
        </div>

        {/* Fallback download link */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--color-text-3)]">
          <span>Format universal Epson ESC/POS</span>
          <button
            type="button"
            onClick={handleDownloadBin}
            className="inline-flex cursor-pointer items-center gap-1 font-bold text-[var(--color-text-2)] transition-colors hover:text-[var(--color-brand)]"
          >
            <DownloadSimpleIcon size={12} weight="bold" />
            <span>Unduh File .bin</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
