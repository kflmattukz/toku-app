import { authClient } from "#/lib/auth-client";
import { ArrowLeftIcon, GoogleLogoIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const redirectTarget = search.redirect || "/kasir";

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (!isPending && session) {
      navigate({ to: redirectTarget as any, replace: true });
    }
  }, [session, isPending, navigate, redirectTarget]);

  const handleGoogleLogin = async () => {
    try {
      setIsSigningIn(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTarget,
      });
    } catch {
      setIsSigningIn(false);
    }
  };

  if (isPending) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-surface-2)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "3px solid var(--color-border)",
            borderTopColor: "var(--color-brand)",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        backgroundColor: "var(--color-surface-2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background dot pattern */}
      <div
        className="bg-grid-pattern"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
      />

      {/* Main Login Card */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 24,
          padding: "36px 28px",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.06)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Brand Logo */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
          }}
        >
          <img
            src="/logo.png"
            alt="Toku POS Logo"
            style={{ width: 38, height: 38, objectFit: "contain" }}
          />
        </div>

        {/* Heading */}
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 800,
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
          }}
        >
          Masuk ke Toku POS
        </h1>
        <p
          style={{
            margin: "8px 0 28px",
            fontSize: 13,
            color: "var(--color-text-2)",
            lineHeight: 1.5,
          }}
        >
          Kelola kasir, inventaris barang, dan laporan penjualan UMKM dalam satu aplikasi.
        </p>

        {/* Google Sign-in Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isSigningIn}
          className="press-tactile"
          style={{
            width: "100%",
            height: 48,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            backgroundColor: "var(--color-surface)",
            color: "var(--color-text)",
            border: "1.5px solid var(--color-border)",
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 700,
            cursor: isSigningIn ? "wait" : "pointer",
            transition: "all 0.15s ease",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            opacity: isSigningIn ? 0.7 : 1,
          }}
        >
          <GoogleLogoIcon size={20} weight="bold" />
          <span>{isSigningIn ? "Menghubungkan..." : "Masuk dengan Google"}</span>
        </button>

        {/* Security badge note */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 20,
            fontSize: 12,
            color: "var(--color-text-3)",
          }}
        >
          <ShieldCheckIcon size={16} weight="fill" color="var(--color-brand)" />
          <span>Autentikasi resmi & aman via Google Account</span>
        </div>
      </div>

      {/* Back to Home Link */}
      <Link
        to="/"
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 20,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--color-text-2)",
          textDecoration: "none",
        }}
      >
        <ArrowLeftIcon size={14} weight="bold" />
        <span>Kembali ke Beranda</span>
      </Link>
    </div>
  );
}
