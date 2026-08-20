import { Modal } from "#/components/Modal";
import { printReceipt } from "#/lib/print";
import { useAppStore } from "#/lib/store-context";
import { formatDate, formatIDR } from "#/lib/utils";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  MoneyIcon,
  PackageIcon,
  PrinterIcon,
  QrCodeIcon,
  ReceiptIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

export const Route = createFileRoute("/_app/transaksi")({ component: Transaksi });

function Transaksi() {
  const { store } = useAppStore();
  const transactions = useQuery(api.transactions.list, store ? { storeId: store._id } : "skip");
  const [selected, setSelected] = useState<any>(null);
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  if (!transactions) return <Loader />;

  const totalCount = transactions.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const pagedTransactions = transactions.slice(startIndex, endIndex);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow-tag">ARUS KAS & STRUK</div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            margin: "2px 0 0",
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
          }}
        >
          Riwayat Transaksi
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-2)" }}>
          {transactions.length} transaksi penjualan berhasil dicatat
        </p>
      </div>

      {/* Transaction List — Card Architecture matching Dribbble POS image */}
      {transactions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 20px",
            color: "var(--color-text-3)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
          }}
        >
          <ReceiptIcon size={52} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
            Belum ada transaksi. Lakukan penjualan di kasir!
          </p>
        </div>
      ) : (
        <>
          {/* PC / Laptop / Tablet Table View (Visible on screens > 768px) */}
          <div className="desktop-only" style={{ width: "100%", flexDirection: "column" }}>
            <div
              style={{
                background: "var(--color-surface)",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                boxShadow: "var(--shadow-sm)",
                width: "100%",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr
                    style={{
                      background: "var(--color-surface-2)",
                      borderBottom: "1.5px solid var(--color-border)",
                    }}
                  >
                    <th style={thStyle}>No. Transaksi</th>
                    <th style={thStyle}>Waktu</th>
                    <th style={thStyle}>Metode Bayar</th>
                    <th style={thStyle}>Ringkasan Item</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedTransactions.map((tx, idx) => {
                    const totalQty = tx.items.reduce((s: number, i: any) => s + i.qty, 0);
                    const itemsSummary = tx.items.map((i: any) => `${i.qty}x ${i.name}`).join(", ");
                    const txNumber = totalCount - (startIndex + idx);
                    return (
                      <tr
                        key={tx._id}
                        onClick={() => setSelected(tx)}
                        className="press-tactile tx-table-row"
                        style={{
                          borderBottom: "1px solid var(--color-border-subtle)",
                          cursor: "pointer",
                          transition: "background 150ms ease",
                        }}
                      >
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: 13,
                                color: "var(--color-brand)",
                              }}
                            >
                              #{txNumber}
                            </span>
                            {tx.syncedFromOffline && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  background: "var(--color-warning-light)",
                                  color: "var(--color-warning-text)",
                                  padding: "2px 8px",
                                  borderRadius: 99,
                                }}
                              >
                                Offline
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div
                            style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)" }}
                          >
                            {formatDate(tx.createdAt)}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "4px 10px",
                                borderRadius: 99,
                                fontSize: 12,
                                fontWeight: 700,
                                background:
                                  tx.paymentMethod === "cash"
                                    ? "var(--color-brand-light)"
                                    : "var(--color-qris-bg)",
                                color:
                                  tx.paymentMethod === "cash"
                                    ? "var(--color-brand)"
                                    : "var(--color-qris-text)",
                              }}
                            >
                              {tx.paymentMethod === "cash" ? (
                                <MoneyIcon size={15} weight="duotone" />
                              ) : (
                                <QrCodeIcon size={15} weight="duotone" />
                              )}
                              {tx.paymentMethod === "cash" ? "Tunai" : "QRIS"}
                            </span>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, maxWidth: 280 }}>
                          <div
                            style={{
                              fontSize: 13,
                              color: "var(--color-text-2)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={itemsSummary}
                          >
                            <strong style={{ color: "var(--color-text)" }}>{totalQty} item</strong>{" "}
                            ({itemsSummary})
                          </div>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          <span
                            className="price"
                            style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text)" }}
                          >
                            {formatIDR(tx.total)}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          <span
                            style={{
                              background: "var(--color-success-light)",
                              color: "var(--color-success-text)",
                              borderRadius: 99,
                              padding: "3px 10px",
                              fontSize: 11,
                              fontWeight: 800,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <CheckCircleIcon size={12} weight="fill" />
                            Lunas
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(tx);
                            }}
                            className="press-tactile"
                            style={{
                              padding: "6px 14px",
                              borderRadius: 99,
                              border: "1px solid var(--color-border)",
                              background: "var(--color-surface-2)",
                              color: "var(--color-text)",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <PrinterIcon size={14} />
                            Struk
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Phone Card View (Visible on screens <= 768px) */}
          <div className="mobile-only" style={{ width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pagedTransactions.map((tx, idx) => {
                const txNumber = totalCount - (startIndex + idx);
                return (
                  <div
                    key={tx._id}
                    onClick={() => setSelected(tx)}
                    className="squircle-card press-tactile"
                    style={{
                      padding: "18px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 99,
                          background:
                            tx.paymentMethod === "cash"
                              ? "var(--color-brand-light)"
                              : "var(--color-qris-bg)",
                          color:
                            tx.paymentMethod === "cash"
                              ? "var(--color-brand)"
                              : "var(--color-qris-text)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {tx.paymentMethod === "cash" ? (
                          <MoneyIcon size={22} weight="duotone" />
                        ) : (
                          <QrCodeIcon size={22} weight="duotone" />
                        )}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: "var(--color-brand)",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Penjualan #{txNumber}
                          </span>
                          {tx.syncedFromOffline && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                background: "var(--color-warning-light)",
                                color: "var(--color-warning-text)",
                                padding: "2px 8px",
                                borderRadius: 99,
                              }}
                            >
                              Synced Offline
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text)" }}>
                          {tx.paymentMethod === "cash"
                            ? "Pembayaran Tunai"
                            : "Pembayaran QRIS Digital"}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 2 }}>
                          {formatDate(tx.createdAt)} ·{" "}
                          {tx.items.reduce((s: number, i: any) => s + i.qty, 0)} item
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 6,
                        flexShrink: 0,
                      }}
                    >
                      <span
                        className="price"
                        style={{ fontSize: 17, fontWeight: 800, color: "var(--color-text)" }}
                      >
                        {formatIDR(tx.total)}
                      </span>
                      <span
                        style={{
                          background: "var(--color-success-light)",
                          color: "var(--color-success-text)",
                          borderRadius: 99,
                          padding: "3px 10px",
                          fontSize: 11,
                          fontWeight: 800,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <CheckCircleIcon size={12} weight="fill" />
                        Lunas
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination Controls Bar */}
          {totalCount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
                marginTop: 20,
                padding: "14px 18px",
                background: "var(--color-surface)",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {/* Left: Summary & Page Size Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "var(--color-text-2)", fontWeight: 600 }}>
                  Menampilkan{" "}
                  <strong style={{ color: "var(--color-text)" }}>
                    {totalCount > 0 ? startIndex + 1 : 0}-{endIndex}
                  </strong>{" "}
                  dari <strong style={{ color: "var(--color-text)" }}>{totalCount}</strong>{" "}
                  transaksi
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--color-text-3)", fontWeight: 700 }}>
                    Per halaman:
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[5, 10, 20, 50].map((size) => {
                      const active = pageSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handlePageSizeChange(size)}
                          className="press-tactile"
                          style={{
                            padding: "4px 10px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: active ? 800 : 600,
                            background: active ? "var(--color-brand)" : "var(--color-surface-2)",
                            color: active ? "#ffffff" : "var(--color-text-2)",
                            border: `1px solid ${active ? "var(--color-brand)" : "var(--color-border)"}`,
                            cursor: "pointer",
                            transition: "all 150ms ease",
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right: Page Navigation Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="press-tactile"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 99,
                    border: "1px solid var(--color-border)",
                    background:
                      currentPage <= 1 ? "var(--color-surface-2)" : "var(--color-surface)",
                    color: currentPage <= 1 ? "var(--color-text-3)" : "var(--color-text)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    opacity: currentPage <= 1 ? 0.6 : 1,
                  }}
                  title="Halaman Sebelumnya"
                >
                  <CaretLeftIcon size={14} weight="bold" />
                  <span>Sebelumnya</span>
                </button>

                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "var(--color-text)",
                    padding: "0 6px",
                  }}
                >
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="press-tactile"
                  style={{
                    padding: "6px 14px",
                    borderRadius: 99,
                    border: "1px solid var(--color-border)",
                    background:
                      currentPage >= totalPages ? "var(--color-surface-2)" : "var(--color-surface)",
                    color: currentPage >= totalPages ? "var(--color-text-3)" : "var(--color-text)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    opacity: currentPage >= totalPages ? 0.6 : 1,
                  }}
                  title="Halaman Berikutnya"
                >
                  <span>Berikutnya</span>
                  <CaretRightIcon size={14} weight="bold" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Receipt Modal */}
      {selected && store && (
        <Modal onClose={() => setSelected(null)}>
          <div id="toku-receipt-content-tx" className="receipt-print">
            <Receipt tx={selected} storeName={store.name} />
          </div>
          <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button
              onClick={() => printReceipt("toku-receipt-content-tx")}
              className="press-tactile"
              style={{
                ...payBtnStyle,
                background: "var(--color-brand)",
                color: "#ffffff",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(234, 88, 12, 0.3)",
              }}
            >
              <PrinterIcon size={18} weight="bold" />
              Cetak Struk
            </button>
            <button
              onClick={() => setSelected(null)}
              className="press-tactile"
              style={{
                ...payBtnStyle,
                background: "var(--color-surface-2)",
                color: "var(--color-text)",
                flex: 1,
                border: "1px solid var(--color-border)",
              }}
            >
              Tutup
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Receipt({ tx, storeName }: { tx: any; storeName: string }) {
  const now = new Date(tx.createdAt);
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

        {tx.items.map((item: any, i: number) => (
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
              <div style={{ fontSize: 11, color: "#78716c" }}>
                {item.qty} x <span className="price">{formatIDR(item.price)}</span>
              </div>
            </div>
            <span className="price" style={{ fontSize: 13, fontWeight: 800, color: "#1c1917" }}>
              {formatIDR(item.price * item.qty)}
            </span>
          </div>
        ))}
      </div>

      {/* Payment Details */}
      <div
        style={{
          borderTop: "2px dashed #e5e5e5",
          paddingTop: 14,
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
                {formatIDR(tx.cashPaid)}
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
                {formatIDR(tx.change)}
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

function Loader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <PackageIcon size={48} color="var(--color-brand)" weight="duotone" style={{ opacity: 0.5 }} />
      <p style={{ color: "var(--color-text-2)", fontSize: 14, fontWeight: 700 }}>
        Memuat riwayat transaksi...
      </p>
    </div>
  );
}

const payBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 20px",
  border: "none",
  borderRadius: 99,
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
  color: "#ffffff",
};

const thStyle: React.CSSProperties = {
  padding: "14px 18px",
  fontSize: 12,
  fontWeight: 800,
  color: "var(--color-text-3)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "16px 18px",
  fontSize: 14,
  color: "var(--color-text)",
  verticalAlign: "middle",
};
