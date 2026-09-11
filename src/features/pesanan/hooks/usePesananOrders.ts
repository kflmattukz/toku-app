import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { normalizeIndonesianPhone, formatIDR } from "#/lib/utils";
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
} from "#/lib/pwa-notifications";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { OrderRecord, OrderStatus, OrderViewMode, CompletedTxData } from "../types";

export function usePesananOrders() {
  const { store, currentCashier } = useAppStore();

  // View mode persistence
  const [viewMode, setViewModeState] = useState<OrderViewMode>(() => {
    if (typeof window === "undefined") return "kanban";
    try {
      const saved = localStorage.getItem("toku_pesanan_view_mode");
      return saved === "table" || saved === "kanban" ? saved : "kanban";
    } catch {
      return "kanban";
    }
  });

  const setViewMode = useCallback((mode: OrderViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem("toku_pesanan_view_mode", mode);
    } catch {}
  }, []);

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCancelledColumn, setShowCancelledColumn] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Selected order for detail drawer
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Payment Modal state
  const [payingOrder, setPayingOrder] = useState<OrderRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [cashInput, setCashInput] = useState<string>("");
  const [isCompleting, setIsCompleting] = useState(false);

  // Success Receipt Modal state
  const [completedTxData, setCompletedTxData] = useState<CompletedTxData | null>(null);

  // PWA Notification Banner state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() =>
    typeof window !== "undefined" ? getNotificationPermissionStatus() : "denied",
  );
  const [showNotifBanner, setShowNotifBanner] = useState(true);

  // Queries
  const ordersQuery = useQuery(
    api.onlineOrders.listByStore,
    store ? { storeId: store._id, status: viewMode === "kanban" ? "all" : selectedStatus } : "skip",
  );
  const counts = useQuery(
    api.onlineOrders.countActiveByStore,
    store ? { storeId: store._id } : "skip",
  );
  const activeShift = useQuery(
    api.shifts.getActive,
    store ? { storeId: store._id } : "skip",
  );

  // Mutations
  const updateStatusMutation = useMutation(api.onlineOrders.updateStatus);
  const cancelOrderMutation = useMutation(api.onlineOrders.cancel);
  const completeAndPayMutation = useMutation(api.onlineOrders.completeAndPay);

  const orders: OrderRecord[] = useMemo(() => {
    return (ordersQuery ?? []) as OrderRecord[];
  }, [ordersQuery]);

  // Search filtering
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q),
    );
  }, [orders, searchQuery]);

  // Keep selected order in sync with query updates
  const activeSelectedOrder = useMemo(() => {
    if (!selectedOrder) return null;
    return orders.find((o) => o._id === selectedOrder._id) || selectedOrder;
  }, [orders, selectedOrder]);

  const toggleItemCheck = useCallback((orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleStartPreparing = useCallback(async (orderId: Id<"online_orders">) => {
    try {
      await updateStatusMutation({ orderId, status: "preparing" });
      toast.success("Pesanan mulai disiapkan.");
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengubah status.");
    }
  }, [updateStatusMutation]);

  const handleMarkReady = useCallback(async (orderId: Id<"online_orders">) => {
    try {
      await updateStatusMutation({ orderId, status: "ready_for_pickup" });
      toast.success("Pesanan siap diambil!");
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengubah status.");
    }
  }, [updateStatusMutation]);

  const handleCancelOrder = useCallback(async (orderId: Id<"online_orders">) => {
    const reason = window.prompt("Alasan pembatalan pesanan (stok akan dikembalikan ke produk):");
    if (reason === null) return;
    try {
      await cancelOrderMutation({ orderId, reason: reason.trim() || undefined });
      toast.success("Pesanan dibatalkan dan stok produk dipulihkan.");
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      toast.error(err?.message || "Gagal membatalkan pesanan.");
    }
  }, [cancelOrderMutation, selectedOrder]);

  const handleSendReadyWhatsApp = useCallback((order: OrderRecord) => {
    const phone = normalizeIndonesianPhone(order.customerPhone);
    const storeName = store?.name || "Toko Kami";
    const text = `Halo Kak *${order.customerName}*! 👋\n\nPesanan Anda *#${order.orderNumber}* di *${storeName}* sudah selesai disiapkan dan *SIAP DIAMBIL* di kasir. 🛍️\n\nTotal Tagihan: *${formatIDR(order.total)}*\nMetode Bayar: Tunai / QRIS saat pengambilan.\n\nSilakan datang ke toko dan sebutkan kode pesanan Anda ya. Terima kasih! 🙏`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }, [store?.name]);

  const handleCallCustomer = useCallback((customerPhone: string) => {
    const phone = normalizeIndonesianPhone(customerPhone);
    if (!phone) {
      toast.error("Nomor telepon tidak valid");
      return;
    }
    window.location.href = `whatsapp://call?phone=${phone}`;
  }, []);

  const openPaymentModal = useCallback((order: OrderRecord) => {
    setPayingOrder(order);
    setPaymentMethod("cash");
    setCashInput(String(order.total));
  }, []);

  const handleConfirmPayment = useCallback(async () => {
    if (!payingOrder || !store) return;

    const cashPaid = Number(cashInput) || 0;
    if (paymentMethod === "cash" && cashPaid < payingOrder.total) {
      toast.error("Uang yang diterima kurang dari total tagihan.");
      return;
    }

    try {
      setIsCompleting(true);
      const change = paymentMethod === "cash" ? Math.max(0, cashPaid - payingOrder.total) : 0;

      const res = await completeAndPayMutation({
        orderId: payingOrder._id,
        paymentMethod,
        cashPaid: paymentMethod === "cash" ? cashPaid : undefined,
        change: paymentMethod === "cash" ? change : undefined,
        cashierId: currentCashier?.id,
        cashierName: currentCashier?.name || "Kasir",
        shiftId: activeShift?._id,
      });

      toast.success("Pembayaran berhasil! Transaksi POS telah dibuat.");
      setCompletedTxData({
        order: payingOrder,
        txId: res.transactionId as string,
        paymentMethod,
        cashPaid: paymentMethod === "cash" ? cashPaid : undefined,
        change: paymentMethod === "cash" ? change : undefined,
      });
      setPayingOrder(null);
      if (selectedOrder?._id === payingOrder._id) {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses pembayaran.");
    } finally {
      setIsCompleting(false);
    }
  }, [payingOrder, store, cashInput, paymentMethod, completeAndPayMutation, currentCashier, activeShift, selectedOrder]);

  const handleEnableNotification = useCallback(async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === "granted") {
      toast.success("Notifikasi HP berhasil diaktifkan!");
    } else if (perm === "denied") {
      toast.error("Izin notifikasi ditolak di browser HP.");
    }
  }, []);

  const handleStatusTransition = useCallback(async (order: OrderRecord, targetStatus: OrderStatus) => {
    if (order.status === targetStatus) return;

    // Guard: completed or cancelled orders cannot be transitioned
    if (order.status === "completed" || order.status === "cancelled") {
      toast.warning(
        `Pesanan #${order.orderNumber} sudah ${order.status === "completed" ? "selesai" : "dibatalkan"} dan tidak dapat dipindahkan.`,
      );
      return;
    }

    // Guard: in-progress orders cannot be moved backward to pending
    if (targetStatus === "pending") {
      toast.warning(
        `Pesanan #${order.orderNumber} yang sudah diproses tidak dapat dikembalikan ke status Baru.`,
      );
      return;
    }

    if (targetStatus === "completed") {
      openPaymentModal(order);
      return;
    }

    if (targetStatus === "cancelled") {
      await handleCancelOrder(order._id);
      return;
    }

    if (targetStatus === "preparing" || targetStatus === "ready_for_pickup") {
      try {
        await updateStatusMutation({ orderId: order._id, status: targetStatus });
        toast.success(`Status pesanan #${order.orderNumber} berhasil diperbarui.`);
      } catch (err: any) {
        toast.error(err?.message || "Gagal memperbarui status.");
      }
    }
  }, [openPaymentModal, handleCancelOrder, updateStatusMutation]);

  return {
    store,
    currentCashier,
    viewMode,
    setViewMode,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    showCancelledColumn,
    setShowCancelledColumn,
    checkedItems,
    toggleItemCheck,
    orders,
    filteredOrders,
    counts,
    selectedOrder: activeSelectedOrder,
    setSelectedOrder,
    payingOrder,
    setPayingOrder,
    paymentMethod,
    setPaymentMethod,
    cashInput,
    setCashInput,
    isCompleting,
    completedTxData,
    setCompletedTxData,
    notifPermission,
    showNotifBanner,
    setShowNotifBanner,
    handleEnableNotification,
    handleStartPreparing,
    handleMarkReady,
    handleCancelOrder,
    handleSendReadyWhatsApp,
    handleCallCustomer,
    openPaymentModal,
    handleConfirmPayment,
    handleStatusTransition,
  };
}
