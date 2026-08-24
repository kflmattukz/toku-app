import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AppStoreContext, type ActiveCashier } from "#/lib/store-context";
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
  CaretLeftIcon,
  CaretRightIcon,
  SunIcon,
  MoonIcon,
  CrownIcon,
  LockKeyIcon,
  ClockCounterClockwiseIcon,
  CaretDownIcon,
  BuildingsIcon,
} from "@phosphor-icons/react";
import { isDarkMode, toggleTheme } from "#/lib/utils";
import { UpgradeProModal } from "#/components/UpgradeProModal";
import { CashierLockModal } from "#/components/CashierLockModal";
import { ShiftModal } from "#/components/ShiftModal";
import type { Id } from "../../convex/_generated/dataModel";

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

function getInitialSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem("toku_sidebar_collapsed");
  if (saved !== null) return saved === "true";
  return window.innerWidth <= 1024 && window.innerWidth > 768;
}

function getInitialCashier(): ActiveCashier {
  if (typeof window === "undefined") return { name: "Kasir Utama", role: "owner" };
  try {
    const saved = localStorage.getItem("toku_active_cashier");
    if (saved) return JSON.parse(saved);
  } catch {}
  return { name: "Kasir Utama", role: "owner" };
}

function AppShell() {
  const { data: session, isPending } = authClient.useSession();
  const [selectedStoreId, setSelectedStoreId] = useState<Id<"stores"> | null>(() => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem("toku_active_store_id") as Id<"stores">) || null;
  });

  const store = useQuery(
    api.stores.getByUserId,
    session
      ? {
          userId: session.user.id,
          userEmail: session.user.email,
          storeId: selectedStoreId || undefined,
        }
      : "skip",
  );

  const userStores = useQuery(
    api.stores.listUserStores,
    session ? { userId: session.user.id, userEmail: session.user.email } : "skip",
  );

  const [currentCashier, setCurrentCashierState] = useState<ActiveCashier>(getInitialCashier);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [cashierModalOpen, setCashierModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<"monthly" | "yearly">("yearly");

  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(getInitialSidebarCollapsed);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isPro = Boolean(
    store?.tier === "pro" && (!store?.proExpiresAt || store?.proExpiresAt > Date.now()),
  );

  const activeShift = useQuery(
    api.shifts.getActive,
    store ? { storeId: store._id } : "skip",
  );

  const setCurrentCashier = (cashier: ActiveCashier | null) => {
    const next = cashier || { name: "Kasir Utama", role: "owner" };
    setCurrentCashierState(next);
    localStorage.setItem("toku_active_cashier", JSON.stringify(next));
  };

  const handleSelectStore = (id: Id<"stores"> | null) => {
    setSelectedStoreId(id);
    if (id) {
      localStorage.setItem("toku_active_store_id", id);
    } else {
      localStorage.removeItem("toku_active_store_id");
    }
  };

  const openUpgradeModal = (defaultPlan: "monthly" | "yearly" = "yearly") => {
    setUpgradePlan(defaultPlan);
    setUpgradeModalOpen(true);
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("toku_sidebar_collapsed", String(next));
      return next;
    });
  };

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
          width: collapsed ? 76 : 256,
          transition: "width 260ms cubic-bezier(0.32, 0.72, 0, 1)",
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
          zIndex: 30,
          boxShadow: "var(--shadow-sm)",
          overflow: collapsed ? "visible" : "hidden",
        }}
      >
        <SidebarContent
          currentPath={currentPath}
          session={session}
          store={store}
          userStores={userStores}
          onSelectStore={handleSelectStore}
          currentCashier={currentCashier}
          onOpenCashierModal={() => setCashierModalOpen(true)}
          onOpenShiftModal={() => setShiftModalOpen(true)}
          onOpenUpgrade={() => openUpgradeModal("yearly")}
          isPro={isPro}
          activeShift={activeShift}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
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
            <SidebarContent
              currentPath={currentPath}
              session={session}
              store={store}
              userStores={userStores}
              onSelectStore={handleSelectStore}
              currentCashier={currentCashier}
              onOpenCashierModal={() => setCashierModalOpen(true)}
              onOpenShiftModal={() => setShiftModalOpen(true)}
              onOpenUpgrade={() => openUpgradeModal("yearly")}
              isPro={isPro}
              activeShift={activeShift}
              collapsed={false}
            />
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

        {/* Mobile Header */}
        <header
          className="mobile-topbar"
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            position: "sticky",
            top: 0,
            zIndex: 20,
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
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
                fontSize: 15,
                color: "var(--color-brand)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <img
                src="/logo.png"
                alt="Toku POS"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
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
            {isPro ? (
              <span
                style={{
                  background: "linear-gradient(135deg, rgba(234,88,12,0.2), rgba(245,158,11,0.2))",
                  color: "var(--color-brand)",
                  border: "1px solid rgba(234,88,12,0.4)",
                  padding: "3px 8px",
                  borderRadius: 99,
                  fontSize: 10,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CrownIcon size={12} weight="fill" />
                PRO
              </span>
            ) : (
              <button
                onClick={() => openUpgradeModal("yearly")}
                className="press-tactile"
                style={{
                  background: "var(--color-brand)",
                  color: "#ffffff",
                  border: "none",
                  padding: "4px 10px",
                  borderRadius: 99,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CrownIcon size={12} weight="fill" />
                Upgrade
              </button>
            )}

            <button
              onClick={() => setCashierModalOpen(true)}
              className="press-tactile"
              title={`Kasir: ${currentCashier.name}`}
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: 99,
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
                color: "var(--color-text)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <LockKeyIcon size={14} />
              <span>{currentCashier.name.split(" ")[0]}</span>
            </button>
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
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            key={currentPath}
            className="page-enter-animation"
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            <AppStoreContext.Provider
              value={{
                store,
                session,
                currentCashier,
                setCurrentCashier,
                selectedStoreId,
                setSelectedStoreId: handleSelectStore,
                isPro,
                openUpgradeModal,
              }}
            >
              <Outlet />
            </AppStoreContext.Provider>
          </div>
        </main>

        {/* Mobile Floating Capsule Dock */}
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

      {/* Upgrade Pro Modal */}
      {store && session && (
        <UpgradeProModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          storeId={store._id}
          userId={session.user.id}
          defaultPlan={upgradePlan}
        />
      )}

      {/* Cashier Lock / Switch PIN Modal */}
      {store && (
        <CashierLockModal
          isOpen={cashierModalOpen}
          onClose={() => setCashierModalOpen(false)}
          storeId={store._id}
          onSuccess={(cashier) => setCurrentCashier(cashier)}
          title="Ganti Kasir Bertugas"
        />
      )}

      {/* Shift Open/Close Modal */}
      {store && (
        <ShiftModal
          isOpen={shiftModalOpen}
          onClose={() => setShiftModalOpen(false)}
          storeId={store._id}
          currentCashier={currentCashier}
        />
      )}
    </div>
  );
}

function SidebarContent({
  currentPath,
  session,
  store,
  userStores,
  onSelectStore,
  currentCashier,
  onOpenCashierModal,
  onOpenShiftModal,
  onOpenUpgrade,
  isPro,
  activeShift,
  collapsed = false,
  onToggleCollapse,
}: {
  currentPath: string;
  session: any;
  store: any;
  userStores?: any[];
  onSelectStore: (id: Id<"stores"> | null) => void;
  currentCashier: ActiveCashier;
  onOpenCashierModal: () => void;
  onOpenShiftModal: () => void;
  onOpenUpgrade: () => void;
  isPro: boolean;
  activeShift: any;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const [dark, setDark] = useState(isDarkMode);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<boolean>) => setDark(e.detail);
    window.addEventListener("toku_theme_change" as any, handleThemeChange);
    return () => window.removeEventListener("toku_theme_change" as any, handleThemeChange);
  }, []);

  return (
    <>
      {/* Sidebar Header */}
      <div
        style={{
          padding: collapsed ? "14px 10px" : "16px 14px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {!collapsed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div className="eyebrow-tag">TOKU POS</div>
            {isPro ? (
              <span
                style={{
                  background: "linear-gradient(135deg, rgba(234,88,12,0.15), rgba(245,158,11,0.25))",
                  color: "var(--color-brand)",
                  border: "1px solid rgba(234,88,12,0.4)",
                  padding: "2px 8px",
                  borderRadius: 99,
                  fontSize: 10,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CrownIcon size={12} weight="fill" />
                PRO
              </span>
            ) : (
              <button
                onClick={onOpenUpgrade}
                className="press-tactile"
                style={{
                  background: "var(--color-brand-light)",
                  color: "var(--color-brand)",
                  border: "1px solid var(--color-brand)",
                  padding: "2px 8px",
                  borderRadius: 99,
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CrownIcon size={12} weight="bold" />
                Upgrade Pro
              </button>
            )}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            flexDirection: collapsed ? "column" : "row",
            gap: collapsed ? 10 : 8,
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
              flex: collapsed ? "none" : 1,
            }}
          >
            <img
              src="/logo.png"
              alt="Toku POS"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
            {!collapsed && (
              <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    color: "var(--color-text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {store ? store.name : "Toku POS"}
                </div>
                {/* Branch Switcher Selector */}
                {userStores && userStores.length > 1 ? (
                  <div style={{ position: "relative", marginTop: 2 }}>
                    <button
                      onClick={() => setShowStoreDropdown(!showStoreDropdown)}
                      className="press-tactile"
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        color: "var(--color-brand)",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      <BuildingsIcon size={12} />
                      <span>{store?.branchName || "Pusat"}</span>
                      <CaretDownIcon size={10} />
                    </button>

                    {showStoreDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          zIndex: 50,
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 12,
                          boxShadow: "var(--shadow-lg)",
                          padding: 4,
                          minWidth: 160,
                          marginTop: 4,
                        }}
                      >
                        {userStores.map((st) => (
                          <button
                            key={st._id}
                            onClick={() => {
                              onSelectStore(st._id);
                              setShowStoreDropdown(false);
                            }}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "none",
                              background: store?._id === st._id ? "var(--color-brand-light)" : "transparent",
                              color: store?._id === st._id ? "var(--color-brand)" : "var(--color-text)",
                              fontWeight: store?._id === st._id ? 800 : 600,
                              fontSize: 12,
                              cursor: "pointer",
                            }}
                          >
                            {st.name} ({st.branchName || "Pusat"})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ marginTop: 2 }}>
                    <span
                      style={{
                        background: "var(--color-brand-light)",
                        border: "1px solid var(--color-border)",
                        padding: "1px 6px",
                        borderRadius: 99,
                        fontWeight: 700,
                        color: "var(--color-brand)",
                        fontSize: 9,
                        display: "inline-block",
                      }}
                    >
                      {store ? CATEGORY_LABELS[store.category] ?? store.category : "Menyiapkan..."}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Collapse/Expand Toggle Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="press-tactile"
              title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
              aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              style={{
                width: 26,
                height: 26,
                borderRadius: 99,
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-2)",
                color: "var(--color-text-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
              }}
            >
              {collapsed ? <CaretRightIcon size={14} weight="bold" /> : <CaretLeftIcon size={14} weight="bold" />}
            </button>
          )}
        </div>

        {/* Staff & Shift Quick Widget in Sidebar */}
        {!collapsed && (
          <div
            style={{
              marginTop: 12,
              background: "var(--color-surface-2)",
              borderRadius: 12,
              padding: "8px 10px",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, color: "var(--color-text-3)", fontWeight: 700 }}>
                KASIR BERTUGAS
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "var(--color-text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentCashier.name}
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={onOpenCashierModal}
                className="press-tactile"
                title="Ganti Kasir / PIN"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "5px 6px",
                  cursor: "pointer",
                  color: "var(--color-text)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <LockKeyIcon size={13} />
              </button>
              <button
                onClick={onOpenShiftModal}
                className="press-tactile"
                title={activeShift ? "Tutup Shift Kasir" : "Buka Shift Kasir"}
                style={{
                  background: activeShift ? "rgba(34,197,94,0.15)" : "var(--color-surface)",
                  border: activeShift ? "1px solid #16a34a" : "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "5px 6px",
                  cursor: "pointer",
                  color: activeShift ? "#16a34a" : "var(--color-text-2)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ClockCounterClockwiseIcon size={13} weight={activeShift ? "fill" : "regular"} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav
        style={{
          flex: 1,
          padding: collapsed ? "12px 6px" : "14px 8px",
          overflowY: collapsed ? "visible" : "auto",
          overflowX: "visible",
        }}
      >
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = currentPath.startsWith(item.to);
          return (
            <div key={item.to} className="nav-item-container" style={{ marginBottom: 4 }}>
              <Link
                to={item.to}
                title={collapsed ? item.label : undefined}
                preload="intent"
                className="press-tactile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: 12,
                  padding: collapsed ? "10px 0" : "10px 14px",
                  borderRadius: collapsed ? 14 : 99,
                  textDecoration: "none",
                  fontWeight: active ? 800 : 600,
                  fontSize: 13,
                  background: active ? "var(--color-brand)" : "transparent",
                  color: active ? "#ffffff" : "var(--color-text-2)",
                  boxShadow: active ? "0 4px 14px rgba(234, 88, 12, 0.3)" : "none",
                  transition: "all 180ms cubic-bezier(0.32, 0.72, 0, 1)",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <Icon size={20} weight={active ? "fill" : "regular"} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
              {collapsed && <div className="sidebar-tooltip">{item.label}</div>}
            </div>
          );
        })}
      </nav>

      {/* Pro Upgrade Sidebar Banner (if not pro) */}
      {!collapsed && !isPro && (
        <div style={{ padding: "0 10px 10px" }}>
          <div
            onClick={onOpenUpgrade}
            className="press-tactile"
            style={{
              background: "linear-gradient(135deg, rgba(234,88,12,0.12), rgba(245,158,11,0.18))",
              border: "1px solid rgba(234,88,12,0.3)",
              borderRadius: 14,
              padding: "10px 12px",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <CrownIcon size={16} weight="fill" color="var(--color-brand)" />
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--color-brand)" }}>
                Upgrade Toku PRO
              </span>
            </div>
            <p style={{ fontSize: 11, color: "var(--color-text-2)", margin: 0, lineHeight: 1.3 }}>
              Multi-outlet, staf PIN, auto restock & unlimited produk.
            </p>
          </div>
        </div>
      )}

      {/* Account Info Footer */}
      <div
        style={{
          padding: collapsed ? "10px 6px" : "12px",
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-surface-2)",
          display: "flex",
          flexDirection: "column",
          alignItems: collapsed ? "center" : "stretch",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10,
            marginBottom: 8,
            width: "100%",
          }}
          title={collapsed ? `${session.user.name} (${session.user.email})` : undefined}
        >
          {session.user.image ? (
            <img
              src={session.user.image}
              style={{
                width: 32,
                height: 32,
                borderRadius: 99,
                border: "2px solid var(--color-brand)",
                objectFit: "cover",
                flexShrink: 0,
              }}
              alt="user"
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 99,
                background: "var(--color-brand)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <UserIcon size={16} color="#ffffff" />
            </div>
          )}
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 12,
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
                  fontSize: 10,
                  color: "var(--color-text-3)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {session.user.email}
              </div>
            </div>
          )}
        </div>

        {/* Dark/Light Mode Switcher */}
        <div className="nav-item-container" style={{ width: "100%", marginBottom: 6 }}>
          <button
            onClick={() => setDark(toggleTheme())}
            className="press-tactile"
            title={dark ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
            aria-label="Toggle theme"
            style={{
              width: "100%",
              padding: collapsed ? "7px 0" : "7px 10px",
              borderRadius: collapsed ? 12 : 99,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {dark ? (
                <MoonIcon size={15} weight="fill" color="var(--color-brand)" />
              ) : (
                <SunIcon size={15} weight="fill" color="var(--color-brand)" />
              )}
              {!collapsed && <span>{dark ? "Mode Gelap" : "Mode Terang"}</span>}
            </div>
            {!collapsed && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: "var(--color-brand)",
                  background: "var(--color-brand-light)",
                  padding: "1px 6px",
                  borderRadius: 99,
                  border: "1px solid var(--color-border)",
                }}
              >
                {dark ? "GELAP" : "TERANG"}
              </span>
            )}
          </button>
        </div>

        <div className="nav-item-container" style={{ width: "100%" }}>
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
              padding: collapsed ? "7px 0" : "8px 10px",
              borderRadius: collapsed ? 12 : 99,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-danger)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <SignOutIcon size={15} weight="bold" style={{ flexShrink: 0 }} />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>
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
        <img
          src="/logo.png"
          alt="Toku POS"
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            objectFit: "contain",
            display: "block",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ color: "var(--color-text-2)", fontSize: 14, fontWeight: 700 }}>
          Memuat Toku POS...
        </p>
      </div>
    </div>
  );
}
