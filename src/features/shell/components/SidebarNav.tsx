import { Link } from "@tanstack/react-router";
import {
  StorefrontIcon,
  PackageIcon,
  ChartBarIcon,
  ReceiptIcon,
  ChartLineUpIcon,
  CoinsIcon,
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
  { to: "/pengeluaran", icon: CoinsIcon, label: "Pengeluaran" },
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
    <div className="flex h-full flex-col bg-[var(--color-surface)] select-none">
      {/* Brand Header */}
      <div className={`border-b border-[var(--color-border)] ${collapsed ? "p-3" : "p-4"}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Toku POS"
              className="h-8 w-8 shrink-0 rounded-xl object-contain"
            />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm leading-tight font-extrabold text-[var(--color-text)]">
                  {store ? store.name : "Toku POS"}
                </div>
                {userStores && userStores.length > 1 ? (
                  <div className="relative mt-1">
                    <button
                      type="button"
                      onClick={() => setShowStorePicker((prev) => !prev)}
                      className="press-tactile inline-flex cursor-pointer items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-brand)]"
                    >
                      <BuildingsIcon size={12} weight="bold" />
                      <span className="max-w-[110px] truncate">{store?.branchName || "Pusat"}</span>
                      <CaretDownIcon size={10} weight="bold" />
                    </button>

                    {showStorePicker && (
                      <div className="absolute top-full left-0 z-50 mt-1.5 flex w-48 flex-col gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-lg">
                        <div className="px-2 py-1 text-[10px] font-bold text-[var(--color-text-3)]">
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
                            className={`w-full cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition-colors ${
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
                    <span className="inline-block rounded-full border border-[var(--color-border)] bg-[var(--color-brand-light)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-brand)]">
                      {store
                        ? (CATEGORY_LABELS[store.category] ?? store.category)
                        : "Menyiapkan..."}
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
              className="press-tactile flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)]"
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
          <div className="mt-3 flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-2">
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-[var(--color-text-3)]">KASIR BERTUGAS</div>
              <div className="truncate text-xs font-extrabold text-[var(--color-text)]">
                {currentCashier.name}
              </div>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={onOpenCashierModal}
                className="press-tactile cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 text-[var(--color-text)] hover:bg-[var(--color-surface-3)]"
                title="Ganti Kasir / PIN"
              >
                <LockKeyIcon size={13} />
              </button>
              <button
                type="button"
                onClick={onOpenShiftModal}
                className={`press-tactile flex cursor-pointer items-center rounded-lg border p-1.5 ${
                  activeShift
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-600"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)]"
                }`}
                title={activeShift ? "Tutup Shift Kasir" : "Buka Shift Kasir"}
              >
                <ClockCounterClockwiseIcon size={13} weight={activeShift ? "fill" : "regular"} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav
        className={`flex-1 ${collapsed ? "px-1.5 py-3" : "px-2 py-3.5"} space-y-1 overflow-y-auto`}
      >
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
                  collapsed ? "justify-center rounded-xl p-2.5" : "gap-3 rounded-full px-3.5 py-2.5"
                } text-xs font-bold transition-all ${
                  active
                    ? "shadow-primary-500/25 bg-[var(--color-brand)] text-white shadow-md"
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
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2`}
        >
          {!collapsed && (
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs font-bold text-[var(--color-brand)]">
                <UserIcon size={16} weight="bold" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-[var(--color-text)]">
                  {session?.user?.name || "Pengguna"}
                </div>
                <div className="truncate text-[10px] text-[var(--color-text-3)]">
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
              className="press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface-3)]"
              title={dark ? "Mode Terang" : "Mode Gelap"}
            >
              {dark ? <SunIcon size={15} weight="bold" /> : <MoonIcon size={15} weight="bold" />}
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger-text)]"
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
