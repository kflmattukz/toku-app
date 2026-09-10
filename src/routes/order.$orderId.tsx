import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { formatIDR, cn } from "#/lib/utils";
import { downloadReceiptImage } from "#/lib/print";
import {
  ClockIcon,
  PackageIcon,
  CheckCircleIcon,
  XCircleIcon,
  StorefrontIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ReceiptIcon,
  DownloadSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";

export const Route = createFileRoute("/order/$orderId")({
  component: OrderTrackingPage,
});

function OrderTrackingPage() {
  const { orderId } = Route.useParams();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const order = useQuery(api.onlineOrders.getById, {
    orderId: orderId as Id<"online_orders">,
  });

  if (order === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--color-surface)] text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
          <XCircleIcon size={32} weight="duotone" />
        </div>
        <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">Pesanan Tidak Ditemukan</h1>
        <p className="text-sm text-[var(--color-text-2)] max-w-sm mb-6">
          Nomor ID pesanan ini tidak valid atau pesanan telah dihapus.
        </p>
      </div>
    );
  }

  const store = order.store;

  const steps = [
    { key: "pending", label: "Diterima" },
    { key: "preparing", label: "Disiapkan" },
    { key: "ready_for_pickup", label: "Siap Diambil" },
    { key: "completed", label: "Selesai" },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case "pending":
        return 0;
      case "preparing":
        return 1;
      case "ready_for_pickup":
        return 2;
      case "completed":
        return 3;
      default:
        return -1;
    }
  };

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)] pb-16">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <StorefrontIcon size={18} weight="duotone" />
            </div>
            <div>
              <p className="font-bold text-xs text-[var(--color-text)] truncate">{store?.name}</p>
              <p className="text-[10px] text-[var(--color-text-3)]">Status Pesanan Real-time</p>
            </div>
          </div>
          {store && (
            <Link
              to="/s/$storeSlug"
              params={{ storeSlug: store.slug || order.storeId }}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <ArrowLeftIcon size={12} />
              <span>Menu Toko</span>
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-6 space-y-5">
        {/* Status Hero Card */}
        <div
          className={cn(
            "p-6 rounded-3xl border text-center transition-all relative overflow-hidden",
            order.status === "ready_for_pickup"
              ? "bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/30"
              : order.status === "completed"
                ? "bg-gradient-to-b from-blue-500/15 via-blue-500/5 to-transparent border-blue-500/30"
                : isCancelled
                  ? "bg-rose-500/10 border-rose-500/20"
                  : "bg-[var(--color-surface-2)] border-[var(--color-border)]",
          )}
        >
          {/* Status Badge & Icon */}
          <div className="flex justify-center mb-3">
            {order.status === "ready_for_pickup" ? (
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircleIcon size={36} weight="fill" />
              </div>
            ) : order.status === "preparing" ? (
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg">
                <PackageIcon size={36} weight="duotone" />
              </div>
            ) : order.status === "completed" ? (
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                <ReceiptIcon size={36} weight="duotone" />
              </div>
            ) : isCancelled ? (
              <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg">
                <XCircleIcon size={36} weight="fill" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-emerald-500 flex items-center justify-center shadow-sm">
                <ClockIcon size={36} weight="duotone" />
              </div>
            )}
          </div>

          {/* Title & Description */}
          <h2 className="text-xl font-extrabold text-[var(--color-text)] tracking-tight">
            {order.status === "ready_for_pickup" && "Pesanan Siap Diambil! 🎉"}
            {order.status === "preparing" && "Pesanan Sedang Disiapkan"}
            {order.status === "pending" && "Menunggu Konfirmasi Toko"}
            {order.status === "completed" && "Pesanan Telah Selesai"}
            {isCancelled && "Pesanan Dibatalkan"}
          </h2>

          <p className="text-xs text-[var(--color-text-2)] mt-1.5 max-w-sm mx-auto">
            {order.status === "ready_for_pickup" &&
              "Silakan tunjukkan kode pesanan di bawah ini ke kasir toko lalu lakukan pembayaran (Tunai / QRIS)."}
            {order.status === "preparing" &&
              "Staf sedang mengumpulkan dan menyiapkan pesananmu. Halaman ini akan otomatis berganti saat siap."}
            {order.status === "pending" &&
              "Pesananmu telah masuk ke antrean kasir. Staf akan segera mulai menyiapkan."}
            {order.status === "completed" &&
              "Pembayaran telah diverifikasi dan pesanan telah diambil. Terima kasih telah berbelanja!"}
            {isCancelled && (order.cancelReason || "Pesanan dibatalkan atau waktu tunggu telah habis.")}
          </p>

          {/* Pickup Code Box */}
          <div className="mt-5 p-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] inline-block min-w-[220px]">
            <p className="text-[10px] uppercase font-bold text-[var(--color-text-3)] tracking-wider">
              Kode Ambil Pesanan
            </p>
            <p className="text-2xl font-black tracking-widest text-emerald-600 dark:text-emerald-400 mt-0.5">
              {order.orderNumber}
            </p>
          </div>
        </div>

        {/* Stepper (if not cancelled) */}
        {!isCancelled && (
          <div className="p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between relative">
              {/* Connecting Line */}
              <div className="absolute left-4 right-4 top-3 h-0.5 bg-[var(--color-border)] -z-0" />
              <div
                className="absolute left-4 top-3 h-0.5 bg-emerald-500 transition-all duration-500 -z-0"
                style={{
                  width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 88}%`,
                }}
              />

              {steps.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all",
                        isPassed
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-3)]",
                        isCurrent && "ring-4 ring-emerald-500/20 scale-110",
                      )}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-semibold mt-1.5 transition-colors",
                        isPassed ? "text-[var(--color-text)]" : "text-[var(--color-text-3)]",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Store Location Card */}
        {store && (
          <div className="p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
              <MapPinIcon size={22} weight="duotone" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-xs text-[var(--color-text)]">Lokasi Pengambilan</h3>
              <p className="text-xs font-semibold text-[var(--color-text-2)] mt-0.5">{store.name}</p>
              {store.address && (
                <p className="text-xs text-[var(--color-text-3)] mt-0.5">{store.address}</p>
              )}
            </div>
          </div>
        )}

        {/* Order Details & Summary */}
        <div className="p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2.5">
            <h3 className="text-xs font-bold text-[var(--color-text)]">Ringkasan Pesanan</h3>
            <span className="text-[10px] font-mono text-[var(--color-text-3)]">
              {new Date(order.createdAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="space-y-2.5">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center shrink-0">
                    {(item as any).imageUrl ? (
                      <img
                        src={(item as any).imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PackageIcon size={18} className="text-emerald-500 opacity-60" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--color-text)] truncate">{item.name}</p>
                    <p className="text-[10px] text-[var(--color-text-3)]">
                      {item.qty} × {formatIDR(item.price)}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-[var(--color-text)] shrink-0">
                  {formatIDR(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          {order.customerNotes && (
            <div className="pt-2 border-t border-[var(--color-border)] text-xs">
              <span className="text-[10px] font-semibold text-[var(--color-text-3)] uppercase">
                Catatan:
              </span>
              <p className="text-xs text-[var(--color-text-2)] italic mt-0.5">
                "{order.customerNotes}"
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-[var(--color-border)] flex justify-between items-center">
            <span className="text-xs font-bold text-[var(--color-text)]">Total Tagihan Kasir</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatIDR(order.total)}
            </span>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="p-3.5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs flex items-center justify-between text-[var(--color-text-2)]">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[var(--color-text-3)]">
              Pemesan
            </span>
            <p className="font-bold text-[var(--color-text)]">{order.customerName}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-[var(--color-text-3)]">
              WhatsApp
            </span>
            <p className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              {order.customerPhone}
            </p>
          </div>
        </div>

        {/* Completed Order Action: View Digital Receipt */}
        {order.status === "completed" && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ReceiptIcon size={22} weight="bold" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--color-text)]">Pesanan Selesai & Lunas</h4>
                <p className="text-xs text-[var(--color-text-2)]">Struk transaksi digital tersedia</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowReceiptModal(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ReceiptIcon size={16} weight="bold" />
              <span>Lihat Struk Digital</span>
            </button>
          </div>
        )}
      </main>

      {/* Buyer Digital Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <ReceiptIcon size={20} className="text-emerald-500" weight="duotone" />
                <h3 className="font-extrabold text-sm text-[var(--color-text)]">Struk Pembelian</h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-2)] text-[var(--color-text-2)]"
              >
                <XIcon size={16} />
              </button>
            </div>

            {/* Scrollable Thermal-style Receipt Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 font-mono text-xs shadow-xs">
                {/* Store Header */}
                <div className="text-center border-b border-dashed border-stone-300 dark:border-stone-700 pb-3">
                  <h4 className="font-black text-sm uppercase tracking-wide">
                    {store?.name || "Toko Kami"}
                  </h4>
                  {store?.address && (
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {store.address}
                    </p>
                  )}
                  <div className="mt-2 text-[10px] text-stone-500 dark:text-stone-400 space-y-0.5">
                    <p>No: #{order.orderNumber}</p>
                    <p>{new Date(order.createdAt).toLocaleString("id-ID")}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="py-3 border-b border-dashed border-stone-300 dark:border-stone-700 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[11px]">
                      <div className="flex-1 pr-2">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">
                          {item.qty} × {formatIDR(item.price)}
                        </p>
                      </div>
                      <span className="font-bold">{formatIDR(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals & Payment */}
                <div className="py-3 border-b border-dashed border-stone-300 dark:border-stone-700 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatIDR(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-black text-xs pt-1 border-t border-stone-200 dark:border-stone-800">
                    <span>Total Tagihan:</span>
                    <span>{formatIDR(order.total)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-500 dark:text-stone-400 pt-1">
                    <span>Metode:</span>
                    <span className="uppercase font-semibold">
                      {(order as any).paymentMethod === "qris" ? "QRIS Digital" : "Tunai"}
                    </span>
                  </div>
                  {(order as any).paymentMethod === "cash" && (order as any).cashPaid && (
                    <>
                      <div className="flex justify-between text-[10px] text-stone-500 dark:text-stone-400">
                        <span>Bayar Tunai:</span>
                        <span>{formatIDR((order as any).cashPaid)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-stone-500 dark:text-stone-400">
                        <span>Kembalian:</span>
                        <span>{formatIDR((order as any).change ?? 0)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Customer Details */}
                <div className="pt-2 text-[10px] text-stone-500 dark:text-stone-400 space-y-0.5">
                  <p>Pelanggan: {order.customerName}</p>
                  <p>WhatsApp: {order.customerPhone}</p>
                </div>

                {/* Footer note */}
                <div className="text-center pt-3 text-[10px] text-stone-500 dark:text-stone-400 border-t border-dashed border-stone-300 dark:border-stone-700 mt-2">
                  <p>Terima kasih telah berbelanja di {store?.name || "Toko Kami"}!</p>
                  <p className="mt-1 font-sans text-[9px] text-stone-400">Powered by Toku POS</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={async () => {
                  const receiptTx = {
                    _id: order.orderNumber,
                    createdAt: order.createdAt,
                    items: order.items.map((i) => ({
                      name: i.name,
                      qty: i.qty,
                      price: i.price,
                      subtotal: i.subtotal,
                    })),
                    subtotal: order.subtotal,
                    total: order.total,
                    paymentMethod: (order as any).paymentMethod || "cash",
                    cashPaid: (order as any).cashPaid,
                    change: (order as any).change,
                    customerName: order.customerName,
                  };

                  await downloadReceiptImage(
                    {
                      tx: receiptTx,
                      storeName: store?.name || "Toko Kami",
                      storeAddress: store?.address,
                      paperWidth: "80mm",
                    },
                    `struk-${order.orderNumber}.png`,
                  );
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <DownloadSimpleIcon size={16} weight="bold" />
                <span>Simpan Gambar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
