import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  LockKeyIcon,
  XIcon,
  BackspaceIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";
import type { ActiveCashier } from "#/lib/store-context";

interface CashierLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: Id<"stores">;
  onSuccess: (cashier: ActiveCashier) => void;
  requiredRole?: "owner" | "manager";
  title?: string;
}

export function CashierLockModal({
  isOpen,
  onClose,
  storeId,
  onSuccess,
  requiredRole,
  title = "Masuk PIN Kasir",
}: CashierLockModalProps) {
  const [pin, setPin] = useState("");
  const cashiers = useQuery(api.cashiers.listByStore, storeId ? { storeId } : "skip");

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === 4) {
      verifyPinInput(nextPin);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
  };

  const verifyPinInput = (pinToCheck: string) => {
    if (!cashiers || cashiers.length === 0) {
      // Default owner PIN fallback if no cashiers added yet
      if (pinToCheck === "1234" || pinToCheck === "0000") {
        toast.success("Login sebagai Pemilik Toko");
        onSuccess({ name: "Pemilik Toko", role: "owner" });
        onClose();
        setPin("");
        return;
      }
      toast.error("PIN Salah (Default: 1234 atau tambahkan kasir di Pengaturan)");
      setPin("");
      return;
    }

    const matched = cashiers.find((c) => c.pin === pinToCheck && c.active);
    if (!matched) {
      toast.error("PIN Kasir Salah");
      setPin("");
      return;
    }

    if (requiredRole && requiredRole === "owner" && matched.role !== "owner") {
      toast.error("Akses Ditolak: Memerlukan PIN Owner / Pemilik");
      setPin("");
      return;
    }

    if (
      requiredRole &&
      requiredRole === "manager" &&
      matched.role !== "owner" &&
      matched.role !== "manager"
    ) {
      toast.error("Akses Ditolak: Memerlukan PIN Manager / Owner");
      setPin("");
      return;
    }

    toast.success(`Selamat bertugas, ${matched.name}!`);
    onSuccess({
      id: matched._id,
      name: matched.name,
      role: matched.role,
    });
    onClose();
    setPin("");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        className="animate-backdrop"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      <div
        className="animate-scale-up"
        style={{
          position: "relative",
          background: "var(--color-surface)",
          borderRadius: 24,
          border: "1px solid var(--color-border)",
          width: "100%",
          maxWidth: 360,
          padding: 24,
          boxShadow: "var(--shadow-xl)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <button
          onClick={onClose}
          className="press-tactile"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
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

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 99,
            background: "var(--color-brand-light)",
            color: "var(--color-brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <LockKeyIcon size={24} weight="bold" />
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px", color: "var(--color-text)" }}>
          {title}
        </h3>
        <p style={{ fontSize: 12, color: "var(--color-text-3)", margin: "0 0 20px", textAlign: "center" }}>
          Masukkan 4 digit PIN kasir untuk melanjutkan
        </p>

        {/* PIN Indicators */}
        <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 99,
                  background: isFilled ? "var(--color-brand)" : "var(--color-surface-2)",
                  border: `2px solid ${isFilled ? "var(--color-brand)" : "var(--color-border)"}`,
                  transition: "all 150ms ease",
                  transform: isFilled ? "scale(1.15)" : "scale(1)",
                }}
              />
            );
          })}
        </div>

        {/* Numeric Keypad */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            width: "100%",
            maxWidth: 260,
          }}
        >
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="press-tactile"
              style={{
                height: 52,
                borderRadius: 14,
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-2)",
                fontSize: 20,
                fontWeight: 800,
                color: "var(--color-text)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="press-tactile"
            style={{
              height: 52,
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-2)",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-text-3)",
              cursor: "pointer",
            }}
          >
            Hapus
          </button>
          <button
            onClick={() => handleDigit("0")}
            className="press-tactile"
            style={{
              height: 52,
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-2)",
              fontSize: 20,
              fontWeight: 800,
              color: "var(--color-text)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="press-tactile"
            style={{
              height: 52,
              borderRadius: 14,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-2)",
              fontSize: 18,
              color: "var(--color-text-2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BackspaceIcon size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
