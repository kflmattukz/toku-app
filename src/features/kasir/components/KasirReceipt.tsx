import { formatIDR, calculateItemDiscount } from "#/lib/utils";
import { generateBarcodeBars } from "#/lib/print";

export interface KasirReceiptProps {
  id?: string;
  tx: any;
  storeName: string;
  storeAddress?: string;
  paperWidth?: "58mm" | "80mm";
}

function ReceiptBarcode({ value, is58mm }: { value: string; is58mm: boolean }) {
  const narrowWidth = is58mm ? 1.15 : 1.3;
  const wideWidth = is58mm ? 2.8 : 3.2;
  const height = is58mm ? 26 : 30;
  const { bars, totalWidth, displayValue } = generateBarcodeBars(
    value,
    narrowWidth,
    wideWidth,
  );

  let curX = 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
      }}
    >
      <svg
        width={totalWidth}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        style={{ display: "block" }}
      >
        {bars.map((bar, idx) => {
          const x = curX;
          curX += bar.width;
          if (!bar.isBar) return null;
          return (
            <rect
              key={idx}
              x={x}
              y={0}
              width={bar.width}
              height={height}
              fill="#292524"
            />
          );
        })}
      </svg>
      <span
        style={{
          fontFamily: '"JetBrains Mono", Consolas, monospace',
          fontSize: is58mm ? 9.5 : 10.5,
          fontWeight: 600,
          color: "#78716c",
          marginTop: 4,
          letterSpacing: "0.08em",
        }}
      >
        {displayValue}
      </span>
    </div>
  );
}

