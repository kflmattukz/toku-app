import * as XLSX from "xlsx";
import { formatIDR } from "#/lib/utils";
import type { Range, TopProduct } from "../types";

export interface ReportExportData {
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  range: Range;
  dateLabel: string;
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMargin: number;
  totalExpenses: number;
  netProfit: number;
  netMargin: number;
  totalTransactions: number;
  totalItems: number;
  cancelledCount: number;
  cancelledTotal: number;
  topProducts: TopProduct[];
  transactions: any[];
}

export function getLaymanHealthDiagnosis(
  totalRevenue: number,
  netProfit: number,
  netMargin: number,
): { title: string; text: string; isHealthy: boolean } {
  if (totalRevenue === 0) {
    return {
      title: "Belum Ada Transaksi",
      text: "Belum ada penjualan tercatat pada periode ini. Mulai catat penjualan di menu Kasir.",
      isHealthy: false,
    };
  }

  if (netProfit > 0) {
    const profitPer100k = Math.round((netMargin / 100) * 100000);
    return {
      title: "Kondisi Toko: Sehat & Cuan! 🎉",
      text: `Bisnis Anda menghasilkan keuntungan bersih sebesar ${formatIDR(netProfit)} (Margin Bersih ${netMargin.toFixed(1)}%). Artinya, dari setiap Rp 100.000 penjualan, sekitar ${formatIDR(profitPer100k)} adalah uang bersih yang murni masuk ke kantong Anda setelah dipotong modal barang dan biaya operasional.`,
      isHealthy: true,
    };
  } else if (netProfit === 0) {
    return {
      title: "Kondisi Toko: Balik Modal (Impas) ⚖️",
      text: `Pendapatan toko pas menutupi seluruh modal barang dan biaya operasional. Anda tidak merugi, namun belum menghasilkan cuan bersih pada periode ini.`,
      isHealthy: false,
    };
  } else {
    return {
      title: "Kondisi Toko: Perhatian! Pengeluaran Melebihi Pemasukan ⚠️",
      text: `Periode ini toko mengalami defisit sebesar ${formatIDR(Math.abs(netProfit))}. Evaluasi kembali biaya operasional harian Anda atau pertimbangkan menaikkan margin produk.`,
      isHealthy: false,
    };
  }
}

