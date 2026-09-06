import { LoginCard, LoginHeader, PosSimulationShowcase } from "#/features/auth";
import { authClient } from "#/lib/auth-client";
import { isDarkMode, toggleTheme } from "#/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  const [dark, setDark] = useState(isDarkMode);

  const redirectTarget = search.redirect || "/kasir";

  // Sync theme changes with global event
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<boolean>) => setDark(e.detail);
    window.addEventListener("toku_theme_change" as any, handleThemeChange);
    return () => window.removeEventListener("toku_theme_change" as any, handleThemeChange);
  }, []);

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
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-surface-2)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "3px solid var(--color-border)",
            borderTopColor: "var(--color-brand)",
            animation: "toku-spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "var(--color-surface-2)",
        color: "var(--color-text)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Background Dot Matrix Pattern */}
      <div
        className="bg-grid-pattern"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: dark ? 0.35 : 0.65,
        }}
      />

      {/* Ambient Radial Mesh Orbs */}
      <div
        className="hero-glow-1"
        style={{
          animation: "toku-pulse-glow 9s ease-in-out infinite",
          opacity: dark ? 0.3 : 0.5,
        }}
      />
      <div
        className="hero-glow-2"
        style={{
          top: "40%",
          right: "-10%",
          animation: "toku-pulse-glow 11s ease-in-out 2s infinite",
          opacity: dark ? 0.2 : 0.35,
        }}
      />

      {/* Top Floating Glass Navigation Header */}
      <LoginHeader dark={dark} onToggleTheme={() => setDark(toggleTheme())} />

      {/* Main Split-Screen Canvas */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 20px 48px",
          maxWidth: 1280,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div className="login-split-grid">
          <PosSimulationShowcase dark={dark} />
          <LoginCard dark={dark} isSigningIn={isSigningIn} onGoogleLogin={handleGoogleLogin} />
        </div>
      </main>
    </div>
  );
}
