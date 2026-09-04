import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "@phosphor-icons/react";

export function Modal({
  children,
  onClose,
  maxWidth = 520,
  showCloseButton = true,
  noPadding = false,
}: {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: number | string;
  showCloseButton?: boolean;
  noPadding?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="animate-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        minHeight: "100dvh",
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
        boxSizing: "border-box",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`animate-modal ${noPadding ? "" : "custom-scrollbar"}`}
        style={{
          background: "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: noPadding ? 0 : "28px 24px",
          width: "100%",
          maxWidth,
          boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--color-border)",
          maxHeight: "min(calc(100dvh - 24px), calc(100vh - 24px))",
          overflow: noPadding ? "hidden" : undefined,
          overflowX: "hidden",
          overflowY: noPadding ? "hidden" : "auto",
          display: noPadding ? "flex" : undefined,
          flexDirection: noPadding ? "column" : undefined,
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="press-tactile"
            aria-label="Tutup"
            style={{
              position: "absolute",
              top: 25,
              right: 25,
              width: 32,
              height: 32,
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: 99,
              cursor: "pointer",
              color: "var(--color-text-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              zIndex: 10,
            }}
          >
            <XIcon size={16} weight="bold" />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