export function exportToExcel(data: ReportExportData, includeTransactions: boolean = true) {
  const wb = XLSX.utils.book_new();
  const diagnosis = getLaymanHealthDiagnosis(data.totalRevenue, data.netProfit, data.netMargin);

  // 1. Sheet 1: Ringkasan Keuangan (Financial Summary)
  const summaryRows = [
    ["LAPORAN KEUANGAN & LABA BERSIH TOKO"],
    ["Toku POS - Sahabat Usaha Anda"],
    [],
    ["Nama Toko", data.storeName],
    ["Alamat", data.storeAddress || "-"],
    ["Telepon", data.storePhone || "-"],
    ["Periode Laporan", data.dateLabel],
    ["Waktu Cetak", new Date().toLocaleString("id-ID")],
    [],
    ["STATUS KESEHATAN TOKO"],
    ["Kondisi", diagnosis.title],
    ["Penjelasan", diagnosis.text],
    [],
    ["PERJALANAN CUAN TOKO (LABA RUGI SEDERHANA)"],
    ["Komponen", "Nilai (Rp)", "Keterangan Awam"],
    [
      "1. Uang Masuk Penjualan (Omset Kotor)",
      data.totalRevenue,
      "Total seluruh uang yang dibayarkan pelanggan",
    ],
    [
      "2. Modal Barang Kulakan (HPP)",
      data.totalCogs,
      "Modal awal yang Anda keluarkan untuk barang yang laku",
    ],
    [
      "3. Untung Kotor Toko",
      data.grossProfit,
      `Selisih harga jual dikurangi modal barang (Margin ${data.grossMargin.toFixed(1)}%)`,
    ],
    [
      "4. Biaya Operasional Toko",
      data.totalExpenses,
      "Pengeluaran listrik, sewa, gaji, plastik, pulsa, dll",
    ],
    [
      "5. CUAN BERSIH AKHIR (Laba Bersih)",
      data.netProfit,
      `Uang murni yang masuk kantong Anda (Margin Bersih ${data.netMargin.toFixed(1)}%)`,
    ],
    [],
    ["RINGKASAN OPERASIONAL"],
    ["Total Transaksi Sukses", data.totalTransactions],
    ["Total Barang Terjual (pcs)", data.totalItems],
    [
      "Transaksi Dibatalkan",
      `${data.cancelledCount} transaksi (${formatIDR(data.cancelledTotal)})`,
    ],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 38 }, { wch: 28 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan_Keuangan");

  // 2. Sheet 2: Produk Terlaris & Profit (Product Performance)
  const sortedProducts = [...data.topProducts].sort((a, b) => b.totalRevenue - a.totalRevenue);
  const productRows: (string | number)[][] = [
    ["PERFORMA & KEUNTUNGAN PER PRODUK"],
    ["Periode: " + data.dateLabel],
    [],
    [
      "Peringkat",
      "Nama Produk",
      "Terjual (pcs)",
      "Total Omset (Rp)",
      "Total Modal HPP (Rp)",
      "Cuan Bersih (Rp)",
      "Kontribusi Profit (%)",
    ],
  ];

  sortedProducts.forEach((p, idx) => {
    const marginPct =
      p.totalRevenue > 0 ? ((p.totalProfit / p.totalRevenue) * 100).toFixed(1) : "0";
    productRows.push([
      `#${idx + 1}`,
      p.name,
      p.totalQty,
      p.totalRevenue,
      p.totalCost,
      p.totalProfit,
      `${marginPct}%`,
    ]);
  });

  const wsProducts = XLSX.utils.aoa_to_sheet(productRows);
  wsProducts["!cols"] = [
    { wch: 10 },
    { wch: 30 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsProducts, "Produk_Terlaris");

  // 3. Sheet 3: Daftar Transaksi (Transaction History)
  if (includeTransactions && data.transactions.length > 0) {
    const txRows = [
      ["RIWAYAT BUKU TRANSAKSI LENGKAP"],
      ["Periode: " + data.dateLabel],
      [],
      [
        "No.",
        "Waktu",
        "Kasir",
        "Rincian Barang",
        "Metode Pembayaran",
        "Status",
        "Subtotal (Rp)",
        "Diskon (Rp)",
        "Total Akhir (Rp)",
      ],
    ];

    data.transactions.forEach((tx, idx) => {
      const timeStr = new Date(tx.createdAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const itemsSummary = (tx.items || []).map((i: any) => `${i.name} (${i.qty}x)`).join(", ");

      txRows.push([
        idx + 1,
        timeStr,
        tx.cashierName || "Kasir",
        itemsSummary,
        (tx.paymentMethod || "CASH").toUpperCase(),
        tx.status === "cancelled" ? "Dibatalkan" : "Lunas",
        tx.subtotal || tx.total,
        tx.discountAmount || 0,
        tx.total,
      ]);
    });

    const wsTransactions = XLSX.utils.aoa_to_sheet(txRows);
    wsTransactions["!cols"] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 16 },
      { wch: 45 },
      { wch: 18 },
      { wch: 12 },
      { wch: 16 },
      { wch: 14 },
      { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(wb, wsTransactions, "Daftar_Transaksi");
  }

  // Generate clean filename
  const cleanStore = data.storeName.replace(/[^a-zA-Z0-9]/g, "_");
  const dateSlug = new Date().toISOString().slice(0, 10);
  const fileName = `Laporan_TokuPOS_${cleanStore}_${data.range}_${dateSlug}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

export async function copyToGoogleSheets(data: ReportExportData): Promise<boolean> {
  const diagnosis = getLaymanHealthDiagnosis(data.totalRevenue, data.netProfit, data.netMargin);

  const lines: string[] = [];

  // Header Section
  lines.push(`LAPORAN KEUANGAN & LABA BERSIH TOKU POS`);
  lines.push(`Nama Toko:\t${data.storeName}`);
  lines.push(`Periode:\t${data.dateLabel}`);
  lines.push(`Waktu Export:\t${new Date().toLocaleString("id-ID")}`);
  lines.push(``);

  // Health Note
  lines.push(`DIAGNOSA KESEHATAN TOKO:`);
  lines.push(`${diagnosis.title}`);
  lines.push(`${diagnosis.text}`);
  lines.push(``);

  // Step-by-Step P&L
  lines.push(`PERJALANAN CUAN TOKO (LABA RUGI)`);
  lines.push(`Komponen\tNilai (Rp)\tPenjelasan Awam`);
  lines.push(
    `1. Uang Masuk (Omset)\t${data.totalRevenue}\tTotal seluruh penerimaan penjualan kotor`,
  );
  lines.push(`2. Modal Kulakan (HPP)\t${data.totalCogs}\tModal barang yang laku terjual`);
  lines.push(
    `3. Untung Kotor\t${data.grossProfit}\tSelisih omset dikurangi modal barang (Margin ${data.grossMargin.toFixed(1)}%)`,
  );
  lines.push(
    `4. Biaya Operasional Toko\t${data.totalExpenses}\tPengeluaran listrik, sewa, gaji, dll`,
  );
  lines.push(
    `5. CUAN BERSIH AKHIR\t${data.netProfit}\tLaba murni yang masuk ke kantong Anda (Margin Bersih ${data.netMargin.toFixed(1)}%)`,
  );
  lines.push(``);

  // Top Products
  lines.push(`PRODUK TERLARIS & PALING MENGUNTUNGKAN`);
  lines.push(`Peringkat\tNama Produk\tTerjual (pcs)\tOmset (Rp)\tModal (Rp)\tCuan Bersih (Rp)`);

  const sortedProducts = [...data.topProducts].sort((a, b) => b.totalRevenue - a.totalRevenue);
  sortedProducts.slice(0, 20).forEach((p, idx) => {
    lines.push(
      `#${idx + 1}\t${p.name}\t${p.totalQty}\t${p.totalRevenue}\t${p.totalCost}\t${p.totalProfit}`,
    );
  });

  const tsvText = lines.join("\n");

  try {
    await navigator.clipboard.writeText(tsvText);
    return true;
  } catch (err) {
    console.error("Failed to copy TSV to clipboard:", err);
    return false;
  }
}

