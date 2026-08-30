import { Modal } from "#/components/Modal";
import { printReceipt } from "#/lib/print";
import { useAppStore } from "#/lib/store-context";
import { formatDate, formatIDR, calculateItemDiscount } from "#/lib/utils";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  MoneyIcon,
  PackageIcon,
  PrinterIcon,
  QrCodeIcon,
  ReceiptIcon,
  XCircleIcon,
  ArrowCounterClockwiseIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/_app/transaksi")({ component: Transaksi });

const CANCEL_REASONS = [
  { id: "retur_barang", label: "Pelanggan Meretur Barang / Produk Rusak" },
  { id: "salah_input", label: "Salah Input Pesanan / Kesalahan Kasir" },
  { id: "batal_bayar", label: "Pembayaran Dibatalkan / Batal Transaksi" },
  { id: "lainnya", label: "Alasan Lainnya (Tulis Catatan)" },
];

function Transaksi() {
  const { store, currentCashier } = useAppStore();
  const transactions = useQuery(api.transactions.list, store ? { storeId: store._id } : "skip");
  const cancelTxMutation = useMutation(api.transactions.cancel);

  const [selected, setSelected] = useState<any>(null);
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "cancelled">("all");

  // Cancel Modal State
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);
  const [selectedReasonId, setSelectedReasonId] = useState<string>("retur_barang");
  const [customReasonNote, setCustomReasonNote] = useState<string>("");
  const [cancelling, setCancelling] = useState(false);

  if (!transactions) return <Loader />;

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    if (statusFilter === "completed") return t.status !== "cancelled";
    if (statusFilter === "cancelled") return t.status === "cancelled";
    return true;
  });

  const totalCount = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const pagedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const completedCount = transactions.filter((t) => t.status !== "cancelled").length;
  const cancelledCount = transactions.filter((t) => t.status === "cancelled").length;

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleOpenCancel = (tx: any) => {
    setCancelTarget(tx);
    setSelectedReasonId("retur_barang");
    setCustomReasonNote("");
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    const reasonObj = CANCEL_REASONS.find((r) => r.id === selectedReasonId);
    let finalReason = reasonObj?.label || "Pembatalan pesanan";
    if (customReasonNote.trim()) {
      finalReason += ` — ${customReasonNote.trim()}`;
    }

    try {
      setCancelling(true);
      await cancelTxMutation({
        id: cancelTarget._id as Id<"transactions">,
        reason: finalReason,
        cancelledBy: currentCashier?.name || "Kasir",
      });
      toast.success("Transaksi berhasil dibatalkan!", {
        description: "Stok produk telah dikembalikan otomatis ke inventaris toko.",
      });
      setCancelTarget(null);
      if (selected && selected._id === cancelTarget._id) {
        setSelected({
          ...selected,
          status: "cancelled",
          cancelledAt: Date.now(),
          cancelReason: finalReason,
          cancelledBy: currentCashier?.name || "Kasir",
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal membatalkan transaksi.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
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
            {transactions.length} total transaksi tercatat ({completedCount} selesai, {cancelledCount} dibatalkan)
          </p>
        </div>

        {/* Filter Status Tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            background: "var(--color-surface-2)",
            padding: 4,
            borderRadius: 99,
            border: "1px solid var(--color-border)",
          }}
        >
          {[
            { key: "all", label: "Semua", count: transactions.length },
            { key: "completed", label: "Selesai", count: completedCount },
            { key: "cancelled", label: "Dibatalkan", count: cancelledCount },
          ].map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key as any);
                  setPage(1);
                }}
                className="press-tactile"
                style={{
                  padding: "6px 14px",
                  borderRadius: 99,
                  border: "none",
                  background: active ? "var(--color-brand)" : "transparent",
                  color: active ? "#ffffff" : "var(--color-text-2)",
                  fontSize: 12,
                  fontWeight: active ? 800 : 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 150ms ease",
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 99,
                    background: active ? "rgba(255,255,255,0.25)" : "var(--color-surface)",
                    color: active ? "#ffffff" : "var(--color-text-3)",
                    fontWeight: 800,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
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
            {statusFilter === "cancelled"
              ? "Tidak ada transaksi yang dibatalkan."
              : "Belum ada transaksi pada daftar ini."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View (> 768px) */}
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
                    const itemsSummary = tx.items.map((i: any) => `${i.qty}x ${i.name}`).join(", ");
                    const txNumber = totalCount - (startIndex + idx);
                    const isCancelled = tx.status === "cancelled";

                    return (
                      <tr
                        key={tx._id}
                        onClick={() => setSelected(tx)}
                        className="press-tactile tx-table-row"
                        style={{
                          borderBottom: "1px solid var(--color-border-subtle)",
                          cursor: "pointer",
                          transition: "background 150ms ease",
                          opacity: isCancelled ? 0.75 : 1,
                          background: isCancelled ? "rgba(239, 68, 68, 0.03)" : "transparent",
                        }}
                      >
                        <td style={tdStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              style={{
                                fontWeight: 800,
                                fontSize: 13,
                                color: isCancelled ? "var(--color-danger)" : "var(--color-brand)",
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
                                <MoneyIcon size={14} weight="bold" />
                              ) : (
                                <QrCodeIcon size={14} weight="bold" />
                              )}
                              {tx.paymentMethod === "cash" ? "Tunai" : "QRIS"}
                            </span>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div
                            style={{
                              fontSize: 13,
                              color: "var(--color-text-2)",
                              maxWidth: 240,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={itemsSummary}
                          >
                            {itemsSummary}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "right" }}>
                          <span
                            className="price"
                            style={{
                              fontWeight: 800,
                              fontSize: 14,
                              color: isCancelled ? "var(--color-danger)" : "var(--color-text)",
                              textDecoration: isCancelled ? "line-through" : "none",
                            }}
                          >
                            {formatIDR(tx.total)}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: "center" }}>
                          {isCancelled ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                background: "rgba(239, 68, 68, 0.12)",
                                color: "var(--color-danger)",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              <XCircleIcon size={14} weight="fill" />
                              DIBATALKAN
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                background: "var(--color-success-light)",
                                color: "var(--color-success-text)",
                                padding: "3px 10px",
                                borderRadius: 99,
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              <CheckCircleIcon size={14} weight="fill" />
                              SELESAI
                            </span>
                          )}
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
                            Rincian
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Phone Card View (<= 768px) */}
          <div className="mobile-only" style={{ width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pagedTransactions.map((tx, idx) => {
                const txNumber = totalCount - (startIndex + idx);
                const isCancelled = tx.status === "cancelled";

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
                      opacity: isCancelled ? 0.75 : 1,
                      border: isCancelled ? "1px solid rgba(239, 68, 68, 0.3)" : undefined,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 99,
                          background: isCancelled
                            ? "rgba(239, 68, 68, 0.1)"
                            : tx.paymentMethod === "cash"
                              ? "var(--color-brand-light)"
                              : "var(--color-qris-bg)",
                          color: isCancelled
                            ? "var(--color-danger)"
                            : tx.paymentMethod === "cash"
                              ? "var(--color-brand)"
                              : "var(--color-qris-text)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {isCancelled ? (
                          <XCircleIcon size={22} weight="fill" />
                        ) : tx.paymentMethod === "cash" ? (
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
                              color: isCancelled ? "var(--color-danger)" : "var(--color-brand)",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Penjualan #{txNumber}
                          </span>
                          {isCancelled && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                background: "rgba(239, 68, 68, 0.15)",
                                color: "var(--color-danger)",
                                padding: "2px 8px",
                                borderRadius: 99,
                              }}
                            >
                              DIBATALKAN
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
                        style={{
                          fontSize: 17,
                          fontWeight: 800,
                          color: isCancelled ? "var(--color-danger)" : "var(--color-text)",
                          textDecoration: isCancelled ? "line-through" : "none",
                        }}
                      >
                        {formatIDR(tx.total)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 24,
                padding: "12px 16px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div style={{ fontSize: 13, color: "var(--color-text-3)", fontWeight: 600 }}>
                Menampilkan {startIndex + 1} - {endIndex} dari {totalCount} transaksi
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface-2)",
                    color: "var(--color-text)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <option value={10}>10 baris</option>
                  <option value={20}>20 baris</option>
                  <option value={50}>50 baris</option>
                </select>

                <button
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

                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)", padding: "0 4px" }}>
                  {currentPage} / {totalPages}
                </span>

                <button
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

      {/* Receipt Details Modal */}
      {selected && store && (
        <Modal onClose={() => setSelected(null)}>
          <div id="toku-receipt-content-tx" className="receipt-print">
            <Receipt tx={selected} storeName={store.name} />
          </div>

          <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
            <div style={{ display: "flex", gap: 10 }}>
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

            {/* Cancel Action Button (Only for non-cancelled transactions) */}
            {selected.status !== "cancelled" && (
              <button
                onClick={() => handleOpenCancel(selected)}
                className="press-tactile"
                style={{
                  padding: "10px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  background: "rgba(239, 68, 68, 0.08)",
                  color: "var(--color-danger)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 150ms ease",
                }}
              >
                <ArrowCounterClockwiseIcon size={16} weight="bold" />
                Batalkan Transaksi / Retur Barang (Kembalikan Stok)
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <Modal onClose={() => !cancelling && setCancelTarget(null)}>
          <div style={{ maxWidth: 440 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 99,
                background: "rgba(239, 68, 68, 0.12)",
                color: "var(--color-danger)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <WarningCircleIcon size={28} weight="bold" />
            </div>

            <h3
              style={{
                fontSize: 18,
                fontWeight: 900,
                textAlign: "center",
                margin: "0 0 8px",
                color: "var(--color-text)",
              }}
            >
              Batalkan Transaksi & Retur Stok?
            </h3>

            <p style={{ fontSize: 13, color: "var(--color-text-2)", textAlign: "center", margin: "0 0 20px" }}>
              Transaksi senilai <strong style={{ color: "var(--color-text)" }}>{formatIDR(cancelTarget.total)}</strong> akan ditandai sebagai batal. Seluruh stok ({cancelTarget.items.reduce((s: number, i: any) => s + i.qty, 0)} item) akan otomatis dikembalikan ke inventaris.
            </p>

            {/* Select Reason */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-text)", marginBottom: 8 }}>
                Pilih Alasan Pembatalan:
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {CANCEL_REASONS.map((r) => {
                  const selected = selectedReasonId === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedReasonId(r.id)}
                      className="press-tactile"
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: selected
                          ? "1.5px solid var(--color-brand)"
                          : "1px solid var(--color-border)",
                        background: selected ? "var(--color-brand-light)" : "var(--color-surface-2)",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: selected ? 800 : 600,
                        color: selected ? "var(--color-brand)" : "var(--color-text)",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        transition: "all 120ms ease",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 99,
                          border: selected
                            ? "5px solid var(--color-brand)"
                            : "1.5px solid var(--color-text-3)",
                          background: "#ffffff",
                          boxSizing: "border-box",
                        }}
                      />
                      <span>{r.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional note */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--color-text)", marginBottom: 6 }}>
                Catatan Tambahan (Opsional):
              </label>
              <input
                type="text"
                value={customReasonNote}
                onChange={(e) => setCustomReasonNote(e.target.value)}
                placeholder="Contoh: Barang rusak saat dibuka pelanggan..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  fontSize: 13,
                  color: "var(--color-text)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="press-tactile"
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 99,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-2)",
                  color: "var(--color-text)",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="press-tactile"
                style={{
                  flex: 1.5,
                  padding: "12px",
                  borderRadius: 99,
                  border: "none",
                  background: "var(--color-danger)",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: cancelling ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  boxShadow: "0 4px 14px rgba(239, 68, 68, 0.35)",
                }}
              >
                <ArrowCounterClockwiseIcon size={16} weight="bold" />
                {cancelling ? "Membatalkan..." : "Ya, Batalkan & Retur"}
              </button>
            </div>
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
  const isCancelled = tx.status === "cancelled";

  return (
    <div className="receipt-paper">
      {/* Void Banner if Cancelled */}
      {isCancelled && (
        <div
          style={{
            border: "2px dashed #ef4444",
            background: "#fef2f2",
            padding: "10px 12px",
            borderRadius: 8,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          <div style={{ color: "#ef4444", fontWeight: 900, fontSize: 13, letterSpacing: "0.08em" }}>
            *** TRANSAKSI DIBATALKAN / VOID ***
          </div>
          {tx.cancelReason && (
            <div style={{ fontSize: 11, color: "#991b1b", marginTop: 4, fontWeight: 600 }}>
              Alasan: {tx.cancelReason}
            </div>
          )}
          {tx.cancelledBy && (
            <div style={{ fontSize: 10, color: "#b91c1c", marginTop: 2 }}>
              Dibatalkan oleh: {tx.cancelledBy} ({tx.cancelledAt ? formatDate(tx.cancelledAt) : ""})
            </div>
          )}
        </div>
      )}

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
            background: isCancelled ? "#ef4444" : "#ea580c",
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
            background: isCancelled ? "#fee2e2" : "#f5f5f4",
            border: isCancelled ? "1px solid #fca5a5" : "1px solid #e7e5e4",
            fontSize: 11,
            fontWeight: 800,
            color: isCancelled ? "#ef4444" : "#ea580c",
          }}
        >
          #{txId} {isCancelled && "(BATAL)"}
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

        {tx.items.map((item: any, i: number) => {
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
                <span
                  className="price"
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: isCancelled ? "#991b1b" : "#1c1917",
                    textDecoration: isCancelled ? "line-through" : "none",
                  }}
                >
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
          background: isCancelled ? "#fef2f2" : "#fff7ed",
          border: isCancelled ? "1.5px solid #ef4444" : "1.5px solid #ea580c",
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
            color: isCancelled ? "#ef4444" : "#ea580c",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {isCancelled ? "TOTAL DIBATALKAN" : "TOTAL BAYAR"}
        </span>
        <span
          className="price"
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: isCancelled ? "#ef4444" : "#ea580c",
            textDecoration: isCancelled ? "line-through" : "none",
          }}
        >
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
          {isCancelled ? "Bukti Pembatalan Transaksi" : "Terima kasih telah berbelanja!"}
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
};
const thStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: 11,
  fontWeight: 800,
  color: "var(--color-text-3)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: 13,
  color: "var(--color-text)",
};
