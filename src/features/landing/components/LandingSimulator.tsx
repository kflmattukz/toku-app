import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  MinusIcon,
  MoneyIcon,
  PlusIcon,
  PrinterIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { formatIDR } from "#/lib/utils";
import { SIMULATOR_ITEMS, type SimulatorItem } from "../data";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface CartItem {
  item: SimulatorItem;
  qty: number;
}

export function LandingSimulator() {
  const containerRef = useScrollReveal<HTMLElement>({ threshold: 0.1 });
  const [cart, setCart] = useState<CartItem[]>([
    { item: SIMULATOR_ITEMS[0], qty: 1 },
    { item: SIMULATOR_ITEMS[1], qty: 1 },
  ]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash");
  const [isPaid, setIsPaid] = useState(false);
  const [txNumber] = useState("TX-1082");

  const addItem = (item: SimulatorItem) => {
    if (isPaid) setIsPaid(false);
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) => (c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    if (isPaid) setIsPaid(false);
    setCart((prev) =>
      prev.flatMap((c) => {
        if (c.item.id === id) {
          const nextQty = c.qty + delta;
          return nextQty > 0 ? [{ ...c, qty: nextQty }] : [];
        }
        return [c];
      }),
    );
  };

  const removeItem = (id: string) => {
    if (isPaid) setIsPaid(false);
    setCart((prev) => prev.filter((c) => c.item.id !== id));
  };

  const resetCart = () => {
    setIsPaid(false);
    setCart([
      { item: SIMULATOR_ITEMS[0], qty: 1 },
      { item: SIMULATOR_ITEMS[1], qty: 1 },
    ]);
  };

  const total = cart.reduce((acc, curr) => acc + curr.item.price * curr.qty, 0);
  const totalItems = cart.reduce((acc, curr) => acc + curr.qty, 0);

  return (
    <section
      ref={containerRef}
      style={{ padding: "0 20px 80px", maxWidth: 1040, margin: "0 auto" }}
    >
      <div className="reveal-init doppelrand-shell" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="doppelrand-core" style={{ padding: 0, overflow: "hidden" }}>
          {/* Window Topbar */}
          <div
            style={{
              background: "var(--color-surface-2)",
              padding: "12px 18px",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 11, height: 11, borderRadius: 99, background: "#ef4444" }} />
              <div style={{ width: 11, height: 11, borderRadius: 99, background: "#f59e0b" }} />
              <div style={{ width: 11, height: 11, borderRadius: 99, background: "#10b981" }} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--color-text-2)",
                  marginLeft: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ShieldCheckIcon size={16} color="var(--color-brand)" weight="fill" />
                <span>Simulasi Kasir Interaktif (Klik produk untuk mencoba)</span>
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  background: "var(--color-brand-light)",
                  color: "var(--color-brand)",
                  padding: "2px 10px",
                  borderRadius: 99,
                  border: "1px solid var(--color-brand)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 99,
                    background: "var(--color-brand)",
                    display: "inline-block",
                  }}
                />
                ONLINE SYNC
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div
            style={{
              padding: "22px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
              gap: 20,
              background: "var(--color-surface)",
            }}
          >
            {/* Catalog Grid */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "var(--color-text-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Katalog Barang Kasir
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-brand)" }}>
                  + Klik untuk tambah
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {SIMULATOR_ITEMS.map((item) => {
                  const cartEntry = cart.find((c) => c.item.id === item.id);
                  const isSelected = Boolean(cartEntry);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addItem(item)}
                      className="press-tactile"
                      style={{
                        textAlign: "left",
                        background: isSelected
                          ? "var(--color-surface)"
                          : "var(--color-surface-2)",
                        border: isSelected
                          ? "1.5px solid var(--color-brand)"
                          : "1.5px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        padding: "12px",
                        boxShadow: isSelected
                          ? "0 4px 14px rgba(234, 88, 12, 0.16)"
                          : "var(--shadow-sm)",
                        position: "relative",
                        cursor: "pointer",
                        transition: "all 180ms ease",
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            background: "var(--color-brand)",
                            color: "#fff",
                            width: 20,
                            height: 20,
                            borderRadius: 99,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          {cartEntry?.qty}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "var(--color-text)",
                          marginBottom: 4,
                          paddingRight: isSelected ? 20 : 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        className="price"
                        style={{ fontSize: 13, fontWeight: 800, color: "var(--color-brand)" }}
                      >
                        {formatIDR(item.price)}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: item.isLowStock
                            ? "var(--color-danger-text)"
                            : "var(--color-text-3)",
                          marginTop: 4,
                          fontWeight: 700,
                        }}
                      >
                        Stok: {item.stock} pcs {item.isLowStock && "⚠️"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cart & Simulated Receipt */}
            <div
              style={{
                background: "var(--color-surface-2)",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 320,
              }}
            >
              {isPaid ? (
                /* Simulated Thermal Receipt Output */
                <div
                  className="receipt-dispense"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px dashed var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                    fontFamily: "var(--font-mono)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <div style={{ textAlign: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)" }}>
                      TOKU POS MAKASSAR
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>
                      Nota Transaksi: #{txNumber}
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        color: "var(--color-success)",
                        fontWeight: 800,
                        marginTop: 4,
                      }}
                    >
                      <CheckCircleIcon size={14} weight="fill" /> LUNAS ({paymentMethod.toUpperCase()}
                      )
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px dashed var(--color-border)",
                      borderBottom: "1px dashed var(--color-border)",
                      padding: "8px 0",
                      fontSize: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {cart.map((c) => (
                      <div key={c.item.id} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>
                          {c.qty}x {c.item.name}
                        </span>
                        <span>{formatIDR(c.item.price * c.qty)}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 10,
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    <span>TOTAL BAYAR:</span>
                    <span style={{ color: "var(--color-brand)" }}>{formatIDR(total)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={resetCart}
                    className="press-tactile"
                    style={{
                      marginTop: 16,
                      width: "100%",
                      padding: "8px",
                      background: "var(--color-brand-light)",
                      border: "1px solid var(--color-brand)",
                      borderRadius: 99,
                      color: "var(--color-brand)",
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <ArrowCounterClockwiseIcon size={14} weight="bold" /> Transaksi Baru
                  </button>
                </div>
              ) : (
                /* Cart Item List & Pay Controls */
                <>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                        paddingBottom: 8,
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: "var(--color-text)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <ShoppingCartIcon size={16} weight="fill" color="var(--color-brand)" /> Nota
                        Kasir ({totalItems} Item)
                      </div>
                      <span
                        className="price"
                        style={{ fontSize: 12, fontWeight: 800, color: "var(--color-brand)" }}
                      >
                        #{txNumber}
                      </span>
                    </div>

                    {cart.length === 0 ? (
                      <div
                        style={{
                          padding: "28px 0",
                          textAlign: "center",
                          color: "var(--color-text-3)",
                          fontSize: 13,
                        }}
                      >
                        Keranjang masih kosong. Klik barang di sebelah kiri!
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {cart.map((c) => (
                          <div
                            key={c.item.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              fontSize: 12,
                            }}
                          >
                            <span
                              style={{
                                color: "var(--color-text)",
                                fontWeight: 700,
                                flex: 1,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {c.item.name}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                              <button
                                type="button"
                                onClick={() => updateQty(c.item.id, -1)}
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 4,
                                  border: "1px solid var(--color-border)",
                                  background: "var(--color-surface)",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <MinusIcon size={10} weight="bold" />
                              </button>
                              <span style={{ fontWeight: 800, minWidth: 16, textAlign: "center" }}>
                                {c.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQty(c.item.id, 1)}
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 4,
                                  border: "1px solid var(--color-border)",
                                  background: "var(--color-surface)",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <PlusIcon size={10} weight="bold" />
                              </button>
                              <span
                                className="price"
                                style={{
                                  fontWeight: 800,
                                  color: "var(--color-text)",
                                  minWidth: 70,
                                  textAlign: "right",
                                }}
                              >
                                {formatIDR(c.item.price * c.qty)}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeItem(c.item.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--color-danger)",
                                  cursor: "pointer",
                                  padding: 2,
                                }}
                              >
                                <TrashIcon size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment controls */}
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 12,
                      borderTop: "1.5px dashed var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--color-text-3)",
                          textTransform: "uppercase",
                        }}
                      >
                        Total Bayar
                      </span>
                      <span
                        className="price"
                        style={{ fontSize: 20, fontWeight: 800, color: "var(--color-brand)" }}
                      >
                        {formatIDR(total)}
                      </span>
                    </div>

                    {/* Method Selector */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        marginBottom: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cash")}
                        className="press-tactile"
                        style={{
                          background:
                            paymentMethod === "cash"
                              ? "var(--color-brand)"
                              : "var(--color-surface)",
                          color: paymentMethod === "cash" ? "#fff" : "var(--color-text)",
                          border:
                            paymentMethod === "cash"
                              ? "1px solid var(--color-brand)"
                              : "1px solid var(--color-border)",
                          borderRadius: 99,
                          padding: "7px 10px",
                          textAlign: "center",
                          fontSize: 12,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          cursor: "pointer",
                        }}
                      >
                        <MoneyIcon size={14} weight="bold" /> Tunai
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("qris")}
                        className="press-tactile"
                        style={{
                          background:
                            paymentMethod === "qris"
                              ? "var(--color-brand)"
                              : "var(--color-surface)",
                          color: paymentMethod === "qris" ? "#fff" : "var(--color-text)",
                          border:
                            paymentMethod === "qris"
                              ? "1px solid var(--color-brand)"
                              : "1px solid var(--color-border)",
                          borderRadius: 99,
                          padding: "7px 10px",
                          textAlign: "center",
                          fontSize: 12,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          cursor: "pointer",
                        }}
                      >
                        <QrCodeIcon size={14} weight="bold" /> QRIS
                      </button>
                    </div>

                    {/* Simulate print button */}
                    <button
                      type="button"
                      disabled={cart.length === 0}
                      onClick={() => setIsPaid(true)}
                      className="press-tactile"
                      style={{
                        width: "100%",
                        background:
                          cart.length === 0 ? "var(--color-border)" : "var(--color-brand)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 99,
                        padding: "10px",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: cart.length === 0 ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        boxShadow:
                          cart.length === 0 ? "none" : "0 4px 14px rgba(234, 88, 12, 0.35)",
                      }}
                    >
                      <PrinterIcon size={16} weight="bold" />
                      <span>Bayar & Cetak Nota Struk</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
