/**
 * Prints the receipt element in an isolated hidden iframe.
 * Eliminates blank pages caused by parent SPA DOM layout and ensures exact 1-page 80mm output.
 */
export function printReceipt(elementId = "toku-receipt-content") {
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }

  // Remove existing print iframe if any
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

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8" />
      <title>Struk Toku POS</title>
      <style>
        @page {
          size: 80mm auto;
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
          color: #1c1917;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          width: 80mm;
          max-width: 80mm;
        }
        .price {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-variant-numeric: tabular-nums;
          font-weight: 800;
        }
        .receipt-paper {
          width: 80mm !important;
          max-width: 80mm !important;
          margin: 0 auto !important;
          padding: 5mm 4mm !important;
          background: #ffffff !important;
          color: #1c1917 !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
          box-sizing: border-box !important;
          border: none !important;
          box-shadow: none !important;
        }
        img {
          max-width: 100%;
          height: auto;
        }
      </style>
    </head>
    <body>
      ${el.outerHTML}
    </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        iframe.remove();
      }, 1000);
    }
  }, 200);
}
