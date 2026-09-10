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
  ShoppingBagIcon,
} from "@phosphor-icons/react";

import { useState } from "react";
import { useThemeSwitchAnimation } from "#/lib/useThemeSwitchAnimation";
import type { ActiveCashier } from "#/lib/store-context";
import type { Id } from "../../../../convex/_generated/dataModel";

export const NAV_ITEMS = [
  { to: "/kasir", icon: StorefrontIcon, label: "Kasir" },
  { to: "/pesanan", icon: ShoppingBagIcon, label: "Pesanan" },
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
  activeOrdersCount?: number;
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
  activeOrdersCount,
  onOpenShiftModal,
  activeShift,
  collapsed,
  onToggleCollapse,
  onSignOut,
}: SidebarNavProps) {
  const [showStorePicker, setShowStorePicker] = useState(false);
  const { ref: themeButtonRef, toggleSwitchTheme, dark } = useThemeSwitchAnimation();

  return (
    <div className="flex h-full flex-col bg-[var(--color-surface)] select-none">
      {/* Brand Header */}
      <div className={`border-b border-[var(--color-border)] ${collapsed ? "p-2" : "p-3.5"}`}>
        <div className="flex items-center justify-between gap-1.5">
          {/* Store Switcher */}
          <div className="relative min-w-0 flex-1">
            <button
              type="button"
              onClick={() => userStores && userStores.length > 1 && setShowStorePicker(!showStorePicker)}
              className={`press-tactile flex w-full items-center ${
                collapsed ? "justify-center" : "justify-between"
              } rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-2 text-left transition-all ${
                userStores && userStores.length > 1 ? "cursor-pointer hover:bg-[var(--color-surface-3)]" : ""
              }`}
            >
              {!collapsed ? (
                <>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-text-3)]">
                      <BuildingsIcon size={12} weight="bold" />
                      <span className="truncate">TOKU POS</span>
                    </div>
                    <div className="truncate text-xs font-black text-[var(--color-text)]">
                      {store?.name || "Toko"}
                    </div>
                  </div>
                  {userStores && userStores.length > 1 && (
                    <CaretDownIcon
                      size={14}
                      weight="bold"
                      className={`text-[var(--color-text-3)] transition-transform duration-200 ${
                        showStorePicker ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </>
              ) : (
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-brand)]/10 text-xs font-black text-[var(--color-brand)]"
                  title={store?.name || "Toko"}
                >
                  {(store?.name || "T")[0].toUpperCase()}
                </div>
              )}
            </button>

            {/* Store Picker Dropdown */}
            {showStorePicker && userStores && userStores.length > 1 && (
              <div className="absolute top-full left-0 z-50 mt-1.5 w-56 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-xl">
                <div className="px-2 py-1 text-[10px] font-bold text-[var(--color-text-3)]">GANTI TOKO</div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {userStores.map((s: any) => (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => {
                        onSelectStore(s._id);
                        setShowStorePicker(false);
                      }}
                      className={`press-tactile flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-bold transition-all ${
                        store?._id === s._id
                          ? "bg-[var(--color-brand)] text-white"
                          : "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                      }`}
                    >
                      <span className="truncate">{s.name}</span>
                      {s.branchName && (
                        <span
                          className={`text-[10px] ${
                            store?._id === s._id ? "text-white/70" : "text-[var(--color-text-3)]"
                          }`}
                        >
                          {s.branchName}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
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
          const hasOrdersBadge = item.to === "/pesanan" && Boolean(activeOrdersCount && activeOrdersCount > 0);

          return (
            <div key={item.to} className="nav-item-container relative">
              <Link
                to={item.to}
                title={collapsed ? item.label : undefined}
                preload="intent"
                className={`press-tactile relative flex items-center ${
                  collapsed ? "justify-center rounded-xl p-2.5" : "gap-3 rounded-full px-3.5 py-2.5"
                } text-xs font-bold transition-all ${
                  active
                    ? "shadow-primary-500/25 bg-[var(--color-brand)] text-white shadow-md"
                    : "text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
                }`}
              >
                <div className="relative shrink-0">
                  <Icon size={18} weight={active ? "fill" : "regular"} />
                  {collapsed && hasOrdersBadge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--color-surface)]" />
                  )}
                </div>
                {!collapsed && (
                  <div className="flex items-center justify-between w-full min-w-0">
                    <span className="truncate">{item.label}</span>
                    {hasOrdersBadge && (
                      <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-500 text-white animate-pulse">
                        {activeOrdersCount}
                      </span>
                    )}
                  </div>
                )}
              </Link>
              {collapsed && (
                <div className="sidebar-tooltip">
                  {item.label}
                  {hasOrdersBadge ? ` (${activeOrdersCount})` : ""}
                </div>
              )}
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
              ref={themeButtonRef}
              type="button"
              onClick={toggleSwitchTheme}
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
