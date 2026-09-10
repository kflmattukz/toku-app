import { ArrowRightIcon, GoogleLogoIcon, SparkleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface LandingCtaProps {
  session: unknown;
  onGoogleLogin: () => void;
}

export function LandingCta({ session, onGoogleLogin }: LandingCtaProps) {
  const containerRef = useScrollReveal<HTMLElement>({ threshold: 0.1 });

  return (
    <section ref={containerRef} style={{ padding: "0 20px 80px", maxWidth: 960, margin: "0 auto" }}>
      <div
        className="reveal-init"
        style={{
          background: "linear-gradient(135deg, #EA580C 0%, #C2410C 100%)",
          borderRadius: "var(--radius-xl)",
          padding: "52px 24px",
          textAlign: "center",
          color: "#ffffff",
          boxShadow: "0 20px 48px -12px rgba(234, 88, 12, 0.45)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <SparkleIcon size={36} weight="fill" style={{ opacity: 0.9, marginBottom: 12 }} />
        <h2
          style={{
            fontSize: "clamp(26px, 5vw, 40px)",
            fontWeight: 800,
            margin: "0 0 14px",
            letterSpacing: "-0.025em",
          }}
        >
          Siap Modernkan Warungmu Hari Ini?
        </h2>
        <p
          style={{
            fontSize: 16,
            opacity: 0.92,
            maxWidth: 540,
            margin: "0 auto 28px",
            lineHeight: 1.6,
            fontWeight: 500,
          }}
        >
          Mulai jualan lebih cepat, rapi, dan otomatis tanpa biaya langganan sepeserpun.
        </p>

        {session ? (
          <Link
            to="/kasir"
            className="press-tactile"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "#ffffff",
              color: "#EA580C",
              padding: "12px 30px",
              borderRadius: 99,
              fontWeight: 800,
              fontSize: 16,
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            }}
          >
            <span>Buka Kasir Sekarang</span>
            <ArrowRightIcon size={18} weight="bold" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={onGoogleLogin}
            className="press-tactile"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "#ffffff",
              color: "#EA580C",
              border: "none",
              padding: "12px 30px",
              borderRadius: 99,
              fontWeight: 800,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            }}
          >
            <GoogleLogoIcon size={20} weight="bold" />
            <span>Daftar Gratis via Google</span>
            <ArrowRightIcon size={18} weight="bold" />
          </button>
        )}
      </div>
    </section>
  );
}