export function KasirReceipt({
  id,
  tx,
  storeName,
  storeAddress,
  paperWidth = "80mm",
}: KasirReceiptProps) {
  if (!tx) return null;

  const now = new Date(tx.createdAt || Date.now());
  const txId = tx._id
    ? `TX-${String(tx._id).slice(-6).toUpperCase()}`
    : `TX-${now.getTime().toString().slice(-6)}`;

  const is58mm = paperWidth === "58mm";

  return (
    <div
      id={id || "toku-receipt-content"}
      className="receipt-paper"
      style={{
        width: "100%",
        maxWidth: is58mm ? "280px" : "360px",
        margin: "0 auto",
        background: "#ffffff",
        color: "#1c1917",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        fontSize: is58mm ? "11px" : "12.5px",
        lineHeight: 1.35,
        padding: is58mm ? "16px 12px" : "20px 16px",
        boxSizing: "border-box",
        borderRadius: "14px",
      }}
    >
      {/* Store Header */}
      <div
        style={{
          textAlign: "center",
          borderBottom: "1.5px dashed #d6d3d1",
          paddingBottom: 14,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: is58mm ? 36 : 42,
            height: is58mm ? 36 : 42,
            borderRadius: "50%",
            background: "#ea580c",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 8px",
            boxShadow: "0 4px 10px rgba(234, 88, 12, 0.2)",
          }}
        >
          <img
            src="/logo.png"
            alt="Toku POS"
            style={{
              width: is58mm ? 22 : 26,
              height: is58mm ? 22 : 26,
              objectFit: "contain",
            }}
          />
        </div>

        <strong
          style={{
            fontSize: is58mm ? 15 : 17,
            color: "#1c1917",
            display: "block",
            letterSpacing: "-0.02em",
            fontWeight: 900,
          }}
        >
          {storeName}
        </strong>

        {storeAddress && (
          <div style={{ fontSize: 10.5, color: "#78716c", marginTop: 2 }}>
            {storeAddress}
          </div>
        )}

        <div style={{ fontSize: 10.5, color: "#78716c", marginTop: 4 }}>
          {now.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}{" "}
          ·{" "}
          {now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {tx.cashierName && (
          <div style={{ fontSize: 10.5, color: "#57534e", marginTop: 2 }}>
            Kasir: <strong style={{ color: "#1c1917" }}>{tx.cashierName}</strong>
          </div>
        )}

        <div
          style={{
            display: "inline-block",
            marginTop: 6,
            padding: "2px 8px",
            borderRadius: 99,
            background: "#f5f5f4",
            border: "1px solid #e7e5e4",
            fontSize: 10.5,
            fontWeight: 800,
            color: "#ea580c",
            letterSpacing: "0.02em",
          }}
        >
          #{txId}
        </div>
      </div>

      {/* Item List Header */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 9.5,
            fontWeight: 800,
            color: "#78716c",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 6,
            borderBottom: "1px solid #f5f5f4",
            paddingBottom: 4,
          }}
        >
          <span>ITEM BARANG</span>
          <span>SUBTOTAL</span>
        </div>

        {/* Item Rows */}
        {tx.items?.map((item: any, i: number) => {
          const disc = calculateItemDiscount(item.price, item.discountType, item.discountValue);
          const itemTotal = item.subtotal ?? disc.unitPrice * item.qty;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "5px 0",
                borderBottom: i === tx.items.length - 1 ? "none" : "1px dashed #f5f5f4",
              }}
            >
              <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                <div
                  style={{
                    fontSize: is58mm ? 11.5 : 12.5,
                    fontWeight: 700,
                    color: "#1c1917",
                    wordBreak: "break-word",
                  }}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: "#78716c",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    flexWrap: "wrap",
                    marginTop: 1,
                  }}
                >
                  <span>
                    {item.qty}x {formatIDR(item.price)}
                  </span>
                  {disc.hasDiscount && (
                    <span style={{ color: "#ea580c", fontWeight: 700 }}>
                      (Disc {disc.discountLabel} ➔ {formatIDR(disc.unitPrice)})
                    </span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <span
                  className="price"
                  style={{
                    fontSize: is58mm ? 11.5 : 12.5,
                    fontWeight: 800,
                    color: "#1c1917",
                  }}
                >
                  {formatIDR(itemTotal)}
                </span>
                {disc.hasDiscount && (
                  <div
                    className="price"
                    style={{
                      fontSize: 9.5,
                      color: "#a8a29e",
                      textDecoration: "line-through",
                    }}
                  >
                    {formatIDR(item.price * item.qty)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtotals & Discounts Breakdown */}
      <div
        style={{
          borderTop: "1.5px dashed #d6d3d1",
          paddingTop: 10,
          marginBottom: 10,
        }}
      >
        {tx.subtotal && tx.subtotal !== tx.total && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
              fontSize: is58mm ? 11 : 12,
              color: "#57534e",
            }}
          >
            <span>Subtotal Produk</span>
            <span className="price">{formatIDR(tx.subtotal)}</span>
          </div>
        )}

        {tx.discountAmount && tx.discountAmount > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
              fontSize: is58mm ? 11 : 12,
              color: "#ea580c",
              fontWeight: 700,
            }}
          >
            <span>
              Diskon Keranjang {tx.discountType === "percentage" ? `(${tx.discountValue}%)` : ""}
            </span>
            <span className="price">-{formatIDR(tx.discountAmount)}</span>
          </div>
        )}
      </div>

      {/* Payment Details */}
      <div
        style={{
          borderTop: "1px solid #e7e5e4",
          paddingTop: 8,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
            fontSize: is58mm ? 11 : 12,
            color: "#57534e",
          }}
        >
          <span>Metode Bayar</span>
          <span style={{ fontWeight: 800, color: "#1c1917" }}>
            {tx.paymentMethod === "cash" ? "Tunai (Cash)" : "QRIS Digital"}
          </span>
        </div>

        {tx.paymentMethod === "cash" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 3,
                fontSize: is58mm ? 11 : 12,
                color: "#57534e",
              }}
            >
              <span>Uang Diterima</span>
              <span className="price" style={{ color: "#1c1917" }}>
                {formatIDR(tx.cashPaid || tx.total)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
                fontSize: is58mm ? 11 : 12,
                color: "#57534e",
              }}
            >
              <span>Kembalian</span>
              <span className="price" style={{ fontWeight: 800, color: "#047857" }}>
                {formatIDR(tx.change || 0)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Total Banner */}
      <div
        style={{
          background: "#fff7ed",
          border: "1.5px solid #ea580c",
          borderRadius: "10px",
          padding: is58mm ? "8px 12px" : "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: is58mm ? 10.5 : 11.5,
            fontWeight: 800,
            color: "#ea580c",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          TOTAL BAYAR
        </span>
        <span
          className="price"
          style={{
            fontSize: is58mm ? 17 : 20,
            fontWeight: 900,
            color: "#ea580c",
          }}
        >
          {formatIDR(tx.total)}
        </span>
      </div>

      {/* Authentic Barcode Graphic & Footer */}
      <div style={{ textAlign: "center", paddingTop: 4 }}>
        <ReceiptBarcode value={txId} is58mm={is58mm} />
        <div style={{ fontSize: 10, color: "#78716c", fontWeight: 600 }}>
          Terima kasih atas kunjungan Anda!
        </div>
        <div style={{ fontSize: 9.5, color: "#ea580c", fontWeight: 800, marginTop: 3 }}>
          Toku POS · Kasir Digital UMKM
        </div>
      </div>
    </div>
  );
}
