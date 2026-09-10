import { useState } from "react";
import { Modal } from "#/components/Modal";
import { Button } from "#/components/ui";
import { toast } from "sonner";
import { formatIDR } from "#/lib/utils";
import {
  FilePdfIcon,
  FileXlsIcon,
  CopyIcon,
  DownloadSimpleIcon,
  EyeIcon,
  ArrowSquareOutIcon,
  ArrowLeftIcon,
  ReceiptIcon,
  CheckIcon,
  XIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
import {
  exportToExcel,
  copyToGoogleSheets,
  downloadReportPdf,
  type ReportExportData,
} from "../lib/report-export";
import { PDFViewer } from "@react-pdf/renderer";
import { ReportPdfDocument } from "./ReportPdfDocument";

interface ExportReportModalProps {
  open: boolean;
  onClose: () => void;
  data: ReportExportData;
}

export function ExportReportModal({ open, onClose, data }: ExportReportModalProps) {
  const [includeTransactions, setIncludeTransactions] = useState(true);
  const [viewMode, setViewMode] = useState<"options" | "preview">("options");
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await downloadReportPdf(data, includeTransactions);
      toast.success("File PDF berhasil diunduh!", {
        description: "File .pdf resmi A4 tersimpan di perangkat Anda.",
      });
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat file PDF. Silakan coba lagi.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Modal
      onClose={handleClose}
      maxWidth={viewMode === "preview" ? 960 : 640}
      showCloseButton={false}
    >
      {viewMode === "options" ? (
        <div className="flex flex-col gap-5 select-none">
          {/* Modal Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--color-brand)] dark:bg-orange-950/40">
                  Export Laporan
                </span>
                <span className="text-xs font-semibold text-[var(--color-text-3)]">
                  {data.storeName}
                </span>
              </div>
              <h2 className="mt-1 text-xl font-black tracking-tight text-[var(--color-text)]">
                Download / Cetak Laporan Keuangan
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-2)]">
                Pilih format laporan yang Anda butuhkan. Disusun dengan bahasa awam yang jelas dan
                analisa keuntungan riil toko Anda.
              </p>
            </div>

            {/* Integrated Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="press-tactile flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)] transition-colors hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]"
              aria-label="Tutup"
            >
              <XIcon size={16} weight="bold" />
            </button>
          </div>

          {/* Quick Summary Pill Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand)] text-white shadow-xs">
                <ReceiptIcon size={20} weight="bold" />
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-wider text-[var(--color-text-3)] uppercase">
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
                <div className="font-mono text-xs font-black text-[var(--color-text)]">
                  {formatIDR(data.totalRevenue)}
                </div>
              </div>
              <div className="h-7 w-[1px] bg-[var(--color-border)]" />
              <div className="text-right">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Cuan Bersih</div>
                <div className="font-mono text-xs font-black text-emerald-700">
                  {formatIDR(data.netProfit)}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details Checkbox */}
          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-2.5 transition-colors hover:bg-[var(--color-surface-2)]">
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
              <span className="ml-1 text-[var(--color-text-3)]">
                ({data.transactions.length} transaksi)
              </span>
            </div>
          </label>

          {/* 3 Main Action Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Card 1: PDF */}
            <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs transition-all hover:border-orange-500/50 hover:shadow-sm">
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
                    <FilePdfIcon size={24} weight="duotone" />
                  </div>
                  <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9px] font-black text-rose-700">
                    Vector .PDF
                  </span>
                </div>
                <h3 className="m-0 text-sm font-extrabold text-[var(--color-text)]">Dokumen PDF</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-text-2)]">
                  Format dokumen resmi A4 berkualitas tinggi. Lengkap dengan analisa kesehatan dan
                  tabel keuangan toko.
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-1.5">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  fullWidth
                  disabled={isGeneratingPdf}
                  leftIcon={
                    isGeneratingPdf ? (
                      <CircleNotchIcon size={14} weight="bold" className="animate-spin" />
                    ) : (
                      <DownloadSimpleIcon size={14} weight="bold" />
                    )
                  }
                  onClick={handleDownloadPdf}
                >
                  {isGeneratingPdf ? "Menyiapkan PDF..." : "Download .PDF"}
                </Button>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className="inline-flex cursor-pointer items-center justify-center gap-1 py-0.5 text-[11px] font-bold text-[var(--color-text-3)] transition-colors hover:text-orange-600"
                >
                  <EyeIcon size={12} weight="bold" />
                  <span>Buka Pratinjau PDF</span>
                </button>
              </div>
            </div>

            {/* Card 2: Excel */}
            <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs transition-all hover:border-emerald-500/50 hover:shadow-sm">
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <FileXlsIcon size={24} weight="duotone" />
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-700">
                    .XLSX Multi-Tab
                  </span>
                </div>
                <h3 className="m-0 text-sm font-extrabold text-[var(--color-text)]">
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
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                    <CopyIcon size={24} weight="duotone" />
                  </div>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[9px] font-black text-blue-700">
                    1-Klik Salin
                  </span>
                </div>
                <h3 className="m-0 text-sm font-extrabold text-[var(--color-text)]">
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
        /* View Mode: React-PDF In-Modal Preview */
        <div className="flex flex-col gap-3 select-none sm:gap-4">
          {/* Preview Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[var(--color-border)] pb-3">
            {/* Left: Back button & Document context badge */}
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("options")}
                className="press-tactile inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-text-2)] transition-all hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)] sm:px-3"
              >
                <ArrowLeftIcon size={14} weight="bold" />
                <span className="xs:inline hidden">Kembali</span>
              </button>
              <div className="hidden items-center gap-2 text-xs md:flex">
                <span className="text-[var(--color-text-3)]">/</span>
                <span className="truncate font-extrabold text-[var(--color-text)]">
                  Pratinjau Dokumen PDF
                </span>
                <span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                  {data.dateLabel}
                </span>
              </div>
            </div>

            {/* Right: Download PDF & Integrated Close Button */}
            <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0 sm:gap-2.5">
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isGeneratingPdf}
                leftIcon={
                  isGeneratingPdf ? (
                    <CircleNotchIcon size={16} weight="bold" className="animate-spin" />
                  ) : (
                    <DownloadSimpleIcon size={16} weight="bold" />
                  )
                }
                onClick={handleDownloadPdf}
                className="px-2.5 text-xs font-extrabold shadow-sm sm:px-3"
              >
                {isGeneratingPdf ? "Menyiapkan..." : "Download .PDF"}
              </Button>

              <div className="mx-0.5 hidden h-5 w-px bg-[var(--color-border)] sm:block" />

              <button
                type="button"
                onClick={handleClose}
                className="press-tactile flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)] transition-colors hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]"
                aria-label="Tutup"
                title="Tutup Pratinjau"
              >
                <XIcon size={16} weight="bold" />
              </button>
            </div>
          </div>

          {/* Embedded React-PDF Native Viewer */}
          <div className="h-[68vh] w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-neutral-900 shadow-inner sm:h-[72vh]">
            <PDFViewer
              width="100%"
              height="100%"
              style={{ width: "100%", height: "100%", border: "none" }}
            >
              <ReportPdfDocument data={data} includeTransactions={includeTransactions} />
            </PDFViewer>
          </div>

          {/* Bottom Responsive Meta / Guidance Bar */}
          <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-[var(--color-text-3)]">
            <span className="text-xs text-[var(--color-text-2)]">
              Dokumen A4 Portrait resmi. Anda juga dapat menggunakan kontrol print/zoom langsung di
              dalam penampil PDF di atas.
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}
