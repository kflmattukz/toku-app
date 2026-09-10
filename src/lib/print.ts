import { formatIDR, calculateItemDiscount, normalizeIndonesianPhone } from "./utils";
import { toast } from "sonner";

export interface PrintReceiptOptions {
  paperWidth?: "58mm" | "80mm";
  title?: string;
}

export interface ReceiptData {
  tx: any;
  storeName: string;
  storeAddress?: string;
  paperWidth?: "58mm" | "80mm";
}

/**
 * Prints the receipt element in an isolated hidden iframe with exact thermal dimensions.
 * Ensures 100% fidelity without parent application layout or theme interference.
 */
export function printReceipt(
  elementId = "toku-receipt-content",
  options: PrintReceiptOptions = {},
) {
  const { paperWidth = "80mm", title = "Struk Toku POS" } = options;
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }

  // Remove previous print frame if any
  const existingFrame = document.getElementById("toku-print-frame");
  if (existingFrame) existingFrame.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "toku-print-frame";
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

  const printWidth = paperWidth === "58mm" ? "58mm" : "80mm";
  const bodyPadding = paperWidth === "58mm" ? "3mm 2mm" : "5mm 4mm";
  const fontSize = paperWidth === "58mm" ? "11.5px" : "13px";

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        @page {
          size: ${printWidth} auto;
          margin: 0;
        }
        *, *::before, *::after {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #111827;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          width: ${printWidth};
          max-width: ${printWidth};
          -webkit-font-smoothing: antialiased;
        }
        .price {
          font-family: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
          font-variant-numeric: tabular-nums;
          font-weight: 800;
        }
        .receipt-paper {
          width: ${printWidth} !important;
          max-width: ${printWidth} !important;
          margin: 0 auto !important;
          padding: ${bodyPadding} !important;
          background: #ffffff !important;
          color: #111827 !important;
          font-size: ${fontSize} !important;
          line-height: 1.35 !important;
          box-sizing: border-box !important;
          border: none !important;
          box-shadow: none !important;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        .no-print {
          display: none !important;
        }
      </style>
    </head>
    <body>
      ${el.outerHTML}
    </body>
    </html>
  `);
  doc.close();

  // Allow images and fonts to settle in the iframe before printing
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        iframe.remove();
      }, 1500);
    }
  }, 150);
}

// Code 39 character patterns (9 elements: 5 bars & 4 spaces; 1 = wide, 0 = narrow)
const CODE39_MAP: Record<string, string> = {
  "0": "000110100",
  "1": "100100001",
  "2": "001100001",
  "3": "101100000",
  "4": "000110001",
  "5": "100110000",
  "6": "001110000",
  "7": "000100101",
  "8": "100100100",
  "9": "001100100",
  A: "100001001",
  B: "001001001",
  C: "101001000",
  D: "000011001",
  E: "100011000",
  F: "001011000",
  G: "000001101",
  H: "100001100",
  I: "001001100",
  J: "000011100",
  K: "100000011",
  L: "001000011",
  M: "101000010",
  N: "000010011",
  O: "100010010",
  P: "001010010",
  Q: "000000111",
  R: "100000110",
  S: "001000110",
  T: "000010110",
  U: "110000001",
  V: "011000001",
  W: "111000000",
  X: "010010001",
  Y: "110010000",
  Z: "011010000",
  "-": "010000101",
  ".": "110000100",
  " ": "011000100",
  $: "010101000",
  "/": "010100010",
  "+": "010001010",
  "%": "000101010",
  "*": "010010100",
};

export interface BarcodeBar {
  isBar: boolean;
  width: number;
}

/**
 * Encodes text into standard Code 39 barcode bar definitions
 */
export function generateBarcodeBars(
  text: string,
  narrowWidth = 1.25,
  wideWidth = 3.0,
): { bars: BarcodeBar[]; totalWidth: number; displayValue: string } {
  const sanitized = `*${text.toUpperCase().replace(/[^0-9A-Z\-. $/+%]/g, "")}*`;
  const bars: BarcodeBar[] = [];

  for (let i = 0; i < sanitized.length; i++) {
    const char = sanitized[i];
    const pattern = CODE39_MAP[char] || CODE39_MAP["*"];

    for (let p = 0; p < 9; p++) {
      const isBar = p % 2 === 0; // Even indices = bars, Odd indices = spaces
      const isWide = pattern[p] === "1";
      bars.push({
        isBar,
        width: isWide ? wideWidth : narrowWidth,
      });
    }

    // Inter-character narrow gap
    if (i < sanitized.length - 1) {
      bars.push({
        isBar: false,
        width: narrowWidth,
      });
    }
  }

  const totalWidth = bars.reduce((acc, b) => acc + b.width, 0);
  return { bars, totalWidth, displayValue: text.toUpperCase() };
}

/**
 * Draws a real, sharp Code 39 barcode onto a 2D canvas context
 */
export function drawBarcodeToCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  options: {
    narrowWidth?: number;
    wideWidth?: number;
    height?: number;
    color?: string;
    showText?: boolean;
  } = {},
): number {
  const {
    narrowWidth = 1.25,
    wideWidth = 3.0,
    height = 28,
    color = "#292524",
    showText = true,
  } = options;

  const { bars, totalWidth, displayValue } = generateBarcodeBars(text, narrowWidth, wideWidth);
  let curX = centerX - totalWidth / 2;

  ctx.fillStyle = color;
  for (const bar of bars) {
    if (bar.isBar) {
      ctx.fillRect(curX, startY, bar.width, height);
    }
    curX += bar.width;
  }

  let nextY = startY + height + 5;

  if (showText) {
    ctx.fillStyle = color;
    ctx.font = `600 10px "JetBrains Mono", Consolas, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(displayValue, centerX, nextY);
    nextY += 14;
  }

  return nextY;
}

