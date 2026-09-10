import { useState, useRef, useEffect } from "react";
import { Modal } from "#/components/Modal";
import { Button } from "#/components/ui";
import { toast } from "sonner";
import { formatIDR } from "#/lib/utils";
import {
  FilePdfIcon,
  FileXlsIcon,
  CopyIcon,
  PrinterIcon,
  ArrowSquareOutIcon,
  ArrowLeftIcon,
  ReceiptIcon,
  CheckIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  exportToExcel,
  copyToGoogleSheets,
  printReportA4,
  type ReportExportData,
} from "../lib/report-export";
import { PrintableReport } from "./PrintableReport";

interface ExportReportModalProps {
  open: boolean;
  onClose: () => void;
  data: ReportExportData;
}

export function ExportReportModal({ open, onClose, data }: ExportReportModalProps) {
  const [includeTransactions, setIncludeTransactions] = useState(true);
  const [viewMode, setViewMode] = useState<"options" | "preview">("options");
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const hiddenPrintRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [zoomMode, setZoomMode] = useState<"fit" | "100%">("fit");
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState<number | null>(null);

  useEffect(() => {
    if (viewMode !== "preview") return;

    const updateDimensions = () => {
      if (!containerRef.current) return;
      const containerW = containerRef.current.clientWidth;
      const h = measureRef.current?.offsetHeight ?? null;
      if (h) setContentHeight(h);

      if (zoomMode === "fit") {
        const padding = containerW < 640 ? 12 : 24;
        const availableW = Math.max(260, containerW - padding);
        const targetW = 800;
        if (availableW < targetW) {
          setScale(Math.max(0.3, Math.min(1, availableW / targetW)));
        } else {
          setScale(1);
        }
      } else {
        setScale(1);
      }
    };

    updateDimensions();

    const ro = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) ro.observe(containerRef.current);
    if (measureRef.current) ro.observe(measureRef.current);

    return () => {
      ro.disconnect();
    };
  }, [viewMode, zoomMode, includeTransactions, data]);

  if (!open) return null;

  const handleClose = () => {
    setViewMode("options");
    onClose();
  };

  const handleDownloadExcel = () => {
    try {
      exportToExcel(data, includeTransactions);
      toast.success("File Excel berhasil diunduh!", {
        description: "File .xlsx siap dibuka di Microsoft Excel atau Google Drive.",
      });
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat file Excel. Silakan coba lagi.");
    }
  };

  const handleCopyGoogleSheets = async () => {
    const success = await copyToGoogleSheets(data);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      toast.success("Data berhasil disalin!", {
        description: "Buka Google Sheets baru dan tekan Ctrl+V (atau Cmd+V) untuk menempel tabel.",
      });
    } else {
      toast.error("Gagal menyalin data ke clipboard.");
    }
  };

  const handlePrintPdf = () => {
    const targetEl = viewMode === "preview" ? printRef.current : hiddenPrintRef.current;
    if (targetEl) {
      const now = new Date();
      const exportDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const title = `Toku POS - ${data.storeName} - ${exportDate}`;
      printReportA4(targetEl, title);
    } else {
      toast.error("Gagal memuat dokumen laporan untuk dicetak.");
    }
  };

  return (
    <>
      {/* Hidden container for direct A4 print if user prints without opening preview */}
      <div className="hidden" aria-hidden="true">
        <PrintableReport
          ref={hiddenPrintRef}
          data={data}
          includeTransactions={includeTransactions}
        />
      </div>

      <Modal
        onClose={handleClose}
        maxWidth={viewMode === "preview" ? 940 : 640}
        showCloseButton={false}
      >
        {viewMode === "options" ? (
          <div className="flex flex-col gap-5 select-none">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-orange-100 dark:bg-orange-950/40 px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--color-brand)]">
                    Export Laporan
                  </span>
                  <span className="text-xs font-semibold text-[var(--color-text-3)]">
                    {data.storeName}
                  </span>
                </div>
                <h2 className="mt-1 text-xl font-black text-[var(--color-text)] tracking-tight">
                  Download / Cetak Laporan Keuangan
                </h2>
                <p className="mt-0.5 text-xs text-[var(--color-text-2)] leading-relaxed">
                  Pilih format laporan yang Anda butuhkan. Disusun dengan bahasa awam yang jelas dan
                  analisa keuntungan riil toko Anda.
                </p>
              </div>

              {/* Integrated Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="press-tactile flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)] transition-colors"
                aria-label="Tutup"
              >
                <XIcon size={16} weight="bold" />
              </button>
            </div>

            {/* Quick Summary Pill Banner */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand)] text-white shadow-xs">
                  <ReceiptIcon size={20} weight="bold" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[var(--color-text-3)] uppercase tracking-wider">
                    Periode Laporan
                  </div>
                  <div className="text-sm font-extrabold text-[var(--color-text)]">
                    {data.dateLabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-[var(--color-text-3)] uppercase">
                    Total Omset
                  </div>
                  <div className="text-xs font-black font-mono text-[var(--color-text)]">
                    {formatIDR(data.totalRevenue)}
                  </div>
                </div>
                <div className="h-7 w-[1px] bg-[var(--color-border)]" />
                <div className="text-right">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">
                    Cuan Bersih
                  </div>
                  <div className="text-xs font-black font-mono text-emerald-700">
                    {formatIDR(data.netProfit)}
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Details Checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-2.5 hover:bg-[var(--color-surface-2)] transition-colors">
              <input
                type="checkbox"
                checked={includeTransactions}
                onChange={(e) => setIncludeTransactions(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]"
              />
              <div className="text-xs">
                <span className="font-extrabold text-[var(--color-text)]">
                  Sertakan Rincian Buku Transaksi Kasir
                </span>
                <span className="text-[var(--color-text-3)] ml-1">
                  ({data.transactions.length} transaksi)
                </span>
              </div>
            </label>

            {/* 3 Main Action Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Card 1: PDF */}
              <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs transition-all hover:border-orange-500/50 hover:shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
                      <FilePdfIcon size={24} weight="duotone" />
                    </div>
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-black text-rose-700 border border-rose-200">
                      Cetak / A4
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[var(--color-text)] m-0">
                    Dokumen PDF
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-2)]">
                    Format cetak resmi A4 atau simpan sebagai file PDF. Lengkap dengan analisa
                    kesehatan toko.
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-1.5">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    fullWidth
                    leftIcon={<PrinterIcon size={14} weight="bold" />}
                    onClick={() => setViewMode("preview")}
                  >
                    Pratinjau & Cetak
                  </Button>
                  <button
                    type="button"
                    onClick={handlePrintPdf}
                    className="inline-flex items-center justify-center gap-1 text-[10px] font-bold text-[var(--color-text-3)] hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <span>Cetak Langsung (A4)</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Excel */}
              <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                      <FileXlsIcon size={24} weight="duotone" />
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-700 border border-emerald-200">
                      .XLSX Multi-Tab
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[var(--color-text)] m-0">
                    Microsoft Excel
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-2)]">
                    File Excel lengkap dengan tab terpisah untuk Ringkasan Cuan, Produk, dan Buku
                    Transaksi.
                  </p>
                </div>

                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    fullWidth
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                    leftIcon={<FileXlsIcon size={14} weight="bold" />}
                    onClick={handleDownloadExcel}
                  >
                    Download .xlsx
                  </Button>
                </div>
              </div>

              {/* Card 3: Google Sheets */}
              <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                      <CopyIcon size={24} weight="duotone" />
                    </div>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black text-blue-700 border border-blue-200">
                      1-Klik Salin
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-[var(--color-text)] m-0">
                    Google Sheets
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-2)]">
                    Salin seluruh tabel data keuangan dalam satu klik, lalu tekan Paste (Ctrl+V) di
                    Google Sheets Anda.
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    fullWidth
                    className="border-blue-600 text-blue-700 hover:bg-blue-50"
                    leftIcon={
                      copied ? (
                        <CheckIcon size={14} weight="bold" />
                      ) : (
                        <CopyIcon size={14} weight="bold" />
                      )
                    }
                    onClick={handleCopyGoogleSheets}
                  >
                    {copied ? "Tersalin!" : "Salin Tabel Data"}
                  </Button>
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1 text-[10px] font-bold text-[var(--color-text-3)] hover:text-blue-600"
                  >
                    <span>Buka Google Sheets Baru</span>
                    <ArrowSquareOutIcon size={10} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* View Mode: Print & PDF Preview */
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Preview Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[var(--color-border)] pb-3">
              {/* Left: Back button & Document context badge */}
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => setViewMode("options")}
                  className="press-tactile inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)] transition-all shrink-0"
                >
                  <ArrowLeftIcon size={14} weight="bold" />
                  <span className="hidden xs:inline">Kembali</span>
                </button>
                <div className="hidden md:flex items-center gap-2 text-xs">
                  <span className="text-[var(--color-text-3)]">/</span>
                  <span className="font-extrabold text-[var(--color-text)] truncate">
                    Pratinjau Lembar A4
                  </span>
                  <span className="rounded-md bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                    {data.dateLabel}
                  </span>
                </div>
              </div>

              {/* Right: Zoom controls, Print / Save PDF Button & Integrated Close Button */}
              <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto sm:ml-0">
                {/* Zoom Switcher Pill */}
                <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setZoomMode("fit")}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      zoomMode === "fit"
                        ? "bg-[var(--color-surface)] text-[var(--color-brand)] shadow-xs font-black"
                        : "text-[var(--color-text-3)] hover:text-[var(--color-text)]"
                    }`}
                    title="Sesuaikan ukuran dokumen dengan layar (Fit)"
                  >
                    Fit Layar
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomMode("100%")}
                    className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      zoomMode === "100%"
                        ? "bg-[var(--color-surface)] text-[var(--color-brand)] shadow-xs font-black"
                        : "text-[var(--color-text-3)] hover:text-[var(--color-text)]"
                    }`}
                    title="Lihat ukuran asli 100% A4"
                  >
                    100%
                  </button>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  leftIcon={<PrinterIcon size={16} weight="bold" />}
                  onClick={handlePrintPdf}
                  className="shadow-sm font-extrabold text-xs px-2.5 sm:px-3"
                >
                  <span className="hidden sm:inline">Cetak / </span>Simpan PDF
                </Button>

                <div className="h-5 w-px bg-[var(--color-border)] mx-0.5 hidden sm:block" />

                <button
                  type="button"
                  onClick={handleClose}
                  className="press-tactile flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)] transition-colors"
                  aria-label="Tutup"
                  title="Tutup Pratinjau"
                >
                  <XIcon size={16} weight="bold" />
                </button>
              </div>
            </div>

            {/* Scrollable Document Container & Adaptive Scaled Canvas */}
            <div
              ref={containerRef}
              className="custom-scrollbar max-h-[70vh] sm:max-h-[74vh] overflow-auto rounded-2xl border border-[var(--color-border)] bg-neutral-200/80 dark:bg-neutral-900/80 p-2 sm:p-5 shadow-inner touch-pan-x touch-pan-y"
            >
              <div
                style={{
                  width: `${800 * scale}px`,
                  minHeight: contentHeight ? `${contentHeight * scale}px` : "auto",
                  margin: "0 auto",
                  transition: "width 0.2s ease, min-height 0.2s ease",
                }}
              >
                <div
                  ref={measureRef}
                  style={{
                    width: "800px",
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    transition: "transform 0.2s ease",
                  }}
                  className="rounded-xl shadow-2xl overflow-hidden border border-neutral-300/60 bg-white"
                >
                  <PrintableReport
                    ref={printRef}
                    data={data}
                    includeTransactions={includeTransactions}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Responsive Meta / Guidance Bar */}
            <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--color-text-3)] px-1">
              <span className="sm:hidden flex items-center gap-1 truncate">
                {zoomMode === "fit" ? (
                  <>
                    💡 Fit layar aktif · Pilih <strong>100%</strong> untuk zoom detail teks.
                  </>
                ) : (
                  <>👆 Geser kanan/kiri untuk membaca tabel secara menyeluruh.</>
                )}
              </span>
              <span className="hidden sm:inline text-xs text-[var(--color-text-2)]">
                Format resmi A4 Portrait (210mm × 297mm) · Hasil cetak identik 100% dengan lembar
                ini.
              </span>
              <span className="text-[11px] font-semibold text-[var(--color-text-3)] shrink-0 ml-auto">
                Skala: {Math.round(scale * 100)}%
              </span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
