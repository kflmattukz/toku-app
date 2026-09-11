import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion, AnimatePresence } from "motion/react";
import {
  KanbanIcon,
  TableIcon,
  MagnifyingGlassIcon,
  BellRingingIcon,
  XIcon,
  StorefrontIcon,
  ClockIcon,
  WhatsappLogoIcon,
  PhoneCallIcon,
  CheckSquareIcon,
  SquareIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PackageIcon,
  ReceiptIcon,
  TrashIcon,
  EyeIcon,
} from "@phosphor-icons/react";
import { formatIDR, cn, normalizeIndonesianPhone } from "#/lib/utils";
import { shareReceiptWhatsApp, shareReceiptWhatsAppImage } from "#/lib/print";
import { isNotificationSupported } from "#/lib/pwa-notifications";
import { usePesananOrders } from "../hooks/usePesananOrders";
import { useOrderDragAndDrop } from "../hooks/useOrderDragAndDrop";
import type { OrderRecord, OrderStatus, OrderStatusFilter } from "../types";

// Context
type PesananContextType = ReturnType<typeof usePesananOrders> &
  ReturnType<typeof useOrderDragAndDrop>;

const OrderViewContext = createContext<PesananContextType | null>(null);

export function useOrderViewContext() {
  const ctx = useContext(OrderViewContext);
  if (!ctx) throw new Error("useOrderViewContext must be used within OrderView.Root");
  return ctx;
}

// 1. Root
function Root({ children }: { children: React.ReactNode }) {
  const ordersState = usePesananOrders();
  const dndState = useOrderDragAndDrop();

  const value = { ...ordersState, ...dndState };

  return (
    <OrderViewContext.Provider value={value}>
      <div className="w-full flex-1 h-full flex flex-col min-h-0">{children}</div>
    </OrderViewContext.Provider>
  );
}