/**
 * Helper to wrap text into multiple lines for canvas rendering
 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Generates a high-DPI receipt canvas with 100% visual fidelity matching on-screen receipt.
 */
export async function renderReceiptCanvas(
  tx: any,
  storeName: string,
  storeAddress?: string,
  paperWidth: "58mm" | "80mm" = "80mm",
): Promise<HTMLCanvasElement> {
  const is58mm = paperWidth === "58mm";
  const canvasWidth = is58mm ? 340 : 400;
  const paddingX = is58mm ? 14 : 18;
  const contentWidth = canvasWidth - paddingX * 2;
  const scale = 2; // 2x Retina resolution

  const now = new Date(tx.createdAt || Date.now());
  const txId = tx._id
    ? `TX-${String(tx._id).slice(-6).toUpperCase()}`
    : `TX-${now.getTime().toString().slice(-6)}`;

  // First pass: measure approximate height to initialize buffer canvas
  let estimatedHeight = 160;
  const items = Array.isArray(tx.items) ? tx.items : [];
  estimatedHeight += items.length * (is58mm ? 44 : 48);

  if (tx.subtotal && tx.subtotal !== tx.total) estimatedHeight += 20;
  if (tx.discountAmount && tx.discountAmount > 0) estimatedHeight += 20;
  estimatedHeight += 24; // Payment method
  if (tx.paymentMethod === "cash") estimatedHeight += 38;
  estimatedHeight += 70; // Total Bayar box
  estimatedHeight += 80; // Barcode & Footer

  // Create temporary working canvas
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth * scale;
  canvas.height = estimatedHeight * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  ctx.scale(scale, scale);

  // Pure White Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, estimatedHeight);

  // Compact top margin without logo
  let curY = 16;

  // 1. Store Name (Bold Text, No logo)
  ctx.fillStyle = "#000000";
  ctx.font = `900 ${is58mm ? 16 : 18}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(storeName, canvasWidth / 2, curY + 14);
  curY += 20;

  // Store Address (if any)
  if (storeAddress) {
    ctx.fillStyle = "#000000";
    ctx.font = `500 ${is58mm ? 10.5 : 11.5}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(storeAddress, canvasWidth / 2, curY);
    curY += 15;
  }

  // Date & Time
  const dateStr = `${now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} · ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
  ctx.fillStyle = "#000000";
  ctx.font = `500 ${is58mm ? 10.5 : 11.5}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(dateStr, canvasWidth / 2, curY);
  curY += 15;

  // Cashier Name
  if (tx.cashierName) {
    ctx.fillStyle = "#000000";
    ctx.font = `600 ${is58mm ? 10.5 : 11.5}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillText(`Kasir: ${tx.cashierName}`, canvasWidth / 2, curY);
    curY += 15;
  }

  // Transaction Badge #TX-XXXX (Clean B&W)
  const badgeText = `#${txId}`;
  ctx.font = `800 ${is58mm ? 10.5 : 11.5}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const badgeWidth = ctx.measureText(badgeText).width + 16;
  const badgeHeight = 20;
  const badgeX = (canvasWidth - badgeWidth) / 2;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(badgeX, curY, badgeWidth, badgeHeight, 99);
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#000000";
  ctx.fillText(badgeText, canvasWidth / 2, curY + badgeHeight / 2 + 3.5);
  curY += badgeHeight + 12;

  // Dashed Separator
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(paddingX, curY);
  ctx.lineTo(canvasWidth - paddingX, curY);
  ctx.stroke();
  ctx.setLineDash([]);

  curY += 12;

  // 2. Item List Header
  ctx.fillStyle = "#000000";
  ctx.font = `800 ${is58mm ? 9.5 : 10.5}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("ITEM BARANG", paddingX, curY);
  ctx.textAlign = "right";
  ctx.fillText("SUBTOTAL", canvasWidth - paddingX, curY);

  curY += 8;
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(paddingX, curY);
  ctx.lineTo(canvasWidth - paddingX, curY);
  ctx.stroke();

  curY += 10;

  // 3. Items Rows (Showing Full Name)
  items.forEach((item: any) => {
    const disc = calculateItemDiscount(item.price, item.discountType, item.discountValue);
    const itemTotal = item.subtotal ?? disc.unitPrice * item.qty;

    // Subtotal width
    const subtotalStr = formatIDR(itemTotal);
    ctx.font = `800 ${is58mm ? 11.5 : 12.5}px "JetBrains Mono", Consolas, monospace`;
    const subtotalWidth = ctx.measureText(subtotalStr).width;

    // Available width for item name
    const nameMaxWidth = contentWidth - subtotalWidth - 10;

    ctx.fillStyle = "#000000";
    ctx.font = `700 ${is58mm ? 11.5 : 12.5}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "left";

    const nameLines = wrapText(ctx, item.name, nameMaxWidth);
    const firstLine = nameLines[0] || item.name;

    // Print first line of name
    ctx.fillText(firstLine, paddingX, curY);

    // Print subtotal aligned with the first line
    ctx.fillStyle = "#000000";
    ctx.font = `800 ${is58mm ? 11.5 : 12.5}px "JetBrains Mono", Consolas, monospace`;
    ctx.textAlign = "right";
    ctx.fillText(subtotalStr, canvasWidth - paddingX, curY);

    curY += 14;

    // Print remaining name lines if wrapped
    if (nameLines.length > 1) {
      ctx.fillStyle = "#000000";
      ctx.font = `700 ${is58mm ? 11.5 : 12.5}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = "left";
      for (let l = 1; l < nameLines.length; l++) {
        ctx.fillText(nameLines[l], paddingX, curY);
        curY += 14;
      }
    }

    // Qty and unit price
    ctx.fillStyle = "#000000";
    ctx.font = `500 ${is58mm ? 10 : 11}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "left";
    let qtyDesc = `${item.qty}x ${formatIDR(item.price)}`;
    if (disc.hasDiscount) {
      qtyDesc += ` (Disc ${disc.discountLabel} ➔ ${formatIDR(disc.unitPrice)})`;
    }
    ctx.fillText(qtyDesc, paddingX, curY);

    curY += 14;
  });

  curY += 2;

  // Dashed Separator
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(paddingX, curY);
  ctx.lineTo(canvasWidth - paddingX, curY);
  ctx.stroke();
  ctx.setLineDash([]);

  curY += 12;

  // 4. Subtotals & Discounts
  if (tx.subtotal && tx.subtotal !== tx.total) {
    ctx.fillStyle = "#000000";
    ctx.font = `500 ${is58mm ? 11 : 12}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("Subtotal Produk", paddingX, curY);
    ctx.textAlign = "right";
    ctx.font = `700 ${is58mm ? 11 : 12}px "JetBrains Mono", Consolas, monospace`;
    ctx.fillText(formatIDR(tx.subtotal), canvasWidth - paddingX, curY);
    curY += 15;
  }

  if (tx.discountAmount && tx.discountAmount > 0) {
    ctx.fillStyle = "#000000";
    ctx.font = `700 ${is58mm ? 11 : 12}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "left";
    const discLabel = tx.discountType === "percentage" ? `(${tx.discountValue}%)` : "";
    ctx.fillText(`Diskon Keranjang ${discLabel}`, paddingX, curY);
    ctx.textAlign = "right";
    ctx.font = `800 ${is58mm ? 11 : 12}px "JetBrains Mono", Consolas, monospace`;
    ctx.fillText(`-${formatIDR(tx.discountAmount)}`, canvasWidth - paddingX, curY);
    curY += 15;
  }

  // Payment Details
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(paddingX, curY);
  ctx.lineTo(canvasWidth - paddingX, curY);
  ctx.stroke();
  curY += 10;

  ctx.fillStyle = "#000000";
  ctx.font = `500 ${is58mm ? 11 : 12}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("Metode Bayar", paddingX, curY);
  ctx.textAlign = "right";
  ctx.font = `800 ${is58mm ? 11 : 12}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(
    tx.paymentMethod === "cash" ? "Tunai (Cash)" : "QRIS Digital",
    canvasWidth - paddingX,
    curY,
  );
  curY += 15;

  if (tx.paymentMethod === "cash") {
    ctx.fillStyle = "#000000";
    ctx.font = `500 ${is58mm ? 11 : 12}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("Uang Diterima", paddingX, curY);
    ctx.textAlign = "right";
    ctx.font = `700 ${is58mm ? 11 : 12}px "JetBrains Mono", Consolas, monospace`;
    ctx.fillText(formatIDR(tx.cashPaid || tx.total), canvasWidth - paddingX, curY);
    curY += 15;

    ctx.fillStyle = "#000000";
    ctx.font = `500 ${is58mm ? 11 : 12}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("Kembalian", paddingX, curY);
    ctx.textAlign = "right";
    ctx.font = `800 ${is58mm ? 11 : 12}px "JetBrains Mono", Consolas, monospace`;
    ctx.fillText(formatIDR(tx.change || 0), canvasWidth - paddingX, curY);
    curY += 16;
  }

  // 5. Total Bayar Box (Pure B&W)
  const totalBoxHeight = is58mm ? 40 : 44;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(paddingX, curY, contentWidth, totalBoxHeight, 4);
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#000000";
  ctx.font = `900 ${is58mm ? 11 : 12}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("TOTAL BAYAR", paddingX + 10, curY + totalBoxHeight / 2);

  ctx.textAlign = "right";
  ctx.font = `900 ${is58mm ? 16 : 19}px "JetBrains Mono", Consolas, monospace`;
  ctx.fillText(formatIDR(tx.total), canvasWidth - paddingX - 10, curY + totalBoxHeight / 2);

  curY += totalBoxHeight + 14;

  // 6. Authentic Code 39 Barcode (Black)
  const barcodeHeight = is58mm ? 24 : 28;
  const barcodeNarrowWidth = is58mm ? 1.15 : 1.3;
  const barcodeWideWidth = is58mm ? 2.8 : 3.2;

  curY = drawBarcodeToCanvas(ctx, txId, canvasWidth / 2, curY, {
    narrowWidth: barcodeNarrowWidth,
    wideWidth: barcodeWideWidth,
    height: barcodeHeight,
    color: "#000000",
    showText: true,
  });
  curY += 6;

  // Footer text (Black)
  ctx.fillStyle = "#000000";
  ctx.font = `600 ${is58mm ? 9.5 : 10}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Terima kasih atas kunjungan Anda!", canvasWidth / 2, curY);
  curY += 13;

  ctx.fillStyle = "#000000";
  ctx.font = `800 ${is58mm ? 9 : 9.5}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText("Toku POS · Kasir Digital UMKM", canvasWidth / 2, curY);

  curY += 16; // bottom padding

  // Crop canvas height dynamically to eliminate excessive bottom margin
  const finalHeight = Math.ceil(curY);
  const finalCanvas = document.createElement("canvas");
  finalCanvas.width = canvasWidth * scale;
  finalCanvas.height = finalHeight * scale;
  const finalCtx = finalCanvas.getContext("2d");
  if (finalCtx) {
    finalCtx.drawImage(
      canvas,
      0,
      0,
      canvasWidth * scale,
      finalHeight * scale,
      0,
      0,
      canvasWidth * scale,
      finalHeight * scale,
    );
    return finalCanvas;
  }

  return canvas;
}

/**
 * Captures receipt and triggers an immediate PNG download without hanging.
 */
export async function downloadReceiptImage(data: ReceiptData | string, filename?: string) {
  const toastId = toast.loading("Membuat gambar struk...");

  try {
    let canvas: HTMLCanvasElement;

    // Check if rich receipt data object was passed directly
    if (typeof data === "object" && data?.tx) {
      canvas = await renderReceiptCanvas(
        data.tx,
        data.storeName,
        data.storeAddress,
        data.paperWidth || "80mm",
      );
    } else {
      // Fallback: search DOM element or render generic
      toast.dismiss(toastId);
      toast.error("Data struk tidak valid untuk diunduh");
      return;
    }

    // Export Blob and trigger instant browser download
    canvas.toBlob((blob) => {
      if (!blob) {
        toast.dismiss(toastId);
        toast.error("Gagal mengekspor file gambar");
        return;
      }

      const txId = data.tx._id ? `TX-${String(data.tx._id).slice(-6).toUpperCase()}` : "transaksi";
      const finalFilename = filename || `struk-${txId}.png`;

      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      toast.dismiss(toastId);
      toast.success("Gambar struk berhasil diunduh!", {
        description: `Disimpan sebagai ${finalFilename}`,
      });
    }, "image/png");
  } catch (error) {
    console.error("Error generating receipt image:", error);
    toast.dismiss(toastId);
    toast.error("Terjadi kesalahan saat membuat gambar struk");
  }
}

export { normalizeIndonesianPhone } from "./utils";

/**
 * Generates a crisp thermal receipt image and shares it to WhatsApp.
 * - On Mobile / Web Share supported devices: shares the actual image file directly to WhatsApp / messaging apps.
 * - On Desktop / unsupported devices: copies the image to clipboard, opens WhatsApp Web,
 *   and notifies the user to paste (Ctrl+V) the image in the chat.
 */
export async function shareReceiptWhatsAppImage(
  tx: any,
  storeName: string,
  storeAddress?: string,
  paperWidth: "58mm" | "80mm" = "80mm",
  customerPhone?: string,
) {
  if (!tx) return;

  const now = new Date(tx.createdAt || Date.now());
  const txId = tx._id
    ? `TX-${String(tx._id).slice(-6).toUpperCase()}`
    : `TX-${now.getTime().toString().slice(-6)}`;

  const toastId = toast.loading("Memproses gambar struk WhatsApp...");

  try {
    const canvas = await renderReceiptCanvas(tx, storeName, storeAddress, paperWidth);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));

    if (!blob) {
      toast.dismiss(toastId);
      toast.error("Gagal membuat gambar struk. Mengalihkan ke teks...");
      shareReceiptWhatsApp(tx, storeName, storeAddress, customerPhone);
      return;
    }

    const filename = `struk-${txId}.png`;
    const file = new File([blob], filename, { type: "image/png" });

    // 1. Mobile Web Share API: Native file sharing
    if (
      typeof navigator !== "undefined" &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      toast.dismiss(toastId);
      try {
        await navigator.share({
          files: [file],
          title: `Struk Transaksi #${txId} - ${storeName}`,
          text: `Halo, berikut struk transaksi #${txId} dari ${storeName}. Terima kasih! 🙏`,
        });
        toast.success("Membuka menu bagikan WhatsApp...");
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return;
        }
      }
    }

    // 2. Desktop Fallback: Copy image to clipboard & open WhatsApp Web
    let copiedToClipboard = false;
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof ClipboardItem !== "undefined"
    ) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        copiedToClipboard = true;
      } catch (clipErr) {
        console.warn("Clipboard image write not supported, falling back to download", clipErr);
      }
    }

    // If clipboard write failed, trigger download so user has the file ready to attach
    if (!copiedToClipboard) {
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    }

    toast.dismiss(toastId);

    const introText = `Halo, berikut struk transaksi #${txId} dari ${storeName}:`;
    const target = customerPhone ? normalizeIndonesianPhone(customerPhone) : "";
    const waUrl = target
      ? `https://wa.me/${target}?text=${encodeURIComponent(introText)}`
      : `https://wa.me/?text=${encodeURIComponent(introText)}`;
    window.open(waUrl, "_blank");

    if (copiedToClipboard) {
      toast.success("Gambar struk disalin ke clipboard! 📋", {
        description: "Buka chat WhatsApp lalu tekan Ctrl+V (Paste) untuk mengirim gambar.",
        duration: 7000,
      });
    } else {
      toast.success("Gambar struk diunduh! 📥", {
        description: "Buka chat WhatsApp lalu lampirkan gambar struk yang baru diunduh.",
        duration: 7000,
      });
    }
  } catch (error) {
    console.error("Error sharing receipt image via WhatsApp:", error);
    toast.dismiss(toastId);
    toast.error("Terjadi kendala. Membuka WhatsApp versi teks...");
    shareReceiptWhatsApp(tx, storeName, storeAddress, customerPhone);
  }
}

