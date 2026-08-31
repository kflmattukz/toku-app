import { formatIDR, calculateItemDiscount } from "#/lib/utils";

interface KasirReceiptProps {
  tx: any;
  storeName: string;
}

export function KasirReceipt({ tx, storeName }: KasirReceiptProps) {
  if (!tx) return null;
  const now = new Date(tx.createdAt || Date.now());
  const txId = tx._id
    ? `TX-${String(tx._id).slice(-6).toUpperCase()}`
    : `TX-${now.getTime().toString().slice(-6)}`;

  return (
    <div className="receipt-paper">
      {/* Store Header */}
      <div
        style={{
          textAlign: "center",
          borderBottom: "2px dashed #e5e5e5",
          paddingBottom: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 99,
            background: "#ea580c",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 8px",
            boxShadow: "0 4px 12px rgba(234, 88, 12, 0.25)",
          }}
        >
          <img
            src="/logo.png"
            alt="Toku POS"
            style={{ width: 28, height: 28, objectFit: "contain" }}
          />
        </div>
        <strong
          style={{
            fontSize: 18,
            color: "#1c1917",
            display: "block",
            letterSpacing: "-0.02em",
          }}
        >
          {storeName}
        </strong>
        <div style={{ fontSize: 11, color: "#78716c", marginTop: 4 }}>
          {now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
          {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 8,
            padding: "2px 10px",
            borderRadius: 99,
            background: "#f5f5f4",
            border: "1px solid #e7e5e4",
            fontSize: 11,
            fontWeight: 800,
            color: "#ea580c",
          }}
        >
          #{txId}
        </div>
      </div>

      {/* Item List */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            fontWeight: 800,
            color: "#78716c",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          <span>ITEM BARANG</span>
          <span>SUBTOTAL</span>
        </div>

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
                padding: "6px 0",
                borderBottom: i === tx.items.length - 1 ? "none" : "1px solid #f5f5f4",
              }}
            >
              <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>{item.name}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#78716c",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    {item.qty} x {formatIDR(item.price)}
                  </span>
                  {disc.hasDiscount && (
                    <span style={{ color: "#ea580c", fontWeight: 700 }}>
                      (Disc {disc.discountLabel} ➔ {formatIDR(disc.unitPrice)})
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="price" style={{ fontSize: 13, fontWeight: 800, color: "#1c1917" }}>
                  {formatIDR(itemTotal)}
                </span>
                {disc.hasDiscount && (
                  <div
                    className="price"
                    style={{
                      fontSize: 10,
                      color: "#78716c",
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
          borderTop: "2px dashed #e5e5e5",
          paddingTop: 12,
          marginBottom: 12,
        }}
      >
        {tx.subtotal && tx.subtotal !== tx.total && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
              fontSize: 12,
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
              marginBottom: 6,
              fontSize: 12,
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
          borderTop: "1px solid #e5e5e5",
          paddingTop: 10,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
            fontSize: 12,
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
                marginBottom: 4,
                fontSize: 12,
                color: "#57534e",
              }}
            >
              <span>Uang Diterima</span>
              <span className="price" style={{ color: "#1c1917" }}>
                {formatIDR(tx.cashPaid || 0)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                fontSize: 12,
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
          borderRadius: "var(--radius-md)",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: "#ea580c",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          TOTAL BAYAR
        </span>
        <span className="price" style={{ fontSize: 22, fontWeight: 800, color: "#ea580c" }}>
          {formatIDR(tx.total)}
        </span>
      </div>

      {/* Thermal Barcode Graphic & Footer */}
      <div style={{ textAlign: "center", paddingTop: 4 }}>
        <div
          style={{
            fontSize: 18,
            letterSpacing: "4px",
            color: "#a8a29e",
            marginBottom: 8,
            opacity: 0.7,
          }}
        >
          ||| | || |||| | ||| || |||
        </div>
        <div style={{ fontSize: 11, color: "#78716c", fontWeight: 600 }}>
          Terima kasih telah berbelanja!
        </div>
        <div style={{ fontSize: 10, color: "#ea580c", fontWeight: 800, marginTop: 2 }}>
          Toku POS · Kasir Digital UMKM
        </div>
      </div>
    </div>
  );
}