// 2. Header
function Header() {
  const {
    viewMode,
    setViewMode,
    counts,
    searchQuery,
    setSearchQuery,
    notifPermission,
    showNotifBanner,
    setShowNotifBanner,
    handleEnableNotification,
  } = useOrderViewContext();

  return (
    <header className="mb-2.5 space-y-2 shrink-0">
      {/* Title & View Switcher Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--color-text)]">
            Pesanan Toko
          </h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-brand-light)] text-[var(--color-brand)] border border-[var(--color-brand)]/20 tracking-wide uppercase">
            Online Pickup
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Counters */}
          {counts && (
            <div className="hidden lg:flex items-center gap-1.5">
              <div className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="text-amber-600 dark:text-amber-400 font-bold">{counts.pending}</span>{" "}
                <span className="text-[var(--color-text-2)] text-[11px]">Baru</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
                <span className="text-blue-600 dark:text-blue-400 font-bold">{counts.preparing}</span>{" "}
                <span className="text-[var(--color-text-2)] text-[11px]">Disiapkan</span>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {counts.ready_for_pickup}
                </span>{" "}
                <span className="text-[var(--color-text-2)] text-[11px]">Siap Ambil</span>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative w-44 sm:w-56">
            <MagnifyingGlassIcon
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-3)]"
            />
            <input
              type="text"
              placeholder="Cari pesanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl text-xs bg-[var(--color-surface)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-brand)] text-[var(--color-text)] placeholder:text-[var(--color-text-3)] transition-all"
            />
          </div>

          {/* View Mode Toggle Switch */}
          <div
            role="group"
            aria-label="Tampilan pesanan"
            className="flex items-center p-0.5 rounded-xl bg-[var(--color-surface-3)] border border-[var(--color-border)] shadow-xs"
          >
            <button
              type="button"
              aria-pressed={viewMode === "kanban"}
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all press-tactile",
                viewMode === "kanban"
                  ? "bg-[var(--color-brand)] text-white shadow-xs"
                  : "text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
              )}
            >
              <KanbanIcon size={14} weight={viewMode === "kanban" ? "fill" : "bold"} />
              <span>Kanban</span>
            </button>

            <button
              type="button"
              aria-pressed={viewMode === "table"}
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all press-tactile",
                viewMode === "table"
                  ? "bg-[var(--color-brand)] text-white shadow-xs"
                  : "text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
              )}
            >
              <TableIcon size={14} weight={viewMode === "table" ? "fill" : "bold"} />
              <span>Tabel</span>
            </button>
          </div>
        </div>
      </div>

      {/* PWA System Notification Banner */}
      {isNotificationSupported() && notifPermission === "default" && showNotifBanner && (
        <div className="p-2.5 rounded-2xl bg-[var(--color-brand-light)] border border-[var(--color-brand)]/30 flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-brand)] text-white flex items-center justify-center shrink-0">
              <BellRingingIcon size={16} weight="bold" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-[var(--color-brand-dark)] dark:text-orange-300">
                Aktifkan Notifikasi Pesanan di HP
              </p>
              <p className="text-[11px] text-[var(--color-text-2)] truncate">
                Dapatkan bunyi & getaran seketika saat pembeli membuat pesanan baru
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleEnableNotification}
              className="px-2.5 py-1 rounded-lg bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white font-bold press-tactile text-xs shadow-xs"
            >
              Aktifkan
            </button>
            <button
              type="button"
              onClick={() => setShowNotifBanner(false)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[var(--color-text-3)] hover:bg-black/5"
            >
              <XIcon size={13} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// 3. Kanban View
const KANBAN_COLUMNS: Array<{
  id: OrderStatus;
  title: string;
  badgeClass: string;
  dotColor: string;
}> = [
  {
    id: "pending",
    title: "Pesanan Baru",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  {
    id: "preparing",
    title: "Disiapkan",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotColor: "bg-blue-500",
  },
  {
    id: "ready_for_pickup",
    title: "Siap Diambil",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  {
    id: "completed",
    title: "Selesai",
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    dotColor: "bg-slate-500",
  },
];

function Kanban() {
  const { showCancelledColumn, setShowCancelledColumn, counts } = useOrderViewContext();

  const cancelledCount = (counts as any)?.cancelled ?? 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-2">
      {/* Optional Cancelled Column Toggle */}
      <div className="flex items-center justify-end shrink-0">
        <button
          type="button"
          onClick={() => setShowCancelledColumn((prev) => !prev)}
          className={cn(
            "text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1.5 press-tactile",
            showCancelledColumn
              ? "bg-rose-500/10 border-rose-500/30 text-rose-600"
              : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)]",
          )}
        >
          <XCircleIcon size={13} weight="bold" />
          <span>
            {showCancelledColumn
              ? "Sembunyikan Dibatalkan"
              : `Tampilkan Dibatalkan (${cancelledCount})`}
          </span>
        </button>
      </div>

      {/* Kanban Columns Flex Board */}
      <div className="flex-1 min-h-0 flex gap-4 overflow-x-auto pb-2 items-stretch custom-scrollbar">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            columnId={col.id}
            title={col.title}
            badgeClass={col.badgeClass}
            dotColor={col.dotColor}
          />
        ))}

        {/* Cancelled column when toggled */}
        {showCancelledColumn && (
          <KanbanColumn
            columnId="cancelled"
            title="Dibatalkan"
            badgeClass="bg-rose-500/10 text-rose-600 border-rose-500/20"
            dotColor="bg-rose-500"
          />
        )}
      </div>
    </div>
  );
}

// 4. Kanban Column
interface KanbanColumnProps {
  columnId: OrderStatus;
  title: string;
  badgeClass: string;
  dotColor: string;
}

