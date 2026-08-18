import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AppStoreContext } from "#/lib/store-context";
import {
  StorefrontIcon,
  PackageIcon,
  ChartBarIcon,
  ReceiptIcon,
  ChartLineUpIcon,
  GearIcon,
  WifiSlashIcon,
  ListIcon,
  SignOutIcon,
  XIcon,
  UserIcon,
} from "@phosphor-icons/react";

export const Route = createFileRoute("/_app")({
  component: AppShell,
});

const NAV = [
  { to: "/kasir", icon: StorefrontIcon, label: "Kasir" },
  { to: "/produk", icon: PackageIcon, label: "Produk" },
  { to: "/stok", icon: ChartBarIcon, label: "Stok" },
  { to: "/transaksi", icon: ReceiptIcon, label: "Transaksi" },
  { to: "/laporan", icon: ChartLineUpIcon, label: "Laporan" },
  { to: "/pengaturan", icon: GearIcon, label: "Pengaturan" },
];

const CATEGORY_LABELS: Record<string, string> = {
  sembako: "Warung Sembako",
  warung_kopi: "Warung Kopi",
  apotek: "Apotek",
  konter_pulsa: "Konter Pulsa",
  kelontong: "Toko Kelontong",
  lainnya: "Lainnya",
};

function AppShell() {
  const { data: session, isPending } = authClient.useSession();
  const store = useQuery(
    api.stores.getByUserId,
    session ? { userId: session.user.id, userEmail: session.user.email } : "skip",
  );
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [currentPath]);

  useEffect(() => {
    if (!isPending && !session) navigate({ to: "/" });
  }, [session, isPending, navigate]);

  if (isPending) return <Loader />;
  if (!session) return null;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--color-surface-2)",
        position: "relative",
      }}
    >
      {/* Desktop / Tablet Sidebar */}
      <aside
        className="desktop-only"
        style={{
          width: 250,
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
          zIndex: 30,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <SidebarContent currentPath={currentPath} session={session} store={store} />
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
          <div
            className="animate-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="animate-sidebar"
            style={{
              position: "relative",
              width: 280,
              maxWidth: "80vw",
              background: "var(--color-surface)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              zIndex: 101,
              boxShadow: "var(--shadow-lg)",
              borderRight: "1px solid var(--color-border)",
            }}
          >
            <div style={{ position: "absolute", top: 18, right: 18, zIndex: 10 }}>
              <button
                onClick={() => setSidebarOpen(false)}
                className="press-tactile"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 99,
                  cursor: "pointer",
                  color: "var(--color-text-2)",
                  padding: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <XIcon size={18} />
              </button>
            </div>
            <SidebarContent currentPath={currentPath} session={session} store={store} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: "100vh",
        }}
      >
        {/* Offline Banner */}
        {!isOnline && (
          <div
            style={{
              background: "var(--color-brand)",
              color: "#ffffff",
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              position: "sticky",
              top: 0,
              zIndex: 40,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <WifiSlashIcon size={18} weight="bold" />
            Mode Offline — Transaksi akan disinkron otomatis saat koneksi kembali
          </div>
        )}

        {/* Mobile Header (Matching topbar style from image) */}
        <header
          className="mobile-topbar"
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            background: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            position: "sticky",
            top: 0,
            zIndex: 20,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="press-tactile"
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: 99,
                cursor: "pointer",
                color: "var(--color-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
                flexShrink: 0,
              }}
              aria-label="Open Navigation Menu"
            >
              <ListIcon size={18} weight="bold" />
            </button>
            <span
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: "var(--color-brand)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 99,
                  background: "var(--color-brand-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <StorefrontIcon size={18} weight="fill" color="var(--color-brand)" />
              </div>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "var(--color-text)",
                }}
              >
                {store ? store.name : "Toku POS"}
              </span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name ?? "Account"}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 99,
                  border: "2px solid var(--color-brand)",
                  objectFit: "cover",
                  boxShadow: "var(--shadow-sm)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 99,
                  background: "var(--color-brand-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserIcon size={18} weight="bold" color="var(--color-brand)" />
              </div>
            )}
          </div>
        </header>

        {/* Main Route Outlet */}
        <main
          style={{
            flex: 1,
            padding: "20px 16px 110px",
            maxWidth: 1240,
            width: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          <AppStoreContext.Provider value={{ store, session }}>
            <Outlet />
          </AppStoreContext.Provider>
        </main>

        {/* Mobile Floating Capsule Dock (Exact match to vibrant image dock) */}
        <nav
          className="mobile-bottom-nav floating-dock"
          style={{
            padding: "6px 8px",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          {NAV.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = currentPath.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                preload="intent"
                className="press-tactile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: active ? "8px 16px" : "10px",
                  borderRadius: 99,
                  textDecoration: "none",
                  background: active ? "var(--color-brand)" : "transparent",
                  color: active ? "#ffffff" : "var(--color-text-2)",
                  fontSize: 12,
                  fontWeight: active ? 800 : 600,
                  transition: "all 200ms cubic-bezier(0.32, 0.72, 0, 1)",
                  boxShadow: active ? "0 4px 14px rgba(234, 88, 12, 0.35)" : "none",
                }}
              >
                <Icon size={20} weight={active ? "fill" : "regular"} />
                {active && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function SidebarContent({
  currentPath,
  session,
  store,
}: {
  currentPath: string;
  session: any;
  store: any;
}) {
  return (
    <>
      {/* Sidebar Header */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <div className="eyebrow-tag" style={{ marginBottom: 8 }}>
          KASIR DIGITAL POS
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 99,
              background: "var(--color-brand)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(234, 88, 12, 0.25)",
            }}
          >
            <StorefrontIcon size={22} weight="fill" color="#ffffff" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: "var(--color-text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1.2,
              }}
            >
              {store ? store.name : "Toku POS"}
            </div>
            <div style={{ marginTop: 4 }}>
              {store ? (
                <span
                  style={{
                    background: "var(--color-brand-light)",
                    border: "1px solid var(--color-border)",
                    padding: "2px 10px",
                    borderRadius: 99,
                    fontWeight: 700,
                    color: "var(--color-brand)",
                    fontSize: 10,
                    display: "inline-block",
                  }}
                >
                  {CATEGORY_LABELS[store.category] ?? store.category}
                </span>
              ) : (
                <span style={{ fontSize: 11, color: "var(--color-text-3)" }}>Menyiapkan...</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav style={{ flex: 1, padding: "16px 10px", overflowY: "auto" }}>
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = currentPath.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              preload="intent"
              className="press-tactile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 16px",
                borderRadius: 99,
                marginBottom: 6,
                textDecoration: "none",
                fontWeight: active ? 800 : 600,
                fontSize: 14,
                background: active ? "var(--color-brand)" : "transparent",
                color: active ? "#ffffff" : "var(--color-text-2)",
                boxShadow: active ? "0 4px 14px rgba(234, 88, 12, 0.3)" : "none",
                transition: "all 150ms ease",
              }}
            >
              <Icon size={20} weight={active ? "fill" : "regular"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Account Info Footer */}
      <div
        style={{
          padding: "14px",
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-surface-2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          {session.user.image ? (
            <img
              src={session.user.image}
              style={{
                width: 36,
                height: 36,
                borderRadius: 99,
                border: "2px solid var(--color-brand)",
                objectFit: "cover",
              }}
              alt="user"
            />
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 99,
                background: "var(--color-brand)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserIcon size={18} color="#ffffff" />
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--color-text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {session.user.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-3)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {session.user.email}
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.href = "/";
                },
              },
            })
          }
          className="press-tactile"
          style={{
            width: "100%",
            padding: "9px 12px",
            borderRadius: 99,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            color: "var(--color-danger)",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <SignOutIcon size={16} weight="bold" />
          Keluar
        </button>
      </div>
    </>
  );
}

function Loader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--color-surface-2)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 99,
            background: "var(--color-brand)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 6px 18px rgba(234, 88, 12, 0.35)",
          }}
        >
          <StorefrontIcon size={28} weight="fill" />
        </div>
        <p style={{ color: "var(--color-text-2)", fontSize: 14, fontWeight: 700 }}>
          Memuat Toku POS...
        </p>
      </div>
    </div>
  );
}
