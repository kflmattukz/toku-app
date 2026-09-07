import {
  ArrowRightIcon,
  CheckCircleIcon,
  GoogleLogoIcon,
  LightningIcon,
  StorefrontIcon,
  WifiHighIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface LandingHeroProps {
  session: unknown;
  onGoogleLogin: () => void;
}

export function LandingHero({ session, onGoogleLogin }: LandingHeroProps) {
  const containerRef = useScrollReveal<HTMLElement>({ threshold: 0.05, staggerDelay: 80 });

  return (
    <section
      ref={containerRef}
      style={{
        textAlign: "center",
        padding: "40px 20px 44px",
        maxWidth: 920,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Eyebrow badge */}
      <div
        className="reveal-init"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "var(--color-brand-light)",
          color: "var(--color-brand)",
          padding: "6px 18px",
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 800,
          marginBottom: 24,
          border: "1.5px solid var(--color-brand)",
          boxShadow: "0 2px 10px rgba(234, 88, 12, 0.15)",
        }}
      >
        <WifiHighIcon size={16} weight="fill" />
        KASIR DIGITAL OFFLINE-FIRST POS #1 MAKASSAR
      </div>

      {/* Main Title */}
      <h1
        className="reveal-init"
        style={{
          fontSize: "clamp(36px, 6.5vw, 62px)",
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: "-0.035em",
          color: "var(--color-text)",
          margin: "0 0 22px",
        }}
      >
        Kelola warungmu{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #EA580C 0%, #F97316 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          cepat & tanpa ribet
        </span>
      </h1>

      {/* Subtitle */}
      <p
        className="reveal-init"
        style={{
          fontSize: "clamp(16px, 2.2vw, 19px)",
          color: "var(--color-text-2)",
          lineHeight: 1.6,
          margin: "0 auto 34px",
          maxWidth: 660,
          fontWeight: 500,
        }}
      >
        Aplikasi Kasir POS Modern untuk UMKM Makassar. Gantikan buku catatan dengan sistem kasir
        otomatis yang tetap berjalan lancar meskipun internet mati.
      </p>

      {/* CTA Buttons */}
      <div
        className="reveal-init"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        {session ? (
          <Link
            to="/kasir"
            className="press-tactile"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              background: "var(--color-brand)",
              color: "#ffffff",
              border: "none",
              borderRadius: 99,
              padding: "10px 10px 10px 28px",
              fontWeight: 800,
              fontSize: 16,
              textDecoration: "none",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(234, 88, 12, 0.35)",
            }}
          >
            <span>Buka Dashboard Kasir</span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 99,
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowRightIcon size={16} weight="bold" />
            </div>
          </Link>
        ) : (
          <button
            onClick={onGoogleLogin}
            className="press-tactile"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              background: "var(--color-brand)",
              color: "#ffffff",
              border: "none",
              borderRadius: 99,
              padding: "10px 10px 10px 28px",
              fontWeight: 800,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(234, 88, 12, 0.35)",
            }}
          >
            <GoogleLogoIcon size={20} weight="bold" />
            <span>Mulai Gratis Sekarang</span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 99,
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowRightIcon size={16} weight="bold" />
            </div>
          </button>
        )}
      </div>

      {/* Trust & Features Micro Pills */}
      <div
        className="reveal-init"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          flexWrap: "wrap",
          fontSize: 13,
          color: "var(--color-text-3)",
          fontWeight: 600,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <CheckCircleIcon size={16} weight="fill" color="var(--color-brand)" /> Gratis Selamanya
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <CheckCircleIcon size={16} weight="fill" color="var(--color-brand)" /> Bisa Digunakan Offline
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <CheckCircleIcon size={16} weight="fill" color="var(--color-brand)" /> Cetak Struk 58/80mm
        </span>
      </div>

      {/* Floating social proof pill */}
      <div
        className="reveal-init"
        style={{
          marginTop: 20,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          padding: "6px 16px",
          borderRadius: 99,
          fontSize: 12,
          fontWeight: 700,
          color: "var(--color-text-2)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <StorefrontIcon size={16} weight="fill" color="var(--color-brand)" />
        <span>Dipercaya oleh ratusan pemilik toko & warung kopi di Makassar</span>
      </div>
    </section>
  );
}