function KanbanColumn({ columnId, title, badgeClass, dotColor }: KanbanColumnProps) {
  const {
    store,
    searchQuery,
    counts,
    dropTargetStatus,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleStatusTransition,
  } = useOrderViewContext();

  const [limit, setLimit] = useState(5);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isOver = dropTargetStatus === columnId;

  // Reset limit to 5 if search query changes
  useEffect(() => {
    setLimit(5);
  }, [searchQuery]);

  const queryResult = useQuery(
    api.onlineOrders.listByStatus,
    store
      ? {
          storeId: store._id,
          status: columnId,
          limit,
          search: searchQuery.trim() || undefined,
        }
      : "skip",
  );

  const orders = (queryResult?.orders ?? []) as OrderRecord[];
  const hasMore = queryResult?.hasMore ?? false;
  const isLoading = queryResult === undefined;

  const totalCount =
    (counts as any)?.[columnId] ??
    (queryResult as any)?.totalCount ??
    orders.length;

  // Auto-load on scroll near bottom
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !hasMore || isLoading) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 60) {
      setLimit((prev) => prev + 5);
    }
  }, [hasMore, isLoading]);

  return (
    <div
      onDragOver={(e) => handleDragOver(e, columnId)}
      onDragLeave={(e) => handleDragLeave(e, columnId)}
      onDrop={(e) => handleDrop(e, columnId, handleStatusTransition)}
      className={cn(
        "flex flex-col w-80 shrink-0 h-full max-h-full rounded-3xl bg-[var(--color-surface-3)] border p-3.5 transition-all shadow-xs",
        isOver
          ? "border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20 bg-[var(--color-brand-light)]/40"
          : "border-[var(--color-border)]",
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-[var(--color-border)] shrink-0">
        <div className="flex items-center gap-2">
          <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", dotColor)} />
          <h2 className="font-extrabold text-xs text-[var(--color-text)] uppercase tracking-wider">
            {title}
          </h2>
        </div>
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-black border",
            badgeClass,
          )}
        >
          {totalCount}
        </span>
      </div>

      {/* Cards Scrollable List */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 space-y-2.5 overflow-y-auto p-1 pt-1.5 -mr-1 pr-1.5 custom-scrollbar"
      >
        {isLoading && orders.length === 0 ? (
          <div className="space-y-2.5 p-0.5">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-[var(--color-surface)]/60 border border-[var(--color-border)] animate-pulse"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div
            className={cn(
              "h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all",
              isOver
                ? "border-[var(--color-brand)] bg-[var(--color-brand-light)]/40 text-[var(--color-brand)]"
                : "border-[var(--color-border)] text-[var(--color-text-3)]",
            )}
          >
            <p className="text-xs font-semibold">
              {isOver ? "Lepaskan untuk memindahkan" : "Tidak ada pesanan"}
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout" initial={false}>
              {orders.map((order) => (
                <KanbanCard key={order._id} order={order} />
              ))}
            </AnimatePresence>

            {hasMore && (
              <div className="py-1.5 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setLimit((prev) => prev + 5)}
                  className="w-full py-1.5 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)]/50 text-[11px] font-bold text-[var(--color-brand)] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 press-tactile"
                >
                  <span>Muat lebih banyak</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// 5. Kanban Card
function KanbanCard({ order }: { order: OrderRecord }) {
  const {
    setSelectedOrder,
    handleDragStart,
    handleDragEnd,
    handleStartPreparing,
    handleMarkReady,
    handleSendReadyWhatsApp,
    openPaymentModal,
  } = useOrderViewContext();

  const totalItemsCount = order.items.reduce((sum, it) => sum + it.qty, 0);
  const isDraggable = order.status !== "completed" && order.status !== "cancelled";

  return (
    <motion.div
      layout
      layoutId={order._id}
      initial={{ opacity: 0, scale: 0.93, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93, transition: { duration: 0.15 } }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 26,
        mass: 0.8,
      }}
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && handleDragStart(e as unknown as React.DragEvent, order)}
      onDragEnd={(e: any) => handleDragEnd(e)}
      onClick={() => setSelectedOrder(order)}
      className={cn(
        "group relative p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)]/50 hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:scale-[0.99] transition-all duration-200 select-none press-tactile",
        isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        order.status === "ready_for_pickup" && "border-emerald-500/50 ring-2 ring-emerald-500/20 hover:ring-emerald-500/40",
        order.status === "pending" && "border-amber-500/40 hover:ring-2 hover:ring-amber-500/20",
        order.status === "preparing" && "border-blue-500/40 hover:ring-2 hover:ring-blue-500/20",
        order.status === "completed" && "hover:ring-1 hover:ring-slate-500/20 opacity-90",
        order.status === "cancelled" && "border-rose-500/30 hover:ring-1 hover:ring-rose-500/20 opacity-80",
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono font-black text-xs text-[var(--color-text)] tracking-wider">
          {order.orderNumber}
        </span>
        <span className="text-[10px] text-[var(--color-text-3)] flex items-center gap-1 font-mono">
          <ClockIcon size={12} />
          {new Date(order.createdAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Customer Info */}
      <div className="mb-2.5">
        <p className="font-bold text-xs text-[var(--color-text)] truncate">{order.customerName}</p>
        <p className="text-[11px] text-[var(--color-text-3)] font-mono truncate">{order.customerPhone}</p>
      </div>

      {/* Items preview snippet */}
      <div className="p-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] mb-3 text-[11px] space-y-0.5">
        <p className="font-semibold text-[var(--color-text-2)] flex items-center justify-between">
          <span>{totalItemsCount} Total Produk</span>
          <span className="text-[10px] text-[var(--color-brand)] font-bold">Detail →</span>
        </p>
        <p className="text-[var(--color-text-3)] truncate">
          {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
        </p>
      </div>

      {/* Total & Quick Action */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
        <div>
          <span className="text-[10px] uppercase font-bold text-[var(--color-text-3)] block">
            Total
          </span>
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatIDR(order.total)}
          </span>
        </div>

        {/* Contextual Action Button */}
        <div onClick={(e) => e.stopPropagation()}>
          {order.status === "pending" && (
            <button
              type="button"
              onClick={() => handleStartPreparing(order._id)}
              className="px-2.5 py-1.5 rounded-xl bg-[var(--color-brand)] text-white text-[11px] font-bold shadow-xs hover:bg-[var(--color-brand-dark)] transition-all flex items-center gap-1"
            >
              <PackageIcon size={14} weight="bold" />
              <span>Siapkan</span>
            </button>
          )}

          {order.status === "preparing" && (
            <button
              type="button"
              onClick={() => handleMarkReady(order._id)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-bold shadow-xs hover:bg-emerald-700 transition-all flex items-center gap-1"
            >
              <CheckCircleIcon size={14} weight="bold" />
              <span>Siap</span>
            </button>
          )}

          {order.status === "ready_for_pickup" && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSendReadyWhatsApp(order)}
                className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/20"
                title="Kirim WA"
              >
                <WhatsappLogoIcon size={16} weight="fill" />
              </button>
              <button
                type="button"
                onClick={() => openPaymentModal(order)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] font-black shadow-xs hover:bg-emerald-700 transition-all flex items-center gap-1"
              >
                <CreditCardIcon size={14} weight="bold" />
                <span>Bayar</span>
              </button>
            </div>
          )}

          {order.status === "completed" && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircleIcon size={14} weight="fill" />
              <span>Lunas</span>
            </span>
          )}

          {order.status === "cancelled" && (
            <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
              <XCircleIcon size={14} weight="fill" />
              <span>Batal</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// 6. Table View
function Table() {
  const {
    filteredOrders,
    selectedStatus,
    setSelectedStatus,
    counts,
    setSelectedOrder,
    handleStartPreparing,
    handleMarkReady,
    handleSendReadyWhatsApp,
    openPaymentModal,
    handleCancelOrder,
  } = useOrderViewContext();

  const tableTabs: Array<{ id: OrderStatusFilter; label: string; count?: number }> = [
    { id: "all", label: "Semua" },
    { id: "pending", label: "Pesanan Baru", count: counts?.pending },
    { id: "preparing", label: "Disiapkan", count: counts?.preparing },
    { id: "ready_for_pickup", label: "Siap Diambil", count: counts?.ready_for_pickup },
    { id: "completed", label: "Selesai" },
    { id: "cancelled", label: "Dibatalkan" },
  ];

  const tableOrders =
    selectedStatus === "all"
      ? filteredOrders
      : filteredOrders.filter((o) => o.status === selectedStatus);

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-3">
      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
        {tableTabs.map((tab) => {
          const isSelected = selectedStatus === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap press-tactile",
                isSelected
                  ? "bg-[var(--color-brand)] text-white shadow-xs"
                  : "bg-[var(--color-surface)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)]",
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-extrabold",
                    isSelected
                      ? "bg-white/25 text-white"
                      : "bg-[var(--color-brand-light)] text-[var(--color-brand)]",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 overflow-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs custom-scrollbar">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)] font-bold">
                <th className="py-3 px-4">No. Pesanan</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">No. WhatsApp</th>
                <th className="py-3 px-4">Ringkasan Item</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {tableOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--color-text-3)]">
                    <StorefrontIcon size={36} className="mx-auto mb-2 opacity-50" />
                    <p className="font-bold text-sm text-[var(--color-text)]">Tidak Ada Pesanan</p>
                    <p className="text-xs text-[var(--color-text-2)] mt-0.5">
                      Belum ada pesanan yang sesuai dengan filter atau kata kunci saat ini.
                    </p>
                  </td>
                </tr>
              ) : (
                tableOrders.map((order) => {
                  return (
                    <tr
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-[var(--color-surface-2)] cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-black text-[var(--color-text)]">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-[var(--color-text-2)] font-mono">
                        {new Date(order.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-[var(--color-text)]">
                        {order.customerName}
                      </td>
                      <td className="py-3 px-4 font-mono text-[var(--color-text-2)]">
                        {order.customerPhone}
                      </td>
                      <td className="py-3 px-4 max-w-[220px] truncate text-[var(--color-text-2)]">
                        {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                      </td>
                      <td className="py-3 px-4 font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {formatIDR(order.total)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            order.status === "pending" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                            order.status === "preparing" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                            order.status === "ready_for_pickup" &&
                              "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                            order.status === "completed" &&
                              "bg-slate-500/15 text-slate-600 dark:text-slate-400",
                            order.status === "cancelled" && "bg-rose-500/15 text-rose-600",
                          )}
                        >
                          {order.status === "pending" && "Baru"}
                          {order.status === "preparing" && "Disiapkan"}
                          {order.status === "ready_for_pickup" && "Siap Ambil"}
                          {order.status === "completed" && "Selesai"}
                          {order.status === "cancelled" && "Batal"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-lg text-[var(--color-text-3)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-colors"
                            title="Lihat Detail"
                          >
                            <EyeIcon size={16} />
                          </button>

                          {order.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => handleStartPreparing(order._id)}
                              className="px-2.5 py-1 rounded-xl bg-[var(--color-brand)] text-white font-bold text-[11px] hover:bg-[var(--color-brand-dark)] transition-all"
                            >
                              Mulai Siapkan
                            </button>
                          )}

                          {order.status === "preparing" && (
                            <button
                              type="button"
                              onClick={() => handleMarkReady(order._id)}
                              className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-all"
                            >
                              Siap Diambil
                            </button>
                          )}

                          {order.status === "ready_for_pickup" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSendReadyWhatsApp(order)}
                                className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                title="Kirim WhatsApp"
                              >
                                <WhatsappLogoIcon size={16} weight="fill" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openPaymentModal(order)}
                                className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-all"
                              >
                                Bayar
                              </button>
                            </>
                          )}

                          {(order.status === "pending" || order.status === "preparing") && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order._id)}
                              className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="Batalkan Pesanan"
                            >
                              <TrashIcon size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 7. Responsive Detail Drawer / Modal
function DetailDrawer() {
  const {
    selectedOrder: contextOrder,
    setSelectedOrder,
    checkedItems,
    toggleItemCheck,
    handleCallCustomer,
    handleStartPreparing,
    handleMarkReady,
    handleSendReadyWhatsApp,
    openPaymentModal,
    handleCancelOrder,
    store,
  } = useOrderViewContext();

  const [activeOrder, setActiveOrder] = useState<OrderRecord | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (contextOrder) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      setActiveOrder(contextOrder);
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setIsOpen(true);
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    } else {
      setIsOpen(false);
      const timer = setTimeout(() => {
        setActiveOrder(null);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [contextOrder]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setSelectedOrder(null);
      setActiveOrder(null);
      closeTimerRef.current = null;
    }, 250);
  }, [setSelectedOrder]);

  // Escape key & body scroll lock
  useEffect(() => {
    if (!activeOrder) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeOrder, handleClose]);

  if (!activeOrder) return null;

  const selectedOrder = contextOrder ?? activeOrder;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-order-number"
      className={cn(
        "fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-250 ease-out",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
      onClick={handleClose}
    >
      {/* Container: Bottom sheet on mobile, right drawer on desktop */}
      <div
        className={cn(
          "w-full md:w-[480px] bg-[var(--color-surface)] border-t md:border-t-0 md:border-l border-[var(--color-border)] rounded-t-3xl md:rounded-none max-h-[88vh] md:max-h-full flex flex-col overflow-hidden shadow-2xl transition-transform duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform",
          isOpen
            ? "translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2 id="drawer-order-number" className="font-mono font-black text-base text-[var(--color-text)]">
              #{selectedOrder.orderNumber}
            </h2>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                selectedOrder.status === "pending" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                selectedOrder.status === "preparing" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                selectedOrder.status === "ready_for_pickup" &&
                  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                selectedOrder.status === "completed" && "bg-slate-500/15 text-slate-600 dark:text-slate-400",
                selectedOrder.status === "cancelled" && "bg-rose-500/15 text-rose-600",
              )}
            >
              {selectedOrder.status === "pending" && "Baru"}
              {selectedOrder.status === "preparing" && "Disiapkan"}
              {selectedOrder.status === "ready_for_pickup" && "Siap Ambil"}
              {selectedOrder.status === "completed" && "Selesai"}
              {selectedOrder.status === "cancelled" && "Batal"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup detail"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-2)] text-[var(--color-text-2)] transition-colors"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Customer info */}
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-3)] tracking-wider">
                Pemesan
              </span>
              <p className="font-bold text-sm text-[var(--color-text)] mt-0.5">{selectedOrder.customerName}</p>
              <p className="font-mono text-xs text-[var(--color-text-2)]">{selectedOrder.customerPhone}</p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${normalizeIndonesianPhone(selectedOrder.customerPhone)}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 active:scale-95 transition-all"
                title="Chat WhatsApp"
              >
                <WhatsappLogoIcon size={20} weight="fill" />
              </a>
              <button
                type="button"
                onClick={() => handleCallCustomer(selectedOrder.customerPhone)}
                className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 active:scale-95 transition-all"
                title="Panggilan Suara WhatsApp"
              >
                <PhoneCallIcon size={18} weight="bold" />
              </button>
            </div>
          </div>

          {/* Packing checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[var(--color-text-2)] uppercase tracking-wider">
                Daftar Produk ({selectedOrder.items.length})
              </h3>
              <span className="text-[10px] text-[var(--color-text-3)]">Klik untuk checklist packing</span>
            </div>

            <div className="space-y-1.5">
              {selectedOrder.items.map((item, idx) => {
                const isChecked = checkedItems[`${selectedOrder._id}-${idx}`];
                return (
                  <div
                    key={item.productId || `${item.name}-${idx}`}
                    onClick={() => toggleItemCheck(selectedOrder._id, idx)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all",
                      isChecked
                        ? "bg-emerald-500/5 border-emerald-500/30 text-[var(--color-text-3)] line-through"
                        : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-brand)]/40",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {isChecked ? (
                        <CheckSquareIcon size={18} className="text-emerald-500 shrink-0" weight="fill" />
                      ) : (
                        <SquareIcon size={18} className="text-[var(--color-text-3)] shrink-0" />
                      )}
                      <span className="font-medium truncate">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-xs shrink-0 ml-2">
                      {item.qty} × {formatIDR(item.price)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {selectedOrder.customerNotes && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
              <span className="font-bold">Catatan Pembeli:</span> {selectedOrder.customerNotes}
            </div>
          )}

          {/* Payment summary */}
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-2)]">
              <span>Subtotal</span>
              <span className="font-mono font-semibold">{formatIDR(selectedOrder.subtotal)}</span>
            </div>
            <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--color-text)]">Total Tagihan</span>
              <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                {formatIDR(selectedOrder.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-2)] space-y-2">
          {selectedOrder.status === "pending" && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleStartPreparing(selectedOrder._id)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand)] hover:bg-[var(--color-brand-dark)] text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 press-tactile"
              >
                <PackageIcon size={16} weight="bold" />
                <span>Mulai Siapkan Pesanan</span>
              </button>
              <button
                type="button"
                onClick={() => handleCancelOrder(selectedOrder._id)}
                className="px-3 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-semibold active:scale-95 transition-all"
                title="Batalkan"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          )}

          {selectedOrder.status === "preparing" && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleMarkReady(selectedOrder._id)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircleIcon size={16} weight="bold" />
                <span>Tandai Siap Diambil</span>
              </button>
              <button
                type="button"
                onClick={() => handleCancelOrder(selectedOrder._id)}
                className="px-3 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-semibold active:scale-95 transition-all"
                title="Batalkan"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          )}

          {selectedOrder.status === "ready_for_pickup" && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSendReadyWhatsApp(selectedOrder)}
                className="w-full py-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <WhatsappLogoIcon size={18} weight="fill" className="text-emerald-500" />
                <span>Kirim WA Siap Diambil</span>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openPaymentModal(selectedOrder)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <CreditCardIcon size={16} weight="bold" />
                  <span>Bayar & Selesaikan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCancelOrder(selectedOrder._id)}
                  className="px-3 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-semibold active:scale-95 transition-all"
                  title="Batalkan"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          )}

          {selectedOrder.status === "completed" && (
            <div className="space-y-2">
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1.5 py-1">
                <CheckCircleIcon size={18} weight="fill" />
                <span>Pesanan Selesai & Lunas</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const mockTx = {
                    _id: selectedOrder.transactionId || selectedOrder._id,
                    createdAt: selectedOrder.completedAt || selectedOrder.createdAt,
                    items: selectedOrder.items,
                    subtotal: selectedOrder.subtotal,
                    total: selectedOrder.total,
                    paymentMethod: "cash",
                  };
                  shareReceiptWhatsApp(
                    mockTx,
                    store?.name || "Toko",
                    store?.address,
                    selectedOrder.customerPhone,
                  );
                }}
                className="w-full py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-xs font-bold text-[var(--color-text)] flex items-center justify-center gap-2"
              >
                <WhatsappLogoIcon size={16} weight="fill" className="text-emerald-500" />
                <span>Kirim Struk WA</span>
              </button>
            </div>
          )}

          {selectedOrder.status === "cancelled" && (
            <div className="text-xs text-rose-600 font-medium p-2 text-center">
              {selectedOrder.cancelReason || "Pesanan Dibatalkan"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 8. Payment Modal
function PaymentModal() {
  const {
    payingOrder,
    setPayingOrder,
    paymentMethod,
    setPaymentMethod,
    cashInput,
    setCashInput,
    isCompleting,
    handleConfirmPayment,
  } = useOrderViewContext();

  if (!payingOrder) return null;

  const cashPaid = Number(cashInput) || 0;
  const change = Math.max(0, cashPaid - payingOrder.total);
  const isUnderpaid = cashPaid < payingOrder.total;
  const presets = Array.from(
    new Set([payingOrder.total, 10000, 20000, 50000, 100000, 200000, 500000]),
  )
    .filter((v) => v >= payingOrder.total)
    .sort((a, b) => a - b);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] w-full max-w-md rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <CreditCardIcon size={22} className="text-emerald-500" weight="duotone" />
            <h3 id="payment-modal-title" className="font-extrabold text-base text-[var(--color-text)]">
              Proses Bayar #{payingOrder.orderNumber}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setPayingOrder(null)}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-2)] text-[var(--color-text-2)]"
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Customer & Total */}
          <div className="p-3 rounded-2xl bg-[var(--color-surface-2)] flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-[var(--color-text)]">{payingOrder.customerName}</p>
              <p className="text-[var(--color-text-3)] font-mono">{payingOrder.customerPhone}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[var(--color-text-3)] uppercase font-semibold">
                Total Bayar
              </p>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatIDR(payingOrder.total)}
              </p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("cash");
                  setCashInput(String(payingOrder.total));
                }}
                className={cn(
                  "p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all",
                  paymentMethod === "cash"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)]",
                )}
              >
                <CurrencyDollarIcon size={18} weight="bold" />
                <span>Tunai (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("qris")}
                className={cn(
                  "p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all",
                  paymentMethod === "qris"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)]",
                )}
              >
                <QrCodeIcon size={18} weight="bold" />
                <span>QRIS Digital</span>
              </button>
            </div>
          </div>

          {/* Cash input */}
          {paymentMethod === "cash" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
                  Nominal Uang Diterima (IDR)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-black text-[var(--color-text-3)]">
                    Rp
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={cashInput}
                    onChange={(e) => setCashInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl text-base font-extrabold bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-emerald-500 text-[var(--color-text)]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Chips */}
              <div>
                <span className="block text-[10px] font-bold text-[var(--color-text-3)] uppercase tracking-wider mb-1.5">
                  Pecahan Uang Cepat
                </span>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {presets.map((val) => {
                    const isSelected = cashPaid === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCashInput(String(val))}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap active:scale-95",
                          isSelected
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                            : "bg-[var(--color-surface-2)] border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-[var(--color-text)]",
                        )}
                      >
                        {val === payingOrder.total ? "Uang Pas" : formatIDR(val)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Change / Underpaid indicator */}
              {cashPaid > 0 && (
                <div
                  className={cn(
                    "p-3 rounded-2xl border flex justify-between items-center text-xs transition-colors",
                    !isUnderpaid
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300",
                  )}
                >
                  <span className="font-extrabold">
                    {!isUnderpaid ? "Kembalian:" : "Kurang Bayar:"}
                  </span>
                  <span className="font-black text-base font-mono">
                    {formatIDR(!isUnderpaid ? change : payingOrder.total - cashPaid)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-[var(--color-border)] flex gap-2">
          <button
            type="button"
            onClick={() => setPayingOrder(null)}
            className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)]"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={
              isCompleting ||
              (paymentMethod === "cash" && (Number(cashInput) || 0) < payingOrder.total)
            }
            onClick={handleConfirmPayment}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md active:scale-95 disabled:opacity-50 transition-all"
          >
            {isCompleting ? "Menyimpan..." : "Konfirmasi & Selesai"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 9. Receipt Modal
function ReceiptModal() {
  const { completedTxData, setCompletedTxData, store, currentCashier } = useOrderViewContext();

  if (!completedTxData) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] w-full max-w-sm rounded-3xl p-5 shadow-2xl text-center animate-in zoom-in-95 duration-150">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <CheckCircleIcon size={36} weight="fill" />
        </div>

        <h3 id="receipt-modal-title" className="text-lg font-black text-[var(--color-text)]">
          Pesanan Telah Lunas!
        </h3>
        <p className="text-xs text-[var(--color-text-2)] mt-1">
          Transaksi telah dicatat ke laporan POS. Anda dapat langsung mengirim struk ke WhatsApp pembeli.
        </p>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => {
              const mockTx = {
                _id: completedTxData.txId,
                createdAt: Date.now(),
                items: completedTxData.order.items,
                subtotal: completedTxData.order.subtotal,
                total: completedTxData.order.total,
                paymentMethod: completedTxData.paymentMethod,
                cashPaid: completedTxData.cashPaid,
                change: completedTxData.change,
                cashierName: currentCashier?.name || "Kasir",
              };
              shareReceiptWhatsAppImage(
                mockTx,
                store?.name || "Toko",
                store?.address,
                "80mm",
                completedTxData.order.customerPhone,
              );
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
          >
            <WhatsappLogoIcon size={18} weight="fill" />
            <span>Kirim Gambar Struk ke WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const mockTx = {
                _id: completedTxData.txId,
                createdAt: Date.now(),
                items: completedTxData.order.items,
                subtotal: completedTxData.order.subtotal,
                total: completedTxData.order.total,
                paymentMethod: completedTxData.paymentMethod,
                cashPaid: completedTxData.cashPaid,
                change: completedTxData.change,
                cashierName: currentCashier?.name || "Kasir",
              };
              shareReceiptWhatsApp(
                mockTx,
                store?.name || "Toko",
                store?.address,
                completedTxData.order.customerPhone,
              );
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-xs font-semibold text-[var(--color-text)]"
          >
            <ReceiptIcon size={16} />
            <span>Kirim Versi Teks WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setCompletedTxData(null)}
            className="w-full py-2 text-xs font-medium text-[var(--color-text-3)] hover:text-[var(--color-text)] mt-2"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// Attach compound subcomponents to OrderView namespace
export const OrderView = Object.assign(Root, {
  Root,
  Header,
  Kanban,
  KanbanColumn,
  KanbanCard,
  Table,
  DetailDrawer,
  PaymentModal,
  ReceiptModal,
});
