import { Link } from "@tanstack/react-router";
import {
  StorefrontIcon,
  PackageIcon,
  ChartBarIcon,
  ReceiptIcon,
  ChartLineUpIcon,
  GearIcon,
  CaretLeftIcon,
  CaretRightIcon,
  LockKeyIcon,
  ClockCounterClockwiseIcon,
  BuildingsIcon,
  CaretDownIcon,
  SignOutIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { isDarkMode, toggleTheme } from "#/lib/utils";
import { CATEGORY_LABELS } from "#/features/pengaturan";
import type { ActiveCashier } from "#/lib/store-context";
import type { Id } from "../../../../convex/_generated/dataModel";

export const NAV_ITEMS = [
  { to: "/kasir", icon: StorefrontIcon, label: "Kasir" },
  { to: "/produk", icon: PackageIcon, label: "Produk" },
  { to: "/stok", icon: ChartBarIcon, label: "Stok" },
  { to: "/transaksi", icon: ReceiptIcon, label: "Transaksi" },
  { to: "/laporan", icon: ChartLineUpIcon, label: "Laporan" },
  { to: "/pengaturan", icon: GearIcon, label: "Pengaturan" },
];

interface SidebarNavProps {
  currentPath: string;
  session: any;
  store: any;
  userStores: any[] | undefined;
  onSelectStore: (storeId: Id<"stores"> | null) => void;
  currentCashier: ActiveCashier;
  onOpenCashierModal: () => void;
  onOpenShiftModal: () => void;
  activeShift: any;
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onSignOut: () => void;
}

export function SidebarNav({
  currentPath,
  session,
  store,
  userStores,
  onSelectStore,
  currentCashier,
  onOpenCashierModal,
  onOpenShiftModal,
  activeShift,
  collapsed,
  onToggleCollapse,
  onSignOut,
}: SidebarNavProps) {
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(isDarkMode());
    const onTheme = (e: any) => setDark(e.detail);
    window.addEventListener("toku_theme_change", onTheme);
    return () => window.removeEventListener("toku_theme_change", onTheme);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] select-none">
      {/* Brand Header */}
      <div className={`border-b border-[var(--color-border)] ${collapsed ? "p-3" : "p-4"}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/logo.png"
              alt="Toku POS"
              className="w-8 h-8 rounded-xl object-contain shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold text-[var(--color-text)] truncate leading-tight">
                  {store ? store.name : "Toku POS"}
                </div>
                {userStores && userStores.length > 1 ? (
                  <div className="relative mt-1">
                    <button
                      type="button"
                      onClick={() => setShowStorePicker((prev) => !prev)}
                      className="press-tactile py-0.5 px-2 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-brand)] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <BuildingsIcon size={12} weight="bold" />
                      <span className="truncate max-w-[110px]">
                        {store?.branchName || "Pusat"}
                      </span>
                      <CaretDownIcon size={10} weight="bold" />
                    </button>

                    {showStorePicker && (
                      <div className="absolute left-0 top-full mt-1.5 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg p-1.5 z-50 flex flex-col gap-1">
                        <div className="text-[10px] font-bold text-[var(--color-text-3)] px-2 py-1">
                          PILIH CABANG OUTLET
                        </div>
                        {userStores.map((st) => (
                          <button
                            key={st._id}
                            type="button"
                            onClick={() => {
                              onSelectStore(st._id);
                              setShowStorePicker(false);
                            }}
                            className={`w-full text-left py-1.5 px-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                              store?._id === st._id
                                ? "bg-[var(--color-brand-light)] text-[var(--color-brand)]"
                                : "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                            }`}
                          >
                            {st.name} ({st.branchName || "Pusat"})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-1">
                    <span className="bg-[var(--color-brand-light)] border border-[var(--color-border)] px-1.5 py-0.5 rounded-full font-bold text-[var(--color-brand)] text-[9px] inline-block">
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
              type="button"
              onClick={onToggleCollapse}
              className="press-tactile w-6 h-6 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)] flex items-center justify-center cursor-pointer shrink-0"
              title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
            >
              {collapsed ? (
                <CaretRightIcon size={12} weight="bold" />
              ) : (
                <CaretLeftIcon size={12} weight="bold" />
              )}
            </button>
          )}
        </div>

        {/* Staff & Shift Quick Widget in Sidebar */}
        {!collapsed && (
          <div className="mt-3 bg-[var(--color-surface-2)] rounded-xl p-2 border border-[var(--color-border)] flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-[10px] text-[var(--color-text-3)] font-bold">
                KASIR BERTUGAS
              </div>
              <div className="text-xs font-extrabold text-[var(--color-text)] truncate">
                {currentCashier.name}
              </div>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={onOpenCashierModal}
                className="press-tactile bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1.5 cursor-pointer text-[var(--color-text)] hover:bg-[var(--color-surface-3)]"
                title="Ganti Kasir / PIN"
              >
                <LockKeyIcon size={13} />
              </button>
              <button
                type="button"
                onClick={onOpenShiftModal}
                className={`press-tactile rounded-lg p-1.5 cursor-pointer flex items-center border ${
                  activeShift
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-600"
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-2)]"
                }`}
                title={activeShift ? "Tutup Shift Kasir" : "Buka Shift Kasir"}
              >
                <ClockCounterClockwiseIcon
                  size={13}
                  weight={activeShift ? "fill" : "regular"}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 ${collapsed ? "py-3 px-1.5" : "py-3.5 px-2"} overflow-y-auto space-y-1`}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPath.startsWith(item.to);
          return (
            <div key={item.to} className="nav-item-container relative">
              <Link
                to={item.to}
                title={collapsed ? item.label : undefined}
                preload="intent"
                className={`press-tactile flex items-center ${
                  collapsed ? "justify-center p-2.5 rounded-xl" : "gap-3 py-2.5 px-3.5 rounded-full"
                } text-xs font-bold transition-all ${
                  active
                    ? "bg-[var(--color-brand)] text-white shadow-md shadow-primary-500/25"
                    : "text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
                }`}
              >
                <Icon size={18} weight={active ? "fill" : "regular"} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
              {collapsed && <div className="sidebar-tooltip">{item.label}</div>}
            </div>
          );
        })}
      </nav>

      {/* Account Info Footer */}
      <div className={`border-t border-[var(--color-border)] ${collapsed ? "p-2" : "p-3"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2`}>
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-brand)] shrink-0 font-bold text-xs">
                <UserIcon size={16} weight="bold" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[var(--color-text)] truncate">
                  {session?.user?.name || "Pengguna"}
                </div>
                <div className="text-[10px] text-[var(--color-text-3)] truncate">
                  {session?.user?.email}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const next = toggleTheme();
                setDark(next);
              }}
              className="press-tactile w-8 h-8 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-surface-3)]"
              title={dark ? "Mode Terang" : "Mode Gelap"}
            >
              {dark ? <SunIcon size={15} weight="bold" /> : <MoonIcon size={15} weight="bold" />}
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="press-tactile w-8 h-8 rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger-text)] flex items-center justify-center cursor-pointer"
              title="Keluar Akun"
            >
              <SignOutIcon size={15} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