/**
 * Prints the report document in an isolated A4 iframe.
 * Ensures 100% visual fidelity matching the on-screen preview,
 * with exact A4 portrait dimensions, full color preservation,
 * and zero interference from thermal receipt 80mm rules or modals.
 */
export function printReportA4(
  element: HTMLElement | null,
  title: string = "Laporan Keuangan Toku POS",
) {
  if (!element) {
    window.print();
    return;
  }

  // Remove previous report print frame if any
  const existingFrame = document.getElementById("toku-report-print-frame");
  if (existingFrame) existingFrame.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "toku-report-print-frame";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Collect all stylesheets and style blocks from the main document
  let stylesHtml = "";
  document.querySelectorAll("link[rel='stylesheet'], style").forEach((node) => {
    stylesHtml += node.outerHTML;
  });

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      ${stylesHtml}
      <style>
        @page {
          size: A4 portrait;
          margin: 18mm 20mm 20mm 20mm;
        }
        *, *::before, *::after {
          box-sizing: border-box !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #171717 !important;
          width: 100% !important;
          max-width: 100% !important;
          -webkit-font-smoothing: antialiased;
        }
        .printable-report {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 auto !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #171717 !important;
          border: none !important;
          box-shadow: none !important;
        }
        /* Smart page flow: prevent awkward splitting */
        .page-break-avoid,
        .report-avoid-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        thead {
          display: table-header-group !important;
        }
        tr {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .no-print {
          display: none !important;
        }
      </style>
    </head>
    <body class="bg-white text-neutral-900">
      <div class="printable-report">
        ${element.innerHTML}
      </div>
    </body>
    </html>
  `);
  doc.close();

  // Temporarily sync parent document.title so all browser PDF drivers suggest this exact filename
  const origTitle = document.title;
  if (title) {
    document.title = title;
  }

  // Allow styles and web fonts to settle in iframe before invoking print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        document.title = origTitle;
        iframe.remove();
      }, 2500);
    }
  }, 250);
}
