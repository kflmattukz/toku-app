import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ClockCounterClockwiseIcon,
  XIcon,
  MoneyIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";
import type { ActiveCashier } from "#/lib/store-context";

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: Id<"stores">;
  currentCashier: ActiveCashier | null;
}

export function ShiftModal({ isOpen, onClose, storeId, currentCashier }: ShiftModalProps) {
  const [mounted, setMounted] = useState(false);
  const activeShift = useQuery(api.shifts.getActive, storeId ? { storeId } : "skip");
  const startShift = useMutation(api.shifts.startShift);
  const endShift = useMutation(api.shifts.endShift);

  const [startingCash, setStartingCash] = useState<string>("");
  const [actualCash, setActualCash] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const handleStartShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(startingCash.replace(/\D/g, "")) || 0;
    try {
      setIsLoading(true);
      await startShift({
        storeId,
        cashierId: currentCashier?.id as any,
        cashierName: currentCashier?.name || "Kasir",
        startingCash: amount,
      });
      toast.success("Shift kasir berhasil dibuka! Selamat bertransaksi.");
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Gagal membuka shift");
      setIsLoading(false);
    }
  };

  const handleEndShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    const amount = Number(actualCash.replace(/\D/g, "")) || 0;
    try {
      setIsLoading(true);
      const res = await endShift({
        shiftId: activeShift._id,
        actualCash: amount,
        notes: notes || undefined,
      });
      setSummaryResult(res);
      toast.success("Shift kasir berhasil ditutup!");
      setIsLoading(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal menutup shift");
      setIsLoading(false);
    }
  };

  return createPortal(
    <div
      className="animate-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-scale-up"
        style={{
          position: "relative",
          background: "var(--color-surface)",
          borderRadius: 24,
          border: "1.5px solid var(--color-border)",
          width: "100%",
          maxWidth: 460,
          padding: 24,
          boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--color-border)",
          zIndex: 100000,
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={() => {
            setSummaryResult(null);
            onClose();
          }}
          className="press-tactile"
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: 99,
            padding: 6,
            cursor: "pointer",
            color: "var(--color-text-2)",
          }}
        >
          <XIcon size={16} />
        </button>

        {/* Closed Shift Summary Display */}
        {summaryResult ? (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 99,
                  background: "rgba(34, 197, 94, 0.15)",
                  color: "#16a34a",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <CheckCircleIcon size={30} weight="fill" />
              </div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  margin: "0 0 4px",
                  color: "var(--color-text)",
                }}
              >
                Rekap Tutup Shift Kasir
              </h3>
              <p style={{ fontSize: 13, color: "var(--color-text-3)", margin: 0 }}>
                Shift kasir resmi selesai dan tercatat ke sistem
              </p>
            </div>

            <div
              style={{
                background: "var(--color-surface-2)",
                borderRadius: 16,
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 20,
                border: "1px solid var(--color-border)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--color-text-3)" }}>Kas Awal:</span>
                <span style={{ fontWeight: 700, color: "var(--color-text)" }}>
                  Rp {summaryResult.startingCash.toLocaleString("id-ID")}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--color-text-3)" }}>Penjualan Kas (Tunai):</span>
                <span style={{ fontWeight: 700, color: "var(--color-text)" }}>
                  Rp {summaryResult.cashSales.toLocaleString("id-ID")}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                  fontWeight: 800,
                  borderTop: "1px dashed var(--color-border)",
                  paddingTop: 10,
                }}
              >
                <span style={{ color: "var(--color-text)" }}>Ekspektasi Kas Sistem:</span>
                <span style={{ color: "var(--color-brand)" }}>
                  Rp {summaryResult.expectedCash.toLocaleString("id-ID")}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--color-text-3)" }}>Kas Fisik Aktual:</span>
                <span style={{ fontWeight: 700, color: "var(--color-text)" }}>
                  Rp {summaryResult.actualCash.toLocaleString("id-ID")}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  fontWeight: 800,
                  color:
                    summaryResult.difference === 0
                      ? "#16a34a"
                      : summaryResult.difference > 0
                        ? "#2563eb"
                        : "#dc2626",
                }}
              >
                <span>Selisih Kas:</span>
                <span>
                  {summaryResult.difference > 0 ? "+" : ""}Rp{" "}
                  {summaryResult.difference.toLocaleString("id-ID")}
                  {summaryResult.difference === 0
                    ? " (Pas)"
                    : summaryResult.difference > 0
                      ? " (Lebih)"
                      : " (Kurang)"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setSummaryResult(null);
                onClose();
              }}
              className="press-tactile"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 14,
                border: "none",
                background: "var(--color-brand)",
                color: "#ffffff",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Selesai
            </button>
          </div>
        ) : !activeShift ? (
          /* Start Shift Form */
          <form onSubmit={handleStartShift}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 99,
                  background: "var(--color-brand-light)",
                  color: "var(--color-brand)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <MoneyIcon size={24} weight="bold" />
              </div>
              <h3
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  margin: "0 0 4px",
                  color: "var(--color-text)",
                }}
              >
                Buka Shift Kasir
              </h3>
              <p style={{ fontSize: 12, color: "var(--color-text-3)", margin: 0 }}>
                Kasir aktif: <strong>{currentCashier?.name || "Kasir"}</strong>
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--color-text-2)",
                  marginBottom: 8,
                }}
              >
                Modal Awal Kas Kecil (Rp):
              </label>
              <input
                type="number"
                value={startingCash}
                onChange={(e) => setStartingCash(e.target.value)}
                placeholder="Contoh: 100000"
                required
                min="0"
                step="1000"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-2)",
                  color: "var(--color-text)",
                  fontSize: 16,
                  fontWeight: 800,
                  boxSizing: "border-box",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: "var(--color-text-3)",
                  marginTop: 4,
                  display: "block",
                }}
              >
                Uang kembalian awal di laci kasir saat toko mulai buka
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="press-tactile"
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 14,
                border: "none",
                background: "var(--color-brand)",
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 800,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Membuka Shift..." : "Mulai Shift Kasir"}
            </button>
          </form>
        ) : (
          /* End Shift Form */
          <form onSubmit={handleEndShift}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 99,
                  background: "rgba(234, 88, 12, 0.12)",
                  color: "var(--color-brand)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <ClockCounterClockwiseIcon size={24} weight="bold" />
              </div>
              <h3
                style={{
                  fontSize: 19,
                  fontWeight: 800,
                  margin: "0 0 4px",
                  color: "var(--color-text)",
                }}
              >
                Tutup Shift Kasir
              </h3>
              <p style={{ fontSize: 12, color: "var(--color-text-3)", margin: 0 }}>
                Shift dibuka sejak:{" "}
                {new Date(activeShift.startedAt).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div
              style={{
                background: "var(--color-surface-2)",
                borderRadius: 14,
                padding: "12px 14px",
                marginBottom: 16,
                fontSize: 13,
                color: "var(--color-text-2)",
                display: "flex",
                justifyContent: "space-between",
                border: "1px solid var(--color-border)",
              }}
            >
              <span>Modal Awal Kas:</span>
              <strong style={{ color: "var(--color-text)" }}>
                Rp {activeShift.startingCash.toLocaleString("id-ID")}
              </strong>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--color-text-2)",
                  marginBottom: 8,
                }}
              >
                Hitung Fisik Uang di Laci Kasir (Rp):
              </label>
              <input
                type="number"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                placeholder="Total uang kas saat ini"
                required
                min="0"
                step="1000"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-2)",
                  color: "var(--color-text)",
                  fontSize: 16,
                  fontWeight: 800,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-text-3)",
                  marginBottom: 6,
                }}
              >
                Catatan Shift (Opsional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Beli plastik kembalian Rp 10.000"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-2)",
                  color: "var(--color-text)",
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="press-tactile"
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 14,
                border: "none",
                background: "var(--color-danger, #dc2626)",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 800,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Menghitung Rekap..." : "Tutup Shift & Rekap Kas"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
