import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  LockKeyIcon,
  XIcon,
  BackspaceIcon,
  UserIcon,
  CaretLeftIcon,
  ShieldCheckIcon,
  CrownIcon,
  StorefrontIcon,
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
  const [mounted, setMounted] = useState(false);
  const [pin, setPin] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [isErrorShake, setIsErrorShake] = useState(false);

  const cashiers = useQuery(api.cashiers.listByStore, storeId ? { storeId } : "skip");

  const activeCashiers = (cashiers ?? []).filter((c) => c.active !== false);

  // Filter if requiredRole is set
  const eligibleCashiers = activeCashiers.filter((c) => {
    if (requiredRole === "owner") return c.role === "owner";
    if (requiredRole === "manager") return c.role === "owner" || c.role === "manager";
    return true;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and auto-select if 1 staff
  useEffect(() => {
    if (isOpen) {
      setPin("");
      setIsErrorShake(false);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      if (eligibleCashiers.length === 1) {
        setSelectedStaff(eligibleCashiers[0]);
      } else if (!selectedStaff && eligibleCashiers.length > 1) {
        setSelectedStaff(null);
      }

      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen, eligibleCashiers.length]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const triggerError = (msg: string) => {
    toast.error(msg);
    setIsErrorShake(true);
    setTimeout(() => {
      setPin("");
      setIsErrorShake(false);
    }, 400);
  };

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
    // 1. Fallback when store has no cashiers configured
    if (!cashiers || cashiers.length === 0) {
      if (pinToCheck === "1234" || pinToCheck === "0000") {
        toast.success("Login sebagai Pemilik Toko");
        onSuccess({ name: "Pemilik Toko", role: "owner" });
        onClose();
        setPin("");
        return;
      }
      triggerError("PIN Salah (Default: 1234 atau tambahkan kasir di Pengaturan)");
      return;
    }

    // 2. Targeted verification if staff is selected
    if (selectedStaff) {
      if (selectedStaff.pin !== pinToCheck) {
        triggerError(`PIN salah untuk ${selectedStaff.name}. Coba lagi.`);
        return;
      }

      toast.success(`Selamat bertugas, ${selectedStaff.name}!`);
      onSuccess({
        id: selectedStaff._id,
        name: selectedStaff.name,
        role: selectedStaff.role,
      });
      onClose();
      setPin("");
      return;
    }

    // 3. Fallback direct PIN search
    const matched = activeCashiers.find((c) => c.pin === pinToCheck);
    if (!matched) {
      triggerError("PIN Kasir Tidak Dikenal");
      return;
    }

    if (requiredRole && requiredRole === "owner" && matched.role !== "owner") {
      triggerError("Akses Ditolak: Memerlukan akun Pemilik Toko");
      return;
    }

    if (
      requiredRole &&
      requiredRole === "manager" &&
      matched.role !== "owner" &&
      matched.role !== "manager"
    ) {
      triggerError("Akses Ditolak: Memerlukan akun Manager / Owner");
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return {
          label: "Pemilik (Owner)",
          bg: "rgba(234, 88, 12, 0.12)",
          color: "var(--color-brand)",
          icon: CrownIcon,
        };
      case "manager":
        return {
          label: "Manager",
          bg: "rgba(59, 130, 246, 0.12)",
          color: "#2563eb",
          icon: ShieldCheckIcon,
        };
      default:
        return {
          label: "Staf Kasir",
          bg: "rgba(16, 185, 129, 0.12)",
          color: "#059669",
          icon: UserIcon,
        };
    }
  };

  const currentStaffBadge = selectedStaff ? getRoleBadge(selectedStaff.role) : null;
  const StaffRoleIcon = currentStaffBadge?.icon;

  // Whether we should show staff selection screen (only when > 1 staff and none picked)
  const showStaffList = !selectedStaff && eligibleCashiers.length > 1;

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
      {/* Main Dialog Card */}
      <div
        className="animate-scale-up"
        style={{
          position: "relative",
          background: "var(--color-surface)",
          borderRadius: 24,
          border: "1.5px solid var(--color-border)",
          width: "100%",
          maxWidth: showStaffList ? 400 : 340,
          padding: showStaffList ? "24px 20px" : "28px 24px 24px",
          boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--color-border)",
          zIndex: 100000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="press-tactile"
          title="Tutup"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: 99,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--color-text-2)",
            transition: "all 120ms ease",
          }}
        >
          <XIcon size={16} weight="bold" />
        </button>

        {/* ============================================================== */}
        {/* VIEW 1: STAFF SELECTION (Only when multiple eligible cashiers) */}
        {/* ============================================================== */}
        {showStaffList ? (
          <div style={{ width: "100%" }}>
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
                margin: "0 auto 12px",
              }}
            >
              <StorefrontIcon size={24} weight="bold" />
            </div>

            <h3
              style={{
                fontSize: 18,
                fontWeight: 900,
                margin: "0 0 4px",
                color: "var(--color-text)",
                textAlign: "center",
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-3)",
                margin: "0 0 16px",
                textAlign: "center",
              }}
            >
              Pilih akun staf untuk memasukkan PIN
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 280,
                overflowY: "auto",
                paddingRight: 2,
              }}
            >
              {eligibleCashiers.map((c) => {
                const badge = getRoleBadge(c.role);
                const Icon = badge.icon;
                return (
                  <div
                    key={c._id}
                    onClick={() => {
                      setSelectedStaff(c);
                      setPin("");
                    }}
                    className="press-tactile"
                    style={{
                      padding: "12px 14px",
                      borderRadius: 16,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface-2)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      transition: "all 120ms ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 99,
                          background: badge.bg,
                          color: badge.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: "var(--color-text)" }}>
                          {c.name}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: badge.color,
                              background: badge.bg,
                              padding: "1px 6px",
                              borderRadius: 6,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <Icon size={11} weight="bold" />
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "var(--color-brand)",
                        background: "var(--color-brand-light)",
                        padding: "4px 10px",
                        borderRadius: 99,
                      }}
                    >
                      Pilih ➔
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* VIEW 2: NUMERIC KEYPAD & PIN INPUT FOR SELECTED STAFF          */
          /* ============================================================== */
          <>
            {/* Top Switcher Button (Only if there are multiple staff options) */}
            {eligibleCashiers.length > 1 && (
              <button
                onClick={() => {
                  setSelectedStaff(null);
                  setPin("");
                }}
                className="press-tactile"
                style={{
                  position: "absolute",
                  top: 14,
                  left: 14,
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 99,
                  padding: "4px 10px",
                  color: "var(--color-brand)",
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <CaretLeftIcon size={12} weight="bold" />
                Ganti Staf
              </button>
            )}

            {/* Staff Avatar / Crown Icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 99,
                background: currentStaffBadge ? currentStaffBadge.bg : "var(--color-brand-light)",
                color: currentStaffBadge ? currentStaffBadge.color : "var(--color-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "4px auto 10px",
                fontSize: selectedStaff ? 17 : 24,
                fontWeight: 900,
                boxShadow: "0 4px 12px rgba(234, 88, 12, 0.15)",
              }}
            >
              {selectedStaff ? (
                selectedStaff.name.slice(0, 2).toUpperCase()
              ) : (
                <LockKeyIcon size={24} weight="bold" />
              )}
            </div>

            {/* Staff Name & Title */}
            <h3
              style={{
                fontSize: 17,
                fontWeight: 900,
                margin: "0 0 3px",
                color: "var(--color-text)",
                textAlign: "center",
                letterSpacing: "-0.01em",
              }}
            >
              {selectedStaff ? selectedStaff.name : title}
            </h3>

            {/* Role Badge Pill */}
            {currentStaffBadge && StaffRoleIcon && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: currentStaffBadge.color,
                    background: currentStaffBadge.bg,
                    padding: "2px 8px",
                    borderRadius: 99,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <StaffRoleIcon size={12} weight="bold" />
                  {currentStaffBadge.label}
                </span>
              </div>
            )}

            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-3)",
                margin: "0 0 16px",
                textAlign: "center",
              }}
            >
              Masukkan 4 digit PIN kasir
            </p>

            {/* PIN Indicators Dots with Shake on error */}
            <div
              style={{
                display: "flex",
                gap: 14,
                marginBottom: 20,
                transform: isErrorShake ? "translateX(-6px)" : "none",
                transition: "transform 100ms ease",
              }}
            >
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pin.length > idx;
                return (
                  <div
                    key={idx}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 99,
                      background: isFilled
                        ? isErrorShake
                          ? "var(--color-danger)"
                          : "var(--color-brand)"
                        : "var(--color-surface-2)",
                      border: `2px solid ${
                        isFilled
                          ? isErrorShake
                            ? "var(--color-danger)"
                            : "var(--color-brand)"
                          : "var(--color-border)"
                      }`,
                      transition: "all 140ms ease",
                      transform: isFilled ? "scale(1.2)" : "scale(1)",
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
                gap: 8,
                width: "100%",
                maxWidth: 240,
              }}
            >
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  onClick={() => handleDigit(num)}
                  className="press-tactile"
                  style={{
                    height: 48,
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
                    fontFamily: "inherit",
                  }}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="press-tactile"
                style={{
                  height: 48,
                  borderRadius: 14,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-2)",
                  fontSize: 11,
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
                  height: 48,
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
                  fontFamily: "inherit",
                }}
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="press-tactile"
                style={{
                  height: 48,
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
                <BackspaceIcon size={18} weight="bold" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
