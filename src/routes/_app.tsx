import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AppStoreContext, type ActiveCashier } from "#/lib/store-context";
import { XIcon } from "@phosphor-icons/react";
import { CashierLockModal } from "#/components/CashierLockModal";
import { ShiftModal } from "#/components/ShiftModal";
import { SidebarNav, TopHeader, NAV_ITEMS } from "#/features/shell";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/_app")({
  component: AppShell,
});

function safeGetStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key: string, val: string): void {
  try {
    localStorage.setItem(key, val);
  } catch {}
}

function safeRemoveStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

function AppShell() {
  const { data: session, isPending } = authClient.useSession();
  const [selectedStoreId, setSelectedStoreId] = useState<Id<"stores"> | null>(null);
  const syncUserStore = useMutation(api.stores.syncUserStore);

  // Sync selectedStoreId with current user's session from localStorage with validation
  useEffect(() => {
    if (session?.user) {
      const userKey = `toku_active_store_id_${(session.user.email || session.user.id).toLowerCase()}`;
      const saved = safeGetStorage(userKey);
      if (saved && saved !== "undefined" && saved !== "null" && saved.trim() !== "") {
        setSelectedStoreId(saved as Id<"stores">);
      } else {
        const legacy = safeGetStorage("toku_active_store_id");
        if (legacy && legacy !== "undefined" && legacy !== "null" && legacy.trim() !== "") {
          setSelectedStoreId(legacy as Id<"stores">);
        } else {
          setSelectedStoreId(null);
        }
      }
    } else {
      setSelectedStoreId(null);
    }
  }, [session?.user?.id, session?.user?.email]);

  const isValidStoreId =
    Boolean(selectedStoreId) &&
    typeof selectedStoreId === "string" &&
    selectedStoreId !== "undefined" &&
    selectedStoreId !== "null" &&
    selectedStoreId.trim() !== "";

  const cleanEmail = session?.user?.email?.trim().toLowerCase();

  const store = useQuery(
    api.stores.getByUserId,
    session?.user
      ? {
          userId: session.user.id,
          userEmail: cleanEmail || undefined,
          storeId: isValidStoreId ? (selectedStoreId as Id<"stores">) : undefined,
        }
      : "skip",
  );

  const userStores = useQuery(
    api.stores.listUserStores,
    session?.user
      ? {
          userId: session.user.id,
          userEmail: cleanEmail || undefined,
        }
      : "skip",
  );

  const [currentCashier, setCurrentCashierState] = useState<ActiveCashier>({
    name: "Kasir Utama",
    role: "owner",
  });
  const [cashierModalOpen, setCashierModalOpen] = useState(false);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);

  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const bottomNavItems = useMemo(() => NAV_ITEMS.slice(0, 5), []);
  const activeBottomIndex = bottomNavItems.findIndex((item) => currentPath.startsWith(item.to));
  const [indicatorIndex, setIndicatorIndex] = useState(() =>
    activeBottomIndex >= 0 ? activeBottomIndex : 0,
  );

  useEffect(() => {
    if (activeBottomIndex >= 0) {
      setIndicatorIndex(activeBottomIndex);
    }
  }, [activeBottomIndex]);

  const isPro = true;

  const activeShift = useQuery(api.shifts.getActive, store ? { storeId: store._id } : "skip");

  useEffect(() => {
    const savedCashier = safeGetStorage("toku_active_cashier");
    if (savedCashier) {
      try {
        setCurrentCashierState(JSON.parse(savedCashier));
      } catch {}
    }

    const savedCollapsed = safeGetStorage("toku_sidebar_collapsed");
    if (savedCollapsed !== null) {
      setCollapsed(savedCollapsed === "true");
    } else if (window.innerWidth <= 1024 && window.innerWidth > 768) {
      setCollapsed(true);
    }

    setIsOnline(navigator.onLine);
  }, []);

  const setCurrentCashier = (cashier: ActiveCashier | null) => {
    const next = cashier || { name: "Kasir Utama", role: "owner" };
    setCurrentCashierState(next);
    safeSetStorage("toku_active_cashier", JSON.stringify(next));
  };

  const handleSelectStore = (id: Id<"stores"> | null) => {
    setSelectedStoreId(id);
    if (session?.user) {
      const userKey = `toku_active_store_id_${(session.user.email || session.user.id).toLowerCase()}`;
      if (id) {
        safeSetStorage(userKey, id);
        safeSetStorage("toku_active_store_id", id);
      } else {
        safeRemoveStorage(userKey);
        safeRemoveStorage("toku_active_store_id");
      }
    }
  };

  const handleSignOut = () => {
    if (session?.user) {
      const userKey = `toku_active_store_id_${(session.user.email || session.user.id).toLowerCase()}`;
      safeRemoveStorage(userKey);
    }
    safeRemoveStorage("toku_active_store_id");
    safeRemoveStorage("toku_active_cashier");
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  const openUpgradeModal = () => {};

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    safeSetStorage("toku_sidebar_collapsed", String(collapsed));
  }, [collapsed]);

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

  // Lock body scroll when mobile sidebar drawer is open
  useEffect(() => {
    if (sidebarOpen && typeof document !== "undefined") {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [sidebarOpen]);

  // If not logged in, redirect to landing
  useEffect(() => {
    if (!isPending && !session) navigate({ to: "/" });
  }, [session, isPending, navigate]);

  // If logged in but user has no store, immediately redirect to onboarding instead of hanging loaders
  useEffect(() => {
    if (!isPending && session && store === null && currentPath !== "/onboarding") {
      navigate({ to: "/onboarding" });
    }
  }, [isPending, session, store, currentPath, navigate]);

  // Sync selectedStoreId and update ownership link when store is resolved
  useEffect(() => {
    if (store && store._id) {
      if (selectedStoreId !== store._id) {
        setSelectedStoreId(store._id);
        if (session?.user) {
          const userKey = `toku_active_store_id_${(session.user.email || session.user.id).toLowerCase()}`;
          safeSetStorage(userKey, store._id);
          safeSetStorage("toku_active_store_id", store._id);
        }
      }

      // Auto-heal / link ownership across devices if userId or userEmail changed
      if (session?.user) {
        const emailClean = session.user.email?.trim().toLowerCase();
        if (
          store.userId !== session.user.id ||
          (emailClean && store.userEmail !== emailClean)
        ) {
          syncUserStore({
            storeId: store._id,
            userId: session.user.id,
            userEmail: emailClean,
          }).catch(() => {});
        }
      }
    }
  }, [store?._id, store?.userId, store?.userEmail, session?.user, selectedStoreId, syncUserStore]);

  const [privacyMode, setPrivacyMode] = useState<boolean>(false);

  useEffect(() => {
    const savedPrivacy = safeGetStorage("toku_privacy_mode");
    if (savedPrivacy !== null) {
      setPrivacyMode(savedPrivacy === "true");
    }
  }, []);

  const togglePrivacyMode = () => {
    setPrivacyMode((prev) => {
      const next = !prev;
      safeSetStorage("toku_privacy_mode", String(next));
      return next;
    });
  };

  const storeContextValue = useMemo(
    () => ({
      store,
      session,
      currentCashier,
      setCurrentCashier,
      selectedStoreId,
      setSelectedStoreId: handleSelectStore,
      isPro,
      openUpgradeModal,
      privacyMode,
      togglePrivacyMode,
    }),
    [store, session, currentCashier, selectedStoreId, isPro, privacyMode],
  );

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`desktop-only sticky top-0 z-30 h-screen border-r border-[var(--color-border)] transition-all duration-200 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <SidebarNav
          currentPath={currentPath}
          session={session}
          store={store}
          userStores={userStores}
          onSelectStore={handleSelectStore}
          currentCashier={currentCashier}
          onOpenCashierModal={() => setCashierModalOpen(true)}
          onOpenShiftModal={() => setShiftModalOpen(true)}
          activeShift={activeShift}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile Drawer Backdrop & Drawer (Portaled with z-[70] so it sits above bottom nav and floating docks) */}
      {sidebarOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="animate-sidebar flex h-full w-4/5 max-w-[300px] flex-col bg-[var(--color-surface)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] p-3">
                <span className="text-xs font-black tracking-wider text-[var(--color-text)]">
                  MENU APLIKASI
                </span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="cursor-pointer rounded-full p-1 text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)]"
                  aria-label="Tutup Menu"
                >
                  <XIcon size={18} />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <SidebarNav
                  currentPath={currentPath}
                  session={session}
                  store={store}
                  userStores={userStores}
                  onSelectStore={handleSelectStore}
                  currentCashier={currentCashier}
                  onOpenCashierModal={() => {
                    setSidebarOpen(false);
                    setCashierModalOpen(true);
                  }}
                  onOpenShiftModal={() => {
                    setSidebarOpen(false);
                    setShiftModalOpen(true);
                  }}
                  activeShift={activeShift}
                  collapsed={false}
                  onSignOut={handleSignOut}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Main Content Area */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <TopHeader
          store={store}
          currentCashier={currentCashier}
          isOnline={isOnline}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenCashierModal={() => setCashierModalOpen(true)}
        />

        {/* Route Content */}
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4 pb-28 sm:p-6">
          <div
            key={currentPath}
            className="page-enter-animation flex w-full min-w-0 flex-1 flex-col"
          >
            <AppStoreContext.Provider value={storeContextValue}>
              <Outlet />
            </AppStoreContext.Provider>
          </div>
        </main>

        {/* Mobile Floating Bottom Dock */}
        <nav className="mobile-bottom-nav floating-dock relative flex items-center p-1.5 select-none">
          {/* Active Sliding Indicator Pill */}
          <div
            className="pointer-events-none absolute top-1.5 bottom-1.5 rounded-full bg-brand shadow-primary-500/30 shadow-md"
            style={{
              width: "calc((100% - 12px) / 5)",
              left: 6,
              transform: `translateX(${indicatorIndex * 100}%)`,
              transition: "transform 280ms cubic-bezier(0.23, 1, 0.32, 1), opacity 200ms ease-out",
              opacity: activeBottomIndex >= 0 ? 1 : 0,
            }}
            aria-hidden="true"
          />

          {bottomNavItems.map((item, index) => {
            const Icon = item.icon;
            const active = currentPath.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                preload="intent"
                onClick={() => setIndicatorIndex(index)}
                className={`press-tactile relative z-10 flex flex-1 min-w-0 flex-col items-center justify-center rounded-full py-2 px-1 text-center transition-colors duration-200 ${
                  active ? "text-white" : "text-text-2 hover:text-text"
                }`}
              >
                <Icon
                  size={20}
                  weight={active ? "fill" : "regular"}
                  className="transition-transform duration-200 ease-out"
                  style={{ transform: active ? "scale(1.08)" : "scale(1)" }}
                />
                <span className="mt-0.5 truncate text-[10px] font-extrabold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Cashier PIN Lock Switch Modal */}
      {cashierModalOpen && store && (
        <CashierLockModal
          isOpen={cashierModalOpen}
          onClose={() => setCashierModalOpen(false)}
          storeId={store._id}
          onSuccess={(cashier) => {
            setCurrentCashier(cashier);
            setCashierModalOpen(false);
          }}
        />
      )}

      {/* Shift Open/Close Modal */}
      {shiftModalOpen && store && (
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
