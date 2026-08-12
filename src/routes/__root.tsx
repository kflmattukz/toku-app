import { TanStackDevtools } from "@tanstack/react-devtools";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import ConvexProvider from "../integrations/convex/provider";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "description",
        content:
          "Toku POS — Kelola warungmu dari mana saja. Kasir cepat, stok otomatis, laporan harian untuk UMKM Makassar.",
      },
      { name: "theme-color", content: "#EA580C" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Toku POS" },
      { title: "Toku POS" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon/favicon-96x96.png", sizes: "96x96" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon/favicon.svg" },
      { rel: "shortcut icon", href: "/favicon/favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/favicon/apple-touch-icon.png" },
      { rel: "manifest", href: "/favicon/site.webmanifest" },
    ],
  }),
  shellComponent: RootDocument,
});

function getInitialTheme(): boolean {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem("toku_theme");
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    // Listen for custom theme toggle events across components
    const handleThemeChange = (e: CustomEvent<boolean>) => {
      setDark(e.detail);
    };
    window.addEventListener("toku_theme_change" as any, handleThemeChange);

    // Listen to system preference changes if no manual preference is saved
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("toku_theme")) {
        setDark(e.matches);
      }
    };
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      window.removeEventListener("toku_theme_change" as any, handleThemeChange);
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, []);

  return (
    <html lang="id" className={dark ? "dark" : ""}>
      <head>
        <HeadContent />
      </head>
      <body
        style={{
          background: "var(--color-surface-2)",
          color: "var(--color-text)",
          minHeight: "100vh",
        }}
      >
        <ConvexProvider>
          {children}
          <Toaster position="top-right" richColors closeButton theme={dark ? "dark" : "light"} />
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[{ name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> }]}
          />
        </ConvexProvider>
        <Scripts />
      </body>
    </html>
  );
}
