import { ArrowRightIcon, GoogleLogoIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useNavbarScroll } from "../hooks/useNavbarScroll";

interface LandingNavbarProps {
  dark: boolean;
  onToggleTheme: () => void;
  session: unknown;
  onGoogleLogin: () => void;
}

export function LandingNavbar({ dark, onToggleTheme, session, onGoogleLogin }: LandingNavbarProps) {
  const isScrolled = useNavbarScroll(20);

  return (
    <nav
      className="glass-pill"
      style={{
        position: "sticky",
        top: isScrolled ? 10 : 16,
        zIndex: 50,
        maxWidth: 1040,
        margin: "0 auto 20px",
        borderRadius: 99,
        border: "1.5px solid var(--color-border)",
        background: isScrolled
          ? dark
            ? "rgba(20, 18, 16, 0.88)"
            : "rgba(255, 255, 255, 0.88)"
          : dark
            ? "rgba(20, 18, 16, 0.65)"
            : "rgba(255, 255, 255, 0.65)",
        backdropFilter: isScrolled ? "blur(16px)" : "blur(10px)",
        WebkitBackdropFilter: isScrolled ? "blur(16px)" : "blur(10px)",
        boxShadow: isScrolled
          ? "0 14px 30px -10px rgba(0, 0, 0, 0.18)"
          : "var(--shadow-md)",
        transition: "all 250ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isScrolled ? "8px 18px" : "10px 20px",
          gap: 12,
          transition: "padding 250ms ease",
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            fontWeight: 800,
            fontSize: 18,
            color: "var(--color-brand)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <img
            src="/logo.png"
            alt="Toku POS"
            style={{
              width: 32,
              height: 32,
              objectFit: "contain",
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(234, 88, 12, 0.2)",
            }}
          />
          <span
            style={{
              color: "var(--color-text)",
              letterSpacing: "-0.03em",
              fontWeight: 800,
            }}
          >
            Toku POS
          </span>
        </Link>

        {/* Right Action Group */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button
            onClick={onToggleTheme}
            title={dark ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
            aria-label="Toggle theme"
            className="press-tactile"
            style={{
              width: 36,
              height: 36,
              borderRadius: 99,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-2)",
              color: "var(--color-text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {dark ? (
              <SunIcon size={18} weight="duotone" color="var(--color-warning)" />
            ) : (
              <MoonIcon size={18} weight="duotone" color="var(--color-brand)" />
            )}
          </button>

          {session ? (
            <Link
              to="/kasir"
              className="press-tactile"
              style={{
                background: "var(--color-brand)",
                color: "#ffffff",
                padding: "8px 20px",
                borderRadius: 99,
                fontWeight: 800,
                fontSize: 13,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 14px rgba(234, 88, 12, 0.35)",
                whiteSpace: "nowrap",
              }}
            >
              <span>Buka Kasir</span> <ArrowRightIcon size={14} weight="bold" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="press-tactile"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "var(--color-brand)",
                color: "#ffffff",
                border: "none",
                borderRadius: 99,
                padding: "8px 20px",
                fontWeight: 800,
                fontSize: 13,
                textDecoration: "none",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(234, 88, 12, 0.35)",
                whiteSpace: "nowrap",
              }}
            >
              <GoogleLogoIcon size={16} weight="bold" />
              <span>Masuk</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
