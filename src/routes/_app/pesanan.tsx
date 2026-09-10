import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { formatIDR, cn, normalizeIndonesianPhone } from "#/lib/utils";
import {
  PackageIcon,
  CheckCircleIcon,
  XCircleIcon,
  WhatsappLogoIcon,
  PhoneIcon,
  CreditCardIcon,
  ReceiptIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  CheckSquareIcon,
  SquareIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
  StorefrontIcon,
  XIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { shareReceiptWhatsApp, shareReceiptWhatsAppImage } from "#/lib/print";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/_app/pesanan")({
  component: PesananManagement,
});

type OrderStatus = "all" | "pending" | "preparing" | "ready_for_pickup" | "completed" | "cancelled";

function PesananManagement() {
  const { store, currentCashier } = useAppStore();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Payment Modal state
  const [payingOrder, setPayingOrder] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [cashInput, setCashInput] = useState<string>("");
  const [isCompleting, setIsCompleting] = useState(false);

  // Success Receipt Modal state
  const [completedTxData, setCompletedTxData] = useState<{
    order: any;
    txId: string;
    paymentMethod: string;
    cashPaid?: number;
    change?: number;
  } | null>(null);

  // Mutations
  const updateStatus = useMutation(api.onlineOrders.updateStatus);
  const cancelOrder = useMutation(api.onlineOrders.cancel);
  const completeAndPay = useMutation(api.onlineOrders.completeAndPay);

  // Queries
  const orders = useQuery(
    api.onlineOrders.listByStore,
    store ? { storeId: store._id, status: selectedStatus } : "skip",
  );
  const counts = useQuery(
    api.onlineOrders.countActiveByStore,
    store ? { storeId: store._id } : "skip",
  );

  // Shift query to link payment with active shift if available
  const activeShift = useQuery(
    api.shifts.getActive,
    store ? { storeId: store._id } : "skip",
  );

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

  const toggleItemCheck = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStartPreparing = async (orderId: Id<"online_orders">) => {
    try {
      await updateStatus({ orderId, status: "preparing" });
      toast.success("Pesanan mulai disiapkan.");
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengubah status.");
    }
  };

  const handleMarkReady = async (orderId: Id<"online_orders">) => {
    try {
      await updateStatus({ orderId, status: "ready_for_pickup" });
      toast.success("Pesanan ditandai siap diambil! Siap kirim WA ke pembeli.");
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengubah status.");
    }
  };

  const handleCancelOrder = async (orderId: Id<"online_orders">) => {
    const reason = window.prompt("Alasan pembatalan pesanan (stok akan dikembalikan ke produk):");
    if (reason === null) return;
    try {
      await cancelOrder({ orderId, reason: reason.trim() || undefined });
      toast.success("Pesanan dibatalkan dan stok produk telah dipulihkan.");
    } catch (err: any) {
      toast.error(err?.message || "Gagal membatalkan pesanan.");
    }
  };

  const handleSendReadyWhatsApp = (order: any) => {
    const phone = normalizeIndonesianPhone(order.customerPhone);
    const storeName = store?.name || "Toko Kami";
    const text = `Halo Kak *${order.customerName}*! 👋\n\nPesanan Anda *#${order.orderNumber}* di *${storeName}* sudah selesai disiapkan dan *SIAP DIAMBIL* di kasir. 🛍️\n\nTotal Tagihan: *${formatIDR(order.total)}*\nMetode Bayar: Tunai / QRIS saat pengambilan.\n\nSilakan datang ke toko dan sebutkan kode pesanan Anda ya. Terima kasih! 🙏`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const openPaymentModal = (order: any) => {
    setPayingOrder(order);
    setPaymentMethod("cash");
    setCashInput(String(order.total));
  };

  const handleConfirmPayment = async () => {
    if (!payingOrder || !store) return;

    const cashPaid = Number(cashInput) || 0;
    if (paymentMethod === "cash" && cashPaid < payingOrder.total) {
      toast.error("Uang yang diterima kurang dari total tagihan.");
      return;
    }

    try {
      setIsCompleting(true);
      const change = paymentMethod === "cash" ? Math.max(0, cashPaid - payingOrder.total) : 0;

      const res = await completeAndPay({
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
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses pembayaran.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="w-full pb-16">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
            Online Pickup
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--color-text)]">
            Pesanan Toko
          </h1>
          <p className="text-xs text-[var(--color-text-2)] mt-0.5">
            Kelola pesanan pickup yang masuk dari halaman toko online.
          </p>
        </div>

        {/* Live Counters */}
        {counts && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <span className="text-amber-600 dark:text-amber-400 font-bold">{counts.pending}</span>{" "}
              <span className="text-[var(--color-text-2)]">Baru</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
              <span className="text-blue-600 dark:text-blue-400 font-bold">{counts.preparing}</span>{" "}
              <span className="text-[var(--color-text-2)]">Disiapkan</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {counts.ready_for_pickup}
              </span>{" "}
              <span className="text-[var(--color-text-2)]">Siap Ambil</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search */}
      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "all" as const, label: "Semua", count: undefined },
              { id: "pending" as const, label: "Pesanan Baru", count: counts?.pending },
              { id: "preparing" as const, label: "Disiapkan", count: counts?.preparing },
              { id: "ready_for_pickup" as const, label: "Siap Diambil", count: counts?.ready_for_pickup },
              { id: "completed" as const, label: "Selesai", count: undefined },
              { id: "cancelled" as const, label: "Dibatalkan", count: undefined },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5",
                  selectedStatus === tab.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)]",
                )}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                      selectedStatus === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-3)]"
            />
            <input
              type="text"
              placeholder="Cari nama / nomor / WA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {orders === undefined ? (
        <div className="p-12 text-center text-xs text-[var(--color-text-3)]">
          Memuat daftar pesanan...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-[var(--color-surface-2)] rounded-3xl border border-[var(--color-border)]">
          <StorefrontIcon size={40} className="mx-auto text-[var(--color-text-3)] mb-2" weight="duotone" />
          <p className="text-sm font-bold text-[var(--color-text)]">Belum Ada Pesanan</p>
          <p className="text-xs text-[var(--color-text-2)] mt-1 max-w-sm mx-auto">
            {selectedStatus === "all"
              ? "Pesanan yang dibuat oleh pembeli melalui link toko online akan muncul di sini secara real-time."
              : `Tidak ada pesanan dengan status "${selectedStatus}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            return (
              <div
                key={order._id}
                className={cn(
                  "p-4 rounded-3xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex flex-col justify-between transition-all shadow-xs",
                  order.status === "ready_for_pickup" && "border-emerald-500/40 ring-2 ring-emerald-500/10",
                  order.status === "pending" && "border-amber-500/40",
                )}
              >
                <div>
                  {/* Top line: Order Number & Status badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[var(--color-text)] tracking-wider">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-3)]">
                        {new Date(order.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase",
                        order.status === "pending" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                        order.status === "preparing" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                        order.status === "ready_for_pickup" &&
                          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                        order.status === "completed" && "bg-slate-500/15 text-slate-600 dark:text-slate-400",
                        order.status === "cancelled" && "bg-rose-500/15 text-rose-600",
                      )}
                    >
                      {order.status === "pending" && "Baru"}
                      {order.status === "preparing" && "Disiapkan"}
                      {order.status === "ready_for_pickup" && "Siap Ambil"}
                      {order.status === "completed" && "Selesai"}
                      {order.status === "cancelled" && "Batal"}
                    </span>
                  </div>

                  {/* Customer Info Card */}
                  <div className="p-2.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] mb-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-[var(--color-text)]">{order.customerName}</p>
                      <p className="font-mono text-[11px] text-[var(--color-text-2)] mt-0.5">
                        {order.customerPhone}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/${normalizeIndonesianPhone(order.customerPhone)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 active:scale-95 transition-all"
                        title="Chat WhatsApp"
                      >
                        <WhatsappLogoIcon size={16} weight="fill" />
                      </a>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="w-7 h-7 rounded-xl bg-[var(--color-surface-2)] text-[var(--color-text-2)] flex items-center justify-center hover:bg-[var(--color-surface-3)] active:scale-95 transition-all"
                        title="Telepon Pembeli"
                      >
                        <PhoneIcon size={14} weight="bold" />
                      </a>
                    </div>
                  </div>

                  {/* Items packing checklist */}
                  <div className="space-y-1.5 mb-3">
                    <p className="text-[10px] uppercase font-bold text-[var(--color-text-3)] tracking-wider">
                      Item Pesanan ({order.items.length})
                    </p>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {order.items.map((item, idx) => {
                        const isChecked = checkedItems[`${order._id}-${idx}`];
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleItemCheck(order._id, idx)}
                            className={cn(
                              "flex items-center justify-between p-1.5 rounded-xl border text-xs cursor-pointer select-none transition-all",
                              isChecked
                                ? "bg-emerald-500/5 border-emerald-500/30 text-[var(--color-text-3)] line-through"
                                : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)]",
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {isChecked ? (
                                <CheckSquareIcon size={16} className="text-emerald-500 shrink-0" weight="fill" />
                              ) : (
                                <SquareIcon size={16} className="text-[var(--color-text-3)] shrink-0" />
                              )}
                              <span className="truncate">{item.name}</span>
                            </div>
                            <span className="font-bold text-[11px] shrink-0 ml-2">
                              {item.qty} × {formatIDR(item.price)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {order.customerNotes && (
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 mb-3">
                      <span className="font-bold">Catatan:</span> {order.customerNotes}
                    </div>
                  )}

                  {/* Total Amount */}
                  <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-2)] font-medium">Total Tagihan:</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatIDR(order.total)}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions based on status */}
                <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center gap-2">
                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStartPreparing(order._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold active:scale-95 transition-all shadow-xs"
                      >
                        <PackageIcon size={16} weight="bold" />
                        <span>Mulai Siapkan</span>
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-2.5 py-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-semibold active:scale-95 transition-all"
                        title="Batalkan Pesanan"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </>
                  )}

                  {order.status === "preparing" && (
                    <>
                      <button
                        onClick={() => handleMarkReady(order._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-95 transition-all shadow-xs"
                      >
                        <CheckCircleIcon size={16} weight="bold" />
                        <span>Tandai Siap Diambil</span>
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-2.5 py-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-semibold active:scale-95 transition-all"
                        title="Batalkan Pesanan"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </>
                  )}

                  {order.status === "ready_for_pickup" && (
                    <div className="w-full space-y-2">
                      <button
                        onClick={() => handleSendReadyWhatsApp(order)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold active:scale-95 transition-all"
                      >
                        <WhatsappLogoIcon size={18} weight="fill" className="text-emerald-500" />
                        <span>Kirim WA Siap Diambil</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openPaymentModal(order)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black active:scale-95 transition-all shadow-md"
                        >
                          <CreditCardIcon size={16} weight="bold" />
                          <span>Bayar & Selesaikan</span>
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="px-2.5 py-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-semibold active:scale-95 transition-all"
                          title="Batalkan Pesanan"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {order.status === "completed" && (
                    <div className="w-full flex items-center justify-between text-xs text-[var(--color-text-2)]">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircleIcon size={16} weight="fill" />
                        <span>Telah Diambil & Lunas</span>
                      </span>
                      <button
                        onClick={() => {
                          const mockTx = {
                            _id: order.transactionId || order._id,
                            createdAt: order.completedAt || order.createdAt,
                            items: order.items,
                            subtotal: order.subtotal,
                            total: order.total,
                            paymentMethod: "cash",
                          };
                          shareReceiptWhatsApp(
                            mockTx,
                            store?.name || "Toko",
                            store?.address,
                            order.customerPhone,
                          );
                        }}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <WhatsappLogoIcon size={14} weight="fill" />
                        <span>Kirim Struk WA</span>
                      </button>
                    </div>
                  )}

                  {order.status === "cancelled" && (
                    <div className="w-full text-xs text-rose-600 flex items-center gap-1.5">
                      <XCircleIcon size={16} weight="fill" />
                      <span>{order.cancelReason || "Pesanan Dibatalkan"}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      {payingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] w-full max-w-md rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CreditCardIcon size={22} className="text-emerald-500" weight="duotone" />
                <h3 className="font-extrabold text-base text-[var(--color-text)]">
                  Proses Bayar #{payingOrder.orderNumber}
                </h3>
              </div>
              <button
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
                  <p className="text-[var(--color-text-3)]">{payingOrder.customerPhone}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[var(--color-text-3)] uppercase font-semibold">
                    Total Bayar
                  </p>
                  <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
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
                    onClick={() => {
                      setPaymentMethod("qris");
                    }}
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

              {/* Cash Paid input if Cash */}
              {paymentMethod === "cash" && (() => {
                const cashPaid = Number(cashInput) || 0;
                const change = Math.max(0, cashPaid - payingOrder.total);
                const isUnderpaid = cashPaid < payingOrder.total;
                const presets = Array.from(
                  new Set([
                    payingOrder.total,
                    10000,
                    20000,
                    50000,
                    100000,
                    200000,
                    500000,
                  ]),
                )
                  .filter((v) => v >= payingOrder.total)
                  .sort((a, b) => a - b);

                return (
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

                    {/* Quick Chips Presets */}
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

                    {/* Change / Underpaid calculation indicator */}
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
                );
              })()}
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
      )}

      {/* Completion & Receipt Modal */}
      {completedTxData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] w-full max-w-sm rounded-3xl p-5 shadow-2xl text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircleIcon size={36} weight="fill" />
            </div>

            <h3 className="text-lg font-black text-[var(--color-text)]">Pesanan Telah Lunas!</h3>
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
      )}
    </div>
  );
}
