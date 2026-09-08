import { ArrowLeftIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useThemeSwitchAnimation } from "#/lib/useThemeSwitchAnimation";

interface LoginHeaderProps {
  dark?: boolean;
  onToggleTheme?: () => void;
}

export function LoginHeader({ dark: propDark, onToggleTheme }: LoginHeaderProps) {
  const { ref: themeButtonRef, toggleSwitchTheme, dark: activeDark } = useThemeSwitchAnimation();
  const dark = propDark ?? activeDark;
  const handleToggle = onToggleTheme ?? toggleSwitchTheme;
  return (
    <header
      style={{
        position: "relative",
        zIndex: 30,
        width: "100%",
        maxWidth: 1280,
        margin: "0 auto",
        padding: "20px 20px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Link
        to="/"
        className="press-tactile"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderRadius: 99,
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-2)",
          textDecoration: "none",
          fontSize: 13,
          fontWeight: 700,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <ArrowLeftIcon size={14} weight="bold" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          ref={themeButtonRef}
          onClick={handleToggle}
          title={dark ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
          aria-label="Toggle theme"
          className="press-tactile"
          style={{
            width: 40,
            height: 40,
            borderRadius: 99,
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
          }}
        >
          {dark ? (
            <SunIcon size={18} weight="duotone" color="var(--color-warning)" />
          ) : (
            <MoonIcon size={18} weight="duotone" color="var(--color-brand)" />
          )}
        </button>
      </div>
    </header>
  );
}
