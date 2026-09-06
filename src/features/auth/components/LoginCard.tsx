import {
  ArrowRightIcon,
  GoogleLogoIcon,
  LightningIcon,
  PrinterIcon,
  ShieldCheckIcon,
  SparkleIcon,
  WifiHighIcon,
} from "@phosphor-icons/react";

interface LoginCardProps {
  isSigningIn: boolean;
  onGoogleLogin: () => void;
  dark: boolean;
}

export function LoginCard({ isSigningIn, onGoogleLogin, dark }: LoginCardProps) {
  return (
    <div
      className="animate-toku-fade-up flex flex-col items-center justify-center"
      style={{ width: "100%" }}
    >
      {/* Mobile Header Banner (Visible only on mobile) */}
      <div
        className="login-mobile-badge flex-col items-center text-center"
        style={{ marginBottom: 24, width: "100%" }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            borderRadius: 99,
            backgroundColor: "rgba(234, 88, 12, 0.1)",
            border: "1px solid rgba(234, 88, 12, 0.2)",
            fontSize: 11,
            fontWeight: 800,
            color: "var(--color-brand)",
            marginBottom: 12,
          }}
        >
          <SparkleIcon size={14} weight="fill" />
          <span>POS KASIR UMKM MODERN</span>
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--color-text)",
          }}
        >
          Masuk ke Toku POS
        </h2>
      </div>

      {/* Double-Bezel Login Card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
        }}
      >
        {/* Outer Shell (Doppelrand Frame) */}
        <div
          style={{
            padding: 8,
            borderRadius: 32,
            backgroundColor: dark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)",
            border: "1px solid var(--color-border)",
            boxShadow: dark
              ? "0 24px 60px rgba(0, 0, 0, 0.5)"
              : "0 24px 60px rgba(234, 88, 12, 0.08)",
          }}
        >
          {/* Inner Core (Card Core) */}
          <div
            style={{
              borderRadius: 24,
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border-subtle)",
              padding: "36px 28px",
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.15)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {/* Brand Logo with Ambient Glow Ring */}
            <div
              style={{
                position: "relative",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: -6,
                  borderRadius: 22,
                  background: "radial-gradient(circle, rgba(234, 88, 12, 0.3) 0%, transparent 70%)",
                  filter: "blur(8px)",
                }}
              />
              <div
                style={{
                  position: "relative",
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  backgroundColor: "var(--color-surface-2)",
                  border: "1.5px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
                  overflow: "hidden",
                }}
              >
                <img
                  src="/logo.png"
                  alt="Toku POS"
                  style={{ width: 44, height: 44, objectFit: "contain" }}
                />
              </div>
            </div>

            {/* Title & Subtitle */}
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                color: "var(--color-text)",
                letterSpacing: "-0.025em",
              }}
            >
              Selamat Datang
            </h1>
            <p
              style={{
                margin: "8px 0 28px",
                fontSize: 13,
                color: "var(--color-text-2)",
                lineHeight: 1.55,
                maxWidth: 320,
              }}
            >
              Buka kasir tokomu sekarang. Satu klik langsung terhubung tanpa perlu pusing buat kata
              sandi baru.
            </p>

            {/* High-End Nested CTA: Button-in-Button Architecture */}
            <button
              onClick={onGoogleLogin}
              disabled={isSigningIn}
              className="login-cta-btn"
              style={{
                width: "100%",
                height: 54,
                padding: "6px 10px 6px 12px",
                borderRadius: 16,
                backgroundColor: "var(--color-brand)",
                border: "none",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: isSigningIn ? "wait" : "pointer",
                boxShadow: "0 8px 24px rgba(234, 88, 12, 0.35)",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                opacity: isSigningIn ? 0.75 : 1,
              }}
            >
              {/* Nested Left Google Icon Island */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
                }}
              >
                <GoogleLogoIcon size={22} weight="bold" color="#ea580c" />
              </div>

              {/* Button Text */}
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  flex: 1,
                  textAlign: "center",
                  padding: "0 8px",
                }}
              >
                {isSigningIn ? "Menghubungkan..." : "Masuk dengan Google"}
              </span>

              {/* Nested Right Trailing Arrow Island */}
              <div
                className="cta-arrow-circle"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: "rgba(255, 255, 255, 0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "transform 0.2s ease",
                }}
              >
                <ArrowRightIcon size={16} weight="bold" color="#ffffff" />
              </div>
            </button>

            {/* Micro Benefits Triad */}
            <div
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                marginTop: 24,
              }}
            >
              <div
                style={{
                  padding: "10px 6px",
                  borderRadius: 12,
                  backgroundColor: "var(--color-surface-2)",
                  border: "1px solid var(--color-border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <LightningIcon size={16} weight="fill" color="var(--color-brand)" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text)" }}>
                  Cepat 1 Detik
                </span>
              </div>

              <div
                style={{
                  padding: "10px 6px",
                  borderRadius: 12,
                  backgroundColor: "var(--color-surface-2)",
                  border: "1px solid var(--color-border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <WifiHighIcon size={16} weight="bold" color="#10b981" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text)" }}>
                  Offline Ready
                </span>
              </div>

              <div
                style={{
                  padding: "10px 6px",
                  borderRadius: 12,
                  backgroundColor: "var(--color-surface-2)",
                  border: "1px solid var(--color-border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <PrinterIcon size={16} weight="bold" color="var(--color-brand)" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text)" }}>
                  Cetak Struk
                </span>
              </div>
            </div>

            {/* Security Guarantee Note */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 24,
                fontSize: 12,
                color: "var(--color-text-3)",
              }}
            >
              <ShieldCheckIcon size={16} weight="fill" color="#10b981" />
              <span>Autentikasi resmi & aman via Google Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Helper below Card */}
      <p
        style={{
          marginTop: 18,
          fontSize: 12,
          color: "var(--color-text-3)",
          textAlign: "center",
        }}
      >
        Belum punya toko? Akun baru otomatis masuk ke langkah pengaturan toko.
      </p>
    </div>
  );
}
