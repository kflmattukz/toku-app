import { authClient } from "#/lib/auth-client";
import { isDarkMode } from "#/lib/utils";
import {
  LandingCategories,
  LandingComparison,
  LandingCta,
  LandingFaq,
  LandingFeatures,
  LandingFooter,
  LandingHero,
  LandingNavbar,
  LandingSimulator,
  LandingSteps,
} from "#/features/landing";
import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { data: session, isPending } = authClient.useSession();
  const [dark, setDark] = useState(isDarkMode);

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<boolean>) => setDark(e.detail);
    window.addEventListener("toku_theme_change" as any, handleThemeChange);
    return () => window.removeEventListener("toku_theme_change" as any, handleThemeChange);
  }, []);

  if (isPending) {
    return <div style={{ minHeight: "100vh", background: "var(--color-surface)" }} />;
  }

  if (session) {
    return <Navigate to="/kasir" replace />;
  }

  const handleGoogleLogin = () => {
    authClient.signIn.social({ provider: "google", callbackURL: "/kasir" });
  };

  return (
    <div
      style={{
        background: "var(--color-surface)",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Dot Grid Layer */}
      <div
        className="bg-grid-pattern"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
      />

      {/* Ambient Glow Orbs */}
      <div className="hero-glow-1" />
      <div className="hero-glow-2" />
      <div className="hero-glow-3" />

      {/* Glass Pill Navbar */}
      <LandingNavbar dark={dark} session={session} onGoogleLogin={handleGoogleLogin} />

      {/* Editorial Hero Section */}
      <LandingHero session={session} onGoogleLogin={handleGoogleLogin} />

      {/* Interactive Living Micro-POS Simulator */}
      <LandingSimulator />

      {/* 3-Step How It Works Workflow with Spotlight Cards */}
      <LandingSteps />

      {/* Bento Grid Features with Spotlight Glow */}
      <LandingFeatures />

      {/* Comparison Matrix Section */}
      <LandingComparison />

      {/* Store Categories Showcase */}
      <LandingCategories />

      {/* FAQ Accordion Section with Smooth CSS Grid */}
      <LandingFaq />

      {/* Final Conversion Banner */}
      <LandingCta session={session} onGoogleLogin={handleGoogleLogin} />

      {/* Localized Footer */}
      <LandingFooter />
    </div>
  );
}
