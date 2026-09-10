import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatIDR, calculateItemDiscount, cn } from "#/lib/utils";
import {
  StorefrontIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  PlusIcon,
  MinusIcon,
  XIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  InfoIcon,
  ClockIcon,
  PackageIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";

export const Route = createFileRoute("/s/$storeSlug")({
  component: PublicStoreCatalog,
});

interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
  discountType?: "percentage" | "nominal";
  discountValue?: number;
  maxStock: number;
  imageUrl?: string;
}

function PublicStoreCatalog() {
  const { storeSlug } = Route.useParams();
  const navigate = useNavigate();

  const data = useQuery(api.stores.getBySlugOrId, { identifier: storeSlug });
  const createOrder = useMutation(api.onlineOrders.create);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const store = data?.store;
  const products = data?.products ?? [];

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  // Cart totals
  const { totalItems, subtotal, total } = useMemo(() => {
    let itemsCount = 0;
    let sum = 0;
    Object.values(cart).forEach((item) => {
      itemsCount += item.qty;
      sum += item.subtotal;
    });
    return {
      totalItems: itemsCount,
      subtotal: sum,
      total: sum,
    };
  }, [cart]);

  const updateQty = (product: (typeof products)[0], delta: number) => {
    setCart((prev) => {
      const existing = prev[product._id];
      const disc = calculateItemDiscount(product.price, product.discountType, product.discountValue);
      const unitPrice = disc.unitPrice;
      const currentQty = existing ? existing.qty : 0;
      const nextQty = currentQty + delta;

      if (nextQty <= 0) {
        const next = { ...prev };
        delete next[product._id];
        return next;
      }

      if (nextQty > product.stock) {
        toast.error(`Maksimal stok tersedia hanya ${product.stock}`);
        return prev;
      }

      return {
        ...prev,
        [product._id]: {
          productId: product._id,
          name: product.name,
          price: product.price,
          qty: nextQty,
          subtotal: unitPrice * nextQty,
          discountType: product.discountType as any,
          discountValue: product.discountValue,
          maxStock: product.stock,
          imageUrl: (product as any).imageUrl || product.imageId,
        },
      };
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    if (!customerName.trim()) {
      toast.error("Nama pemesan wajib diisi.");
      return;
    }

    const cleanPhone = customerPhone.trim().replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      toast.error("Nomor WhatsApp wajib diisi dengan benar (min 9 digit).");
      return;
    }

    const items = Object.values(cart).map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      qty: item.qty,
      subtotal: item.subtotal,
      discountType: item.discountType,
      discountValue: item.discountValue,
    }));

    if (items.length === 0) {
      toast.error("Keranjang belanja masih kosong.");
      return;
    }

    try {
      setIsSubmitting(true);
      const orderId = await createOrder({
        storeId: store._id,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerNotes: customerNotes.trim() || undefined,
        items,
        subtotal,
        total,
      });

      toast.success("Pesanan berhasil dibuat!");
      navigate({
        to: "/order/$orderId",
        params: { orderId },
      });
    } catch (err: any) {
      toast.error(err?.message || "Gagal membuat pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (data === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!store || store.onlineStoreEnabled === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--color-surface)] text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
          <StorefrontIcon size={32} weight="duotone" />
        </div>
        <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">
          {!store ? "Toko Tidak Ditemukan" : "Pemesanan Online Sedang Tutup"}
        </h1>
        <p className="text-sm text-[var(--color-text-2)] max-w-sm">
          {!store
            ? "Toko dengan link ini tidak ditemukan atau URL mungkin salah."
            : "Toko ini sedang menonaktifkan pemesanan online untuk sementara waktu. Silakan hubungi kasir atau coba lagi nanti."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)] pb-28">
      {/* Header Banner */}
      <header className="sticky top-0 z-30 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <StorefrontIcon size={24} weight="duotone" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-[var(--color-text)] truncate">{store.name}</h1>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  Pickup
                </span>
              </div>
              {store.address && (
                <p className="text-xs text-[var(--color-text-2)] truncate flex items-center gap-1 mt-0.5">
                  <MapPinIcon size={12} className="shrink-0" />
                  <span>{store.address}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Info Pill */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-[var(--color-text-2)]">
          <InfoIcon size={16} className="text-emerald-500 shrink-0 mt-0.5" weight="fill" />
          <div>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Pesan Online & Ambil di Toko:
            </span>{" "}
            Pilih produk, input nomor WhatsApp, dan ambil pesanan langsung di kasir tanpa antre lama. Bayar saat pickup (Tunai / QRIS).
          </div>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="max-w-2xl mx-auto px-4 pt-4 sticky top-[61px] z-20 bg-[var(--color-surface)]/95 backdrop-blur-sm pb-2 space-y-3">
        <div className="relative">
          <MagnifyingGlassIcon
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-3)]"
          />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-[var(--color-text-3)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-3)] hover:text-[var(--color-text)]"
            >
              Hapus
            </button>
          )}
        </div>

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors",
                selectedCategory === "all"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)]",
              )}
            >
              Semua ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors",
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)]",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product List */}
      <main className="max-w-2xl mx-auto px-4 pt-3">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-2)] text-sm">
            Tidak ada produk yang cocok dengan pencarian.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((p) => {
              const disc = calculateItemDiscount(p.price, p.discountType, p.discountValue);
              const inCart = cart[p._id]?.qty ?? 0;
              const isOutOfStock = p.stock <= 0;

              return (
                <div
                  key={p._id}
                  className={cn(
                    "flex flex-col justify-between p-3.5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] transition-all hover:border-[var(--color-brand)]/40",
                    isOutOfStock && "opacity-60 grayscale",
                  )}
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                      {(p as any).imageUrl || p.imageId ? (
                        <img
                          src={(p as any).imageUrl || p.imageId}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-[var(--color-text-3)]">
                          <PackageIcon size={32} weight="duotone" className="text-emerald-500/50" />
                          <span className="text-[10px] font-bold opacity-60">Toku POS</span>
                        </div>
                      )}

                      {inCart > 0 && (
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-black text-white shadow-md">
                          <span>{inCart}x</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-[var(--color-text-3)] tracking-wider">
                          {p.category}
                        </span>
                        <h3 className="font-semibold text-sm text-[var(--color-text)] line-clamp-2 mt-0.5">
                          {p.name}
                        </h3>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium",
                          p.stock > 5
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : p.stock > 0
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-rose-500/10 text-rose-600",
                        )}
                      >
                        {p.stock > 0 ? `Stok ${p.stock}` : "Habis"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-base font-bold text-[var(--color-text)]">
                        {formatIDR(disc.unitPrice)}
                      </span>
                      {disc.hasDiscount && (
                        <span className="text-xs text-[var(--color-text-3)] line-through">
                          {formatIDR(p.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add / Qty Controller */}
                  <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-end">
                    {isOutOfStock ? (
                      <span className="text-xs text-[var(--color-text-3)] font-medium">Stok Kosong</span>
                    ) : inCart > 0 ? (
                      <div className="flex items-center gap-2 bg-[var(--color-surface)] rounded-xl p-1 border border-[var(--color-border)]">
                        <button
                          type="button"
                          onClick={() => updateQty(p, -1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] active:scale-95 transition-all"
                        >
                          <MinusIcon size={14} weight="bold" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-[var(--color-text)]">
                          {inCart}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(p, 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-600 text-white active:scale-95 transition-all"
                        >
                          <PlusIcon size={14} weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateQty(p, 1)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
                      >
                        <PlusIcon size={14} weight="bold" />
                        <span>Tambah</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-emerald-600 text-white rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-3 border border-emerald-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ShoppingBagIcon size={22} weight="fill" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-100">{totalItems} Produk Dipilih</p>
                <p className="text-base font-extrabold tracking-tight">{formatIDR(total)}</p>
              </div>
            </div>
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-sm shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
            >
              <span>Lanjut</span>
              <ArrowRightIcon size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* Checkout Drawer / Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBagIcon size={20} className="text-emerald-500" weight="duotone" />
                <h2 className="font-bold text-base text-[var(--color-text)]">Checkout Pesanan Pickup</h2>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-2)] text-[var(--color-text-2)]"
              >
                <XIcon size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[var(--color-text-2)] uppercase tracking-wider">
                  Daftar Pesanan ({totalItems})
                </h4>
                <div className="space-y-2">
                  {Object.values(cart).map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs gap-3"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <PackageIcon size={18} className="text-emerald-500 opacity-60" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-semibold text-[var(--color-text)] truncate">{item.name}</p>
                        <p className="text-[var(--color-text-2)]">
                          {item.qty} × {formatIDR(item.subtotal / item.qty)} ={" "}
                          <span className="font-semibold text-[var(--color-text)]">
                            {formatIDR(item.subtotal)}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const prod = products.find((p) => p._id === item.productId);
                            if (prod) updateQty(prod, -1);
                          }}
                          className="w-6 h-6 rounded bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-2)]"
                        >
                          <MinusIcon size={12} />
                        </button>
                        <span className="w-5 text-center font-bold">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const prod = products.find((p) => p._id === item.productId);
                            if (prod) updateQty(prod, 1);
                          }}
                          className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center"
                        >
                          <PlusIcon size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Form */}
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                    Nama Pemesan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                    Nomor WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-[var(--color-text-3)] mt-1">
                    Notifikasi saat pesanan selesai disiapkan akan dikirim ke nomor WhatsApp ini.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                    Catatan Pesanan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Jangan terlalu manis, sambal dipisah..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <ClockIcon size={16} className="shrink-0 mt-0.5" weight="bold" />
                  <span>
                    Pesanan akan disiapkan oleh toko. Silakan datang ke toko untuk mengambil dan membayar di kasir (Tunai atau QRIS).
                  </span>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase font-semibold text-[var(--color-text-3)]">
                  Total Bayar di Kasir
                </p>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatIDR(total)}
                </p>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all"
              >
                {isSubmitting ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <CheckCircleIcon size={16} weight="bold" />
                    <span>Konfirmasi Pickup</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
