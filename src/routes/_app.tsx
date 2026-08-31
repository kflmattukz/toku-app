import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "convex/react";
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

function AppShell() {
  const { data: session, isPending } = authClient.useSession();
  const [selectedStoreId, setSelectedStoreId] = useState<Id<"stores"> | null>(null);

  // Sync selectedStoreId with current user's session from localStorage
  useEffect(() => {
    if (session?.user) {
      const userKey = `toku_active_store_id_${session.user.email || session.user.id}`;
      const saved = (localStorage.getItem(userKey) as Id<"stores">) || null;
      setSelectedStoreId(saved);
    } else {
      setSelectedStoreId(null);
    }
  }, [session?.user?.id, session?.user?.email]);

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

  const isPro = true;

  const activeShift = useQuery(api.shifts.getActive, store ? { storeId: store._id } : "skip");

  useEffect(() => {
    try {
      const savedCashier = localStorage.getItem("toku_active_cashier");
      if (savedCashier) {
        setCurrentCashierState(JSON.parse(savedCashier));
      }
    } catch {}

    const savedCollapsed = localStorage.getItem("toku_sidebar_collapsed");
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
    localStorage.setItem("toku_active_cashier", JSON.stringify(next));
  };

  const handleSelectStore = (id: Id<"stores"> | null) => {
    setSelectedStoreId(id);
    if (session?.user) {
      const userKey = `toku_active_store_id_${session.user.email || session.user.id}`;
      if (id) {
        localStorage.setItem(userKey, id);
        localStorage.setItem("toku_active_store_id", id);
      } else {
        localStorage.removeItem(userKey);
        localStorage.removeItem("toku_active_store_id");
      }
    }
  };

  const handleSignOut = () => {
    if (session?.user) {
      const userKey = `toku_active_store_id_${session.user.email || session.user.id}`;
      localStorage.removeItem(userKey);
    }
    localStorage.removeItem("toku_active_store_id");
    localStorage.removeItem("toku_active_cashier");
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
    localStorage.setItem("toku_sidebar_collapsed", String(collapsed));
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

  useEffect(() => {
    if (!isPending && !session) navigate({ to: "/" });
  }, [session, isPending, navigate]);

  useEffect(() => {
    if (store && store._id) {
      if (selectedStoreId !== store._id) {
        setSelectedStoreId(store._id);
        if (session?.user) {
          const userKey = `toku_active_store_id_${session.user.email || session.user.id}`;
          localStorage.setItem(userKey, store._id);
          localStorage.setItem("toku_active_store_id", store._id);
        }
      }
    }
  }, [store?._id, session?.user, selectedStoreId]);

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
    }),
    [store, session, currentCashier, selectedStoreId, isPro],
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

      {/* Mobile Drawer Backdrop & Drawer */}
      {sidebarOpen && (
        <div
          className="mobile-only fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="flex h-full w-4/5 max-w-[300px] flex-col bg-[var(--color-surface)] shadow-2xl"
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
              >
                <XIcon size={18} />
              </button>
            </div>
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
              collapsed={false}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
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
        <nav className="mobile-bottom-nav floating-dock flex items-center justify-around p-1.5">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = currentPath.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                preload="intent"
                className={`press-tactile flex flex-col items-center justify-center rounded-2xl p-2 transition-all ${
                  active
                    ? "shadow-primary-500/25 bg-[var(--color-brand)] text-white shadow-md"
                    : "text-[var(--color-text-2)] hover:text-[var(--color-text)]"
                }`}
              >
                <Icon size={20} weight={active ? "fill" : "regular"} />
                <span className="mt-0.5 text-[10px] font-extrabold">{item.label}</span>
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
