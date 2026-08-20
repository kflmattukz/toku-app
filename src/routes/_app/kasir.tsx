import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { useState, useEffect } from "react";
import { formatIDR } from "#/lib/utils";
import { printReceipt } from "#/lib/print";
import { enqueueOfflineTx, getOfflineQueue, clearOfflineQueue } from "#/lib/offline-queue";
import type { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  TrashIcon,
  MoneyIcon,
  QrCodeIcon,
  PrinterIcon,
  XIcon,
  WarningIcon,
  PackageIcon,
  PlusIcon,
  MinusIcon,
  CaretUpIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  FadersIcon,
  FireIcon,
  ImageIcon,
  StorefrontIcon,
} from "@phosphor-icons/react";

export const Route = createFileRoute("/_app/kasir")({ component: Kasir });

type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
};

type PaymentMethod = "cash" | "qris";

function Kasir() {
  const { store } = useAppStore();
  const products = useQuery(api.products.list, store ? { storeId: store._id } : "skip");
  const createTx = useMutation(api.transactions.create);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payMethod, setPayMethod] = useState<PaymentMethod>("cash");
  const [cashInput, setCashInput] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTx, setLastTx] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(typeof window !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const on = () => {
      setIsOnline(true);
      toast.success("Koneksi kembali online", {
        description: "Transaksi offline disinkronkan ke cloud",
      });
      flushOfflineQueue();
    };
    const off = () => {
      setIsOnline(false);
      toast.warning("Koneksi internet terputus", {
        description: "Toku POS berjalan dalam Mode Offline",
      });
    };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [store]);

  const flushOfflineQueue = async () => {
    if (!store) return;
    const queue = getOfflineQueue();
    if (queue.length === 0) return;
    for (const tx of queue) {
      try {
        await createTx({ ...tx, storeId: store._id as Id<"stores">, syncedFromOffline: true });
      } catch {
        /* skip */
      }
    }
    clearOfflineQueue();
  };

  const categories = ["Semua", ...new Set((products ?? []).map((p) => p.category))];
  const filtered = (products ?? []).filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "Semua" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const addToCart = (product: (typeof filtered)[0]) => {
    if (product.stock <= 0) {
      toast.error(`Stok ${product.name} habis!`, { description: "Silakan restok terlebih dahulu" });
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing)
        return prev.map((i) => (i.productId === product._id ? { ...i, qty: i.qty + 1 } : i));
      return [
        ...prev,
        { productId: product._id, name: product.name, price: product.price, qty: 1 },
      ];
    });
    toast.success(`${product.name} ditambahkan`, { description: formatIDR(product.price) });
    if (product.stock <= 5) {
      toast.warning(`Peringatan Stok: ${product.name} tersisa ${product.stock} pcs!`);
    }
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cashPaid = parseFloat(cashInput) || 0;
  const change = Math.max(0, cashPaid - total);

  const handleConfirmPayment = async () => {
    if (cart.length === 0 || !store) return;
    const tx = {
      storeId: store._id,
      items: cart,
      total,
      paymentMethod: payMethod,
      cashPaid: payMethod === "cash" ? cashPaid : undefined,
      change: payMethod === "cash" ? change : undefined,
      createdAt: Date.now(),
    };
    if (!isOnline) {
      enqueueOfflineTx({ ...tx, storeId: store._id as string });
      setLastTx({ ...tx, storeName: store.name });
      toast.warning("Mode Offline: Disimpan di Perangkat", {
        description: "Akan otomatis disinkron saat internet pulih",
      });
    } else {
      try {
        await createTx(tx);
        setLastTx({ ...tx, storeName: store.name });
        toast.success("Pembayaran Berhasil Lunas!", {
          description: `Total ${formatIDR(total)} (${payMethod.toUpperCase()})`,
        });
      } catch {
        enqueueOfflineTx({ ...tx, storeId: store._id as string });
        setLastTx({ ...tx, storeName: store.name });
        toast.warning("Tersimpan Offline (Gagal Koneksi)", {
          description: "Transaksi tetap aman di memori lokal",
        });
      }
    }
    setShowPayment(false);
    setShowMobileCart(false);
    setShowReceipt(true);
    setCart([]);
    setCashInput("");
  };

  if (!store || !products) return <Loader />;

  return (
    <div style={{ display: "flex", gap: 24, flex: 1, minHeight: "calc(100vh - 120px)" }}>
      {/* Products Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header & Pill Search Control (Matching Image Style) */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <div className="eyebrow-tag">MANAJEMEN PENJUALAN</div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  margin: "2px 0 0",
                  color: "var(--color-text)",
                  letterSpacing: "-0.02em",
                }}
              >
                Kasir & Pembelian
              </h1>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-brand)",
                fontWeight: 800,
                background: "var(--color-brand-light)",
                border: "1px solid var(--color-brand)",
                padding: "6px 14px",
                borderRadius: 99,
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {products.length} Produk
            </div>
          </div>

          {/* Pill Search Input with filter icon on right */}
          <div style={{ position: "relative", width: "100%", marginBottom: 16 }}>
            <MagnifyingGlassIcon
              size={18}
              weight="bold"
              style={{
                position: "absolute",
                left: 18,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-3)",
              }}
            />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pill-search-input"
              style={{ width: "100%", paddingRight: 48 }}
            />
            <div
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                width: 32,
                height: 32,
                borderRadius: 99,
                background: "var(--color-brand)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(234, 88, 12, 0.3)",
              }}
            >
              <FadersIcon size={16} weight="bold" />
            </div>
          </div>

          {/* Category Navigation Pills (Matching Image Horizontal Slider) */}
          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingBottom: 4,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {categories.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className="press-tactile"
                  style={{
                    padding: "10px 20px",
                    borderRadius: 99,
                    border: active
                      ? "1.5px solid var(--color-brand)"
                      : "1.5px solid var(--color-border)",
                    background: active ? "var(--color-brand)" : "var(--color-surface)",
                    color: active ? "#ffffff" : "var(--color-text-2)",
                    fontSize: 13,
                    fontWeight: active ? 800 : 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    boxShadow: active ? "0 4px 14px rgba(234, 88, 12, 0.3)" : "var(--shadow-sm)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {cat === "Semua" && (
                    <FireIcon
                      size={16}
                      weight="fill"
                      color={active ? "#ffffff" : "var(--color-brand)"}
                    />
                  )}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid — Warm Squircle Card Architecture (Copy of Image) */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 16,
            alignContent: "start",
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "64px 16px",
                color: "var(--color-text-3)",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <PackageIcon size={52} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
                Tidak ada produk{search ? ` untuk "${search}"` : ""}
              </p>
            </div>
          ) : (
            filtered.map((p) => {
              const inCart = cart.find((i) => i.productId === p._id);
              return (
                <div
                  key={p._id}
                  onClick={() => addToCart(p)}
                  className="squircle-card product-card-interactive"
                  style={{
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: 190,
                    position: "relative",
                    userSelect: "none",
                    border: inCart
                      ? "2px solid var(--color-brand)"
                      : "1.5px solid var(--color-border)",
                    boxShadow: inCart ? "0 8px 24px rgba(234, 88, 12, 0.2)" : "var(--shadow-sm)",
                  }}
                >
                  {/* Image Header area with Orange Checkmark Badge if selected */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: 110,
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                      marginBottom: 10,
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    {p.imageId ? (
                      <img
                        src={p.imageId}
                        alt={p.name}
                        className="card-img-zoom"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-text-3)",
                        }}
                      >
                        <ImageIcon size={36} weight="duotone" />
                      </div>
                    )}

                    {inCart && (
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          background: "var(--color-brand)",
                          color: "#ffffff",
                          width: 24,
                          height: 24,
                          borderRadius: 99,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(234, 88, 12, 0.4)",
                        }}
                      >
                        <CheckCircleIcon size={16} weight="fill" />
                      </div>
                    )}

                    {p.stock <= 5 && !inCart && (
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          background: "var(--color-danger)",
                          color: "#ffffff",
                          fontSize: 10,
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: 99,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <WarningIcon size={11} weight="fill" />
                        Stok {p.stock}
                      </div>
                    )}
                  </div>

                  {/* Product Title & Category */}
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "var(--color-text)",
                        lineHeight: 1.3,
                        marginBottom: 4,
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {p.name}
                    </div>
                    <span
                      className="price"
                      style={{ fontSize: 15, fontWeight: 800, color: "var(--color-brand)" }}
                    >
                      {formatIDR(p.price)}
                    </span>
                  </div>

                  {/* Integrated Quantity Stepper Controls (When in cart) */}
                  {inCart && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 10,
                        paddingTop: 8,
                        borderTop: "1px solid var(--color-border-subtle)",
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQty(p._id, -1);
                        }}
                        className="press-tactile"
                        title={inCart.qty === 1 ? "Hapus dari keranjang" : "Kurangi"}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 99,
                          background: inCart.qty === 1 ? "rgba(239, 68, 68, 0.1)" : "var(--color-surface-3)",
                          border: "none",
                          color: inCart.qty === 1 ? "var(--color-danger)" : "var(--color-text-2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        {inCart.qty === 1 ? (
                          <TrashIcon size={13} />
                        ) : (
                          <MinusIcon size={13} weight="bold" />
                        )}
                      </button>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)" }}>
                        {inCart.qty}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQty(p._id, 1);
                        }}
                        className="press-tactile"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 99,
                          background: "var(--color-brand)",
                          border: "none",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(234, 88, 12, 0.3)",
                        }}
                      >
                        <PlusIcon size={13} weight="bold" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Desktop Cart Sidebar — Squircle Panel */}
      <div
        className="desktop-only"
        style={{
          width: 360,
          flexShrink: 0,
          background: "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          flexDirection: "column",
          boxShadow: "var(--shadow-md)",
          height: "fit-content",
          maxHeight: "calc(100vh - 100px)",
          position: "sticky",
          top: 80,
          overflow: "hidden",
        }}
      >
        <CartContent
          cart={cart}
          total={total}
          updateQty={updateQty}
          removeFromCart={removeFromCart}
          setCart={setCart}
          onCheckout={() => setShowPayment(true)}
        />
      </div>

      {/* Mobile Floating Cart Action Bar (Exact match to terracotta image pill) */}
      {cart.length > 0 && !showMobileCart && (
        <div
          className="mobile-bottom-nav press-tactile animate-float-pill"
          style={{
            position: "fixed",
            bottom: 80,
            left: 16,
            right: 16,
            zIndex: 45,
            background: "var(--color-surface)",
            borderRadius: 9999,
            padding: "8px 10px 8px 18px",
            color: "var(--color-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "var(--shadow-dock)",
            cursor: "pointer",
            border: "1.5px solid var(--color-border)",
          }}
          onClick={() => setShowMobileCart(true)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text-2)" }}>
              {totalItems} Items
            </span>
            <span style={{ color: "var(--color-border)" }}>|</span>
            <span
              className="price"
              style={{ fontSize: 16, fontWeight: 800, color: "var(--color-brand)" }}
            >
              {formatIDR(total)}
            </span>
          </div>

          <button
            style={{
              background: "var(--color-brand)",
              color: "#ffffff",
              border: "none",
              borderRadius: 99,
              padding: "10px 20px",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 14px rgba(234, 88, 12, 0.35)",
            }}
          >
            <span>Bayar</span>
            <CaretUpIcon size={16} weight="bold" />
          </button>
        </div>
      )}

      {/* Mobile Cart Drawer Sheet */}
      {showMobileCart && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            className="animate-backdrop"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setShowMobileCart(false)}
          />
          <div
            className="animate-drawer"
            style={{
              position: "relative",
              background: "var(--color-surface)",
              borderTopLeftRadius: "var(--radius-xl)",
              borderTopRightRadius: "var(--radius-xl)",
              padding: "24px 20px 32px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              zIndex: 101,
              boxShadow: "var(--shadow-lg)",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 99,
                    background: "var(--color-brand-light)",
                    color: "var(--color-brand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShoppingCartIcon size={20} weight="bold" />
                </div>
                <div>
                  <h3
                    style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "var(--color-text)" }}
                  >
                    Rincian Belanja ({totalItems})
                  </h3>
                  <div style={{ fontSize: 12, color: "var(--color-text-3)" }}>
                    Periksa & atur kuantitas barang
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => {
                    setCart([]);
                    toast.info("Keranjang dikosongkan");
                  }}
                  className="press-tactile"
                  style={{
                    background: "var(--color-danger-light)",
                    border: "none",
                    color: "var(--color-danger-text)",
                    fontSize: 12,
                    fontWeight: 800,
                    padding: "6px 12px",
                    borderRadius: 99,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <TrashIcon size={14} weight="bold" />
                  <span>Hapus Semua</span>
                </button>
                <button
                  onClick={() => setShowMobileCart(false)}
                  className="press-tactile"
                  style={{
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    padding: 6,
                    borderRadius: 99,
                    cursor: "pointer",
                    color: "var(--color-text-2)",
                    display: "flex",
                  }}
                >
                  <XIcon size={18} />
                </button>
              </div>
            </div>

            {/* Itemized List Cards */}
            <div
              style={{
                overflowY: "auto",
                flex: 1,
                marginBottom: 20,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {cart.map((item) => {
                const productData = products.find((p) => p._id === item.productId);
                return (
                  <div
                    key={item.productId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      background: "var(--color-surface-2)",
                      border: "1.5px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      gap: 12,
                    }}
                  >
                    {/* Product Image Thumbnail */}
                    {productData?.imageId ? (
                      <img
                        src={productData.imageId}
                        alt={item.name}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "var(--radius-sm)",
                          objectFit: "cover",
                          flexShrink: 0,
                          border: "1px solid var(--color-border)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "var(--radius-sm)",
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-text-3)",
                          flexShrink: 0,
                        }}
                      >
                        <PackageIcon size={24} weight="duotone" />
                      </div>
                    )}

                    {/* Name & Breakdown */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: "var(--color-text)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 2 }}>
                        {item.qty} pcs x <span className="price">{formatIDR(item.price)}</span>
                      </div>
                    </div>

                    {/* Subtotal & Quantity Steppers */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 6,
                        flexShrink: 0,
                      }}
                    >
                      <span
                        className="price"
                        style={{ fontSize: 15, fontWeight: 800, color: "var(--color-brand)" }}
                      >
                        {formatIDR(item.price * item.qty)}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={() => updateQty(item.productId, -1)}
                          className="press-tactile"
                          style={qtyBtnStyle}
                        >
                          <MinusIcon size={12} weight="bold" />
                        </button>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            minWidth: 18,
                            textAlign: "center",
                            color: "var(--color-text)",
                          }}
                        >
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, 1)}
                          className="press-tactile"
                          style={{
                            ...qtyBtnStyle,
                            background: "var(--color-brand)",
                            color: "#ffffff",
                          }}
                        >
                          <PlusIcon size={12} weight="bold" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          title="Hapus dari keranjang"
                          className="press-tactile"
                          style={{
                            ...qtyBtnStyle,
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "var(--color-danger)",
                            borderColor: "transparent",
                            marginLeft: 4,
                          }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Checkout Action */}
            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 16,
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-2)" }}>
                  Subtotal ({totalItems} barang)
                </span>
                <span
                  className="price"
                  style={{ fontSize: 24, fontWeight: 800, color: "var(--color-brand)" }}
                >
                  {formatIDR(total)}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowMobileCart(false);
                  setShowPayment(true);
                }}
                className="press-tactile"
                style={{
                  ...payBtnStyle,
                  background: "var(--color-brand)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  borderRadius: 99,
                  boxShadow: "0 8px 24px rgba(234, 88, 12, 0.35)",
                }}
              >
                <MoneyIcon size={22} weight="bold" />
                <span>Lanjut Pembayaran</span>
                <ArrowRightIcon size={18} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <Modal onClose={() => setShowPayment(false)}>
          <div style={{ marginBottom: 20 }}>
            <div className="eyebrow-tag">PEMBAYARAN</div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                margin: "2px 0 0",
                color: "var(--color-text)",
                letterSpacing: "-0.02em",
              }}
            >
              Konfirmasi Transaksi
            </h2>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {(["cash", "qris"] as PaymentMethod[]).map((m) => {
              const active = payMethod === m;
              return (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  className="press-tactile"
                  style={{
                    flex: 1,
                    padding: "14px 12px",
                    borderRadius: 99,
                    border: `2px solid ${active ? "var(--color-brand)" : "var(--color-border)"}`,
                    background: active ? "var(--color-brand-light)" : "var(--color-surface)",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                    color: active ? "var(--color-brand)" : "var(--color-text-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: active ? "var(--shadow-sm)" : "none",
                  }}
                >
                  {m === "cash" ? (
                    <MoneyIcon size={20} weight="duotone" />
                  ) : (
                    <QrCodeIcon size={20} weight="duotone" />
                  )}
                  {m === "cash" ? "Tunai (Cash)" : "QRIS Digital"}
                </button>
              );
            })}
          </div>

          <div
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "18px",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-3)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Total Bayar
            </div>
            <div
              className="price"
              style={{ fontSize: 30, fontWeight: 800, color: "var(--color-brand)", marginTop: 2 }}
            >
              {formatIDR(total)}
            </div>
          </div>

          {payMethod === "cash" ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Uang Diterima (IDR)</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 16,
                      fontSize: 16,
                      fontWeight: 800,
                      color: "var(--color-text-2)",
                    }}
                  >
                    Rp
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={cashInput}
                    onChange={(e) => setCashInput(e.target.value)}
                    style={{
                      ...inputStyle,
                      paddingLeft: 46,
                      fontSize: 18,
                      fontWeight: 700,
                      height: 48,
                      borderRadius: 99,
                    }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 20,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {Array.from(new Set([total, 10000, 20000, 50000, 100000]))
                  .filter((v) => v >= total)
                  .map((preset, idx) => (
                    <button
                      key={`${preset}-${idx}`}
                      type="button"
                      onClick={() => setCashInput(String(preset))}
                      className="press-tactile price"
                      style={{
                        padding: "9px 16px",
                        borderRadius: 99,
                        border: "1.5px solid var(--color-border)",
                        background: "var(--color-surface-2)",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                        color: "var(--color-text)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {preset === total ? "Uang Pas" : formatIDR(preset)}
                    </button>
                  ))}
              </div>

              {cashPaid > 0 && (
                <div
                  style={{
                    background:
                      cashPaid >= total
                        ? "var(--color-success-light)"
                        : "var(--color-danger-light)",
                    border: `1px solid ${cashPaid >= total ? "var(--color-success)" : "var(--color-danger)"}`,
                    borderRadius: "var(--radius-md)",
                    padding: "14px 18px",
                    marginBottom: 20,
                  }}
                >
                  <span
                    className="price"
                    style={{
                      fontSize: 15,
                      color:
                        cashPaid >= total
                          ? "var(--color-success-text)"
                          : "var(--color-danger-text)",
                      fontWeight: 800,
                    }}
                  >
                    {cashPaid >= total
                      ? `Kembalian: ${formatIDR(change)}`
                      : `Kurang Bayar: ${formatIDR(total - cashPaid)}`}
                  </span>
                </div>
              )}
              <button
                onClick={handleConfirmPayment}
                disabled={cashPaid < total}
                className="press-tactile"
                style={{
                  ...payBtnStyle,
                  background: cashPaid >= total ? "var(--color-brand)" : "var(--color-border)",
                  color: "#ffffff",
                  cursor: cashPaid >= total ? "pointer" : "not-allowed",
                  borderRadius: 99,
                  boxShadow: cashPaid >= total ? "0 8px 24px rgba(234, 88, 12, 0.35)" : "none",
                }}
              >
                Selesaikan Pembayaran Tunai
              </button>
            </>
          ) : (
            <>
              <div
                style={{
                  textAlign: "center",
                  padding: "28px 16px",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: 20,
                }}
              >
                <QrCodeIcon
                  size={88}
                  weight="duotone"
                  color="var(--color-brand)"
                  style={{ marginBottom: 12 }}
                />
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)" }}>
                  Scan QRIS Pelanggan
                </div>
                <p style={{ fontSize: 12, color: "var(--color-text-3)", margin: "4px 0 0" }}>
                  Mendukung GoPay, OVO, Dana, ShopeePay & LinkAja
                </p>
              </div>
              <button
                onClick={handleConfirmPayment}
                className="press-tactile"
                style={{
                  ...payBtnStyle,
                  background: "var(--color-brand)",
                  color: "#ffffff",
                  borderRadius: 99,
                  boxShadow: "0 8px 24px rgba(234, 88, 12, 0.35)",
                }}
              >
                Konfirmasi Pembayaran QRIS Lunas
              </button>
            </>
          )}
        </Modal>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastTx && (
        <Modal onClose={() => setShowReceipt(false)}>
          <div id="toku-receipt-content" className="receipt-print">
            <Receipt tx={lastTx} storeName={store.name} />
          </div>
          <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button
              onClick={() => printReceipt("toku-receipt-content")}
              className="press-tactile"
              style={{
                ...payBtnStyle,
                background: "var(--color-brand)",
                color: "#ffffff",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 99,
                boxShadow: "0 4px 14px rgba(234, 88, 12, 0.3)",
              }}
            >
              <PrinterIcon size={18} weight="bold" />
              Cetak Struk
            </button>
            <button
              onClick={() => setShowReceipt(false)}
              className="press-tactile"
              style={{
                ...payBtnStyle,
                background: "var(--color-surface-2)",
                color: "var(--color-text)",
                flex: 1,
                border: "1px solid var(--color-border)",
                borderRadius: 99,
              }}
            >
              Transaksi Baru
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CartContent({ cart, total, updateQty, removeFromCart, setCart, onCheckout }: any) {
  return (
    <>
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--color-surface-2)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 99,
            background: "var(--color-brand-light)",
            color: "var(--color-brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShoppingCartIcon size={18} weight="bold" />
        </div>
        <h2
          style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--color-text)", flex: 1 }}
        >
          Keranjang {cart.length > 0 && `(${cart.length})`}
        </h2>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", minHeight: 220 }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-3)" }}>
            <ShoppingCartIcon size={44} style={{ opacity: 0.25, marginBottom: 12 }} />
            <p style={{ fontSize: 13, margin: 0, fontWeight: 600 }}>
              Keranjang kosong.
              <br />
              Sentuh produk untuk menambahkan.
            </p>
          </div>
        ) : (
          cart.map((item: CartItem) => (
            <div
              key={item.productId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 0",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--color-text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </div>
                <div
                  className="price"
                  style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 2 }}
                >
                  {formatIDR(item.price)}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => updateQty(item.productId, -1)}
                  className="press-tactile"
                  style={qtyBtnStyle}
                >
                  <MinusIcon size={12} weight="bold" />
                </button>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    minWidth: 20,
                    textAlign: "center",
                    color: "var(--color-text)",
                  }}
                >
                  {item.qty}
                </span>
                <button
                  onClick={() => updateQty(item.productId, 1)}
                  className="press-tactile"
                  style={{ ...qtyBtnStyle, background: "var(--color-brand)", color: "#ffffff" }}
                >
                  <PlusIcon size={12} weight="bold" />
                </button>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  title="Hapus dari keranjang"
                  className="press-tactile"
                  style={{
                    ...qtyBtnStyle,
                    background: "transparent",
                    color: "var(--color-danger)",
                    borderColor: "transparent",
                    marginLeft: 2,
                  }}
                >
                  <TrashIcon size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          padding: "20px",
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-2)" }}>
            Total Tagihan
          </span>
          <span
            className="price"
            style={{ fontSize: 24, fontWeight: 800, color: "var(--color-brand)" }}
          >
            {formatIDR(total)}
          </span>
        </div>
        <button
          onClick={onCheckout}
          disabled={cart.length === 0}
          className="press-tactile"
          style={{
            width: "100%",
            padding: "14px",
            background: cart.length === 0 ? "var(--color-border)" : "var(--color-brand)",
            color: "#ffffff",
            border: "none",
            borderRadius: 99,
            fontSize: 15,
            fontWeight: 800,
            cursor: cart.length === 0 ? "not-allowed" : "pointer",
            boxShadow: cart.length > 0 ? "0 8px 24px rgba(234, 88, 12, 0.35)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <MoneyIcon size={20} weight="bold" />
          <span>Bayar Sekarang</span>
        </button>
        {cart.length > 0 && (
          <button
            onClick={() => setCart([])}
            style={{
              width: "100%",
              marginTop: 10,
              padding: "8px",
              background: "none",
              border: "none",
              color: "var(--color-text-3)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <TrashIcon size={14} />
            Kosongkan Keranjang
          </button>
        )}
      </div>
    </>
  );
}

function Receipt({ tx, storeName }: { tx: any; storeName: string }) {
  const now = new Date(tx.createdAt);
  const txId = tx._id
    ? `TX-${String(tx._id).slice(-6).toUpperCase()}`
    : `TX-${now.getTime().toString().slice(-6)}`;

  return (
    <div className="receipt-paper">
      {/* Store Header */}
      <div
        style={{
          textAlign: "center",
          borderBottom: "2px dashed #e5e5e5",
          paddingBottom: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 99,
            background: "#ea580c",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 8px",
            boxShadow: "0 4px 12px rgba(234, 88, 12, 0.25)",
          }}
        >
          <img src="/logo.png" alt="Toku POS" style={{ width: 28, height: 28, objectFit: "contain" }} />
        </div>
        <strong
          style={{
            fontSize: 18,
            color: "#1c1917",
            display: "block",
            letterSpacing: "-0.02em",
          }}
        >
          {storeName}
        </strong>
        <div style={{ fontSize: 11, color: "#78716c", marginTop: 4 }}>
          {now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
          {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 8,
            padding: "2px 10px",
            borderRadius: 99,
            background: "#f5f5f4",
            border: "1px solid #e7e5e4",
            fontSize: 11,
            fontWeight: 800,
            color: "#ea580c",
          }}
        >
          #{txId}
        </div>
      </div>

      {/* Item List */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 10,
            fontWeight: 800,
            color: "#78716c",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 8,
          }}
        >
          <span>ITEM BARANG</span>
          <span>SUBTOTAL</span>
        </div>

        {tx.items.map((item: CartItem, i: number) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "6px 0",
              borderBottom: i === tx.items.length - 1 ? "none" : "1px solid #f5f5f4",
            }}
          >
            <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1c1917" }}>{item.name}</div>
              <div style={{ fontSize: 11, color: "#78716c" }}>
                {item.qty} x <span className="price">{formatIDR(item.price)}</span>
              </div>
            </div>
            <span className="price" style={{ fontSize: 13, fontWeight: 800, color: "#1c1917" }}>
              {formatIDR(item.price * item.qty)}
            </span>
          </div>
        ))}
      </div>

      {/* Payment Details */}
      <div
        style={{
          borderTop: "2px dashed #e5e5e5",
          paddingTop: 14,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
            fontSize: 12,
            color: "#57534e",
          }}
        >
          <span>Metode Bayar</span>
          <span style={{ fontWeight: 800, color: "#1c1917" }}>
            {tx.paymentMethod === "cash" ? "Tunai (Cash)" : "QRIS Digital"}
          </span>
        </div>

        {tx.paymentMethod === "cash" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
                fontSize: 12,
                color: "#57534e",
              }}
            >
              <span>Uang Diterima</span>
              <span className="price" style={{ color: "#1c1917" }}>
                {formatIDR(tx.cashPaid)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                fontSize: 12,
                color: "#57534e",
              }}
            >
              <span>Kembalian</span>
              <span className="price" style={{ fontWeight: 800, color: "#047857" }}>
                {formatIDR(tx.change)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Total Banner */}
      <div
        style={{
          background: "#fff7ed",
          border: "1.5px solid #ea580c",
          borderRadius: "var(--radius-md)",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: "#ea580c",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          TOTAL BAYAR
        </span>
        <span className="price" style={{ fontSize: 22, fontWeight: 800, color: "#ea580c" }}>
          {formatIDR(tx.total)}
        </span>
      </div>

      {/* Thermal Barcode Graphic & Footer */}
      <div style={{ textAlign: "center", paddingTop: 4 }}>
        <div
          style={{
            fontSize: 18,
            letterSpacing: "4px",
            color: "#a8a29e",
            marginBottom: 8,
            opacity: 0.7,
          }}
        >
          ||| | || |||| | ||| || |||
        </div>
        <div style={{ fontSize: 11, color: "#78716c", fontWeight: 600 }}>
          Terima kasih telah berbelanja!
        </div>
        <div style={{ fontSize: 10, color: "#ea580c", fontWeight: 800, marginTop: 2 }}>
          Toku POS · Kasir Digital UMKM
        </div>
      </div>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="animate-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        backdropFilter: "blur(8px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-modal"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "28px",
          width: "100%",
          maxWidth: 460,
          boxShadow: "var(--shadow-lg)",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          className="press-tactile no-print"
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: 99,
            cursor: "pointer",
            color: "var(--color-text-2)",
            display: "flex",
            padding: 6,
          }}
        >
          <XIcon size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <PackageIcon size={48} color="var(--color-brand)" weight="duotone" style={{ opacity: 0.5 }} />
      <p style={{ color: "var(--color-text-2)", fontSize: 14, fontWeight: 700 }}>Memuat Kasir...</p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px 16px",
  border: "1.5px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  fontSize: 15,
  background: "var(--color-surface)",
  color: "var(--color-text)",
  outline: "none",
  width: "100%",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--color-text)",
  marginBottom: 8,
};
const qtyBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 99,
  border: "1px solid var(--color-border)",
  background: "var(--color-surface-2)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--color-text)",
};
const payBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 20px",
  border: "none",
  borderRadius: 99,
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
  color: "#ffffff",
};
