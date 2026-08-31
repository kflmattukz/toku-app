import {
  ArrowClockwiseIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  StorefrontIcon,
  WarningOctagonIcon,
  CaretDownIcon,
  CaretUpIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--color-surface-2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        className="bg-grid-pattern"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
      />
      <div className="hero-glow-1" style={{ opacity: 0.7 }} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          background: "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "40px 28px",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Icon & Code Badge */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "var(--color-brand-light)",
            border: "1.5px solid rgba(234, 88, 12, 0.2)",
            color: "var(--color-brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <MagnifyingGlassIcon size={36} weight="duotone" />
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: 99,
            background: "var(--color-brand-light)",
            color: "var(--color-brand-dark)",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 14,
            border: "1px solid rgba(234, 88, 12, 0.15)",
          }}
        >
          <span>404</span>
          <span>•</span>
          <span>Halaman Tidak Ditemukan</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(22px, 4vw, 26px)",
            fontWeight: 800,
            color: "var(--color-text)",
            margin: "0 0 10px",
            letterSpacing: "-0.02em",
          }}
        >
          Halaman Hilang dari Rak
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-2)",
            lineHeight: 1.6,
            margin: "0 0 28px",
          }}
        >
          Halaman atau tautan yang Anda tuju tidak ditemukan atau telah berpindah alamat.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <Link
            to="/kasir"
            className="press-tactile"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-brand)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              boxShadow: "var(--shadow-dock)",
              transition: "transform 0.15s ease",
            }}
          >
            <StorefrontIcon size={18} weight="bold" />
            <span>Kembali ke Kasir</span>
          </Link>

          <Link
            to="/"
            className="press-tactile"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-surface-2)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            <HouseIcon size={18} weight="bold" />
            <span>Halaman Utama</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ErrorPage({ error, reset }: { error?: Error | unknown; reset?: () => void }) {
  const [showDetails, setShowDetails] = useState(false);
  const errorMessage =
    error instanceof Error ? error.message : String(error || "Terjadi kesalahan tidak diketahui.");
  const errorStack = error instanceof Error ? error.stack : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--color-surface-2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        className="bg-grid-pattern"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
      />
      <div
        className="hero-glow-1"
        style={{
          opacity: 0.5,
          background: "radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 70%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
          background: "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "40px 28px",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Icon & Code Badge */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "var(--color-danger-light)",
            border: "1.5px solid rgba(239, 68, 68, 0.2)",
            color: "var(--color-danger)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <WarningOctagonIcon size={36} weight="duotone" />
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: 99,
            background: "var(--color-danger-light)",
            color: "var(--color-danger-text)",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 14,
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <span>500</span>
          <span>•</span>
          <span>Kendala Server / Sistem</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(22px, 4vw, 26px)",
            fontWeight: 800,
            color: "var(--color-text)",
            margin: "0 0 10px",
            letterSpacing: "-0.02em",
          }}
        >
          Terjadi Kendala Sistem
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-2)",
            lineHeight: 1.6,
            margin: "0 0 24px",
          }}
        >
          Aplikasi mengalami gangguan tak terduga saat memproses data. Silakan muat ulang atau
          kembali ke halaman utama.
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => {
              if (reset) {
                reset();
              } else {
                window.location.reload();
              }
            }}
            className="press-tactile"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-brand)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
              boxShadow: "var(--shadow-dock)",
              transition: "transform 0.15s ease",
            }}
          >
            <ArrowClockwiseIcon size={18} weight="bold" />
            <span>Muat Ulang Halaman</span>
          </button>

          <Link
            to="/"
            className="press-tactile"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-surface-2)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            <HouseIcon size={18} weight="bold" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Technical Details Accordion */}
        {errorMessage && (
          <div style={{ textAlign: "left", marginTop: 16 }}>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-text-3)",
                fontSize: 12,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span>Detail Teknis</span>
              {showDetails ? <CaretUpIcon size={12} /> : <CaretDownIcon size={12} />}
            </button>

            {showDetails && (
              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-surface-3)",
                  border: "1px solid var(--color-border)",
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "var(--color-danger-text)",
                  maxHeight: 160,
                  overflowY: "auto",
                  wordBreak: "break-all",
                  whiteSpace: "pre-wrap",
                }}
              >
                {errorMessage}
                {errorStack && `\n\n${errorStack}`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