/**
 * Formats a clean Indonesian receipt summary and opens WhatsApp with prefilled text.
 */
export function shareReceiptWhatsApp(
  tx: any,
  storeName: string,
  storeAddress?: string,
  customerPhone?: string,
) {
  if (!tx) return;

  const now = new Date(tx.createdAt || Date.now());
  const txId = tx._id
    ? `TX-${String(tx._id).slice(-6).toUpperCase()}`
    : `TX-${now.getTime().toString().slice(-6)}`;

  const formattedDate = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const lines: string[] = [`🧾 *STRUK PEMBELIAN - ${storeName.toUpperCase()}*`];

  if (storeAddress) {
    lines.push(`📍 ${storeAddress}`);
  }

  lines.push(
    `━━━━━━━━━━━━━━━━━━━━`,
    `No. Transaksi : *#${txId}*`,
    `Waktu : ${formattedDate}, ${formattedTime}`,
  );

  if (tx.cashierName) {
    lines.push(`Kasir : ${tx.cashierName}`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━`, `*DAFTAR PESANAN:*`);

  if (Array.isArray(tx.items)) {
    tx.items.forEach((item: any) => {
      const disc = calculateItemDiscount(item.price, item.discountType, item.discountValue);
      const itemTotal = item.subtotal ?? disc.unitPrice * item.qty;
      lines.push(`• *${item.name}*`);
      if (disc.hasDiscount) {
        lines.push(
          `  ${item.qty}x ${formatIDR(disc.unitPrice)} ~(Disc ${disc.discountLabel})~ = *${formatIDR(itemTotal)}*`,
        );
      } else {
        lines.push(`  ${item.qty}x ${formatIDR(item.price)} = *${formatIDR(itemTotal)}*`);
      }
    });
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━`);

  if (tx.subtotal && tx.subtotal !== tx.total) {
    lines.push(`Subtotal : ${formatIDR(tx.subtotal)}`);
  }

  if (tx.discountAmount && tx.discountAmount > 0) {
    const discLabel = tx.discountType === "percentage" ? `(${tx.discountValue}%)` : "";
    lines.push(`Diskon Keranjang ${discLabel} : -${formatIDR(tx.discountAmount)}`);
  }

  lines.push(
    `*TOTAL PEMBAYARAN : ${formatIDR(tx.total)}*`,
    `Metode Bayar : ${tx.paymentMethod === "cash" ? "Tunai" : "QRIS Digital"}`,
  );

  if (tx.paymentMethod === "cash") {
    lines.push(
      `Uang Diterima : ${formatIDR(tx.cashPaid || tx.total)}`,
      `Kembalian : ${formatIDR(tx.change || 0)}`,
    );
  }

  lines.push(
    `━━━━━━━━━━━━━━━━━━━━`,
    `Terima kasih telah berbelanja di *${storeName}*! 🙏`,
    `_Struk resmi kasir digital Toku POS_`,
  );

  const fullText = lines.join("\n");
  const target = customerPhone ? normalizeIndonesianPhone(customerPhone) : "";
  const waUrl = target
    ? `https://wa.me/${target}?text=${encodeURIComponent(fullText)}`
    : `https://wa.me/?text=${encodeURIComponent(fullText)}`;

  window.open(waUrl, "_blank");
  toast.success("Membuka WhatsApp untuk mengirim struk...");
}
