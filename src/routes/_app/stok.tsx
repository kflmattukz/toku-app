import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { useState } from "react";
import { formatIDR } from "#/lib/utils";
import { Modal } from "#/components/Modal";
import type { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
  WarningIcon,
  CheckCircleIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  PackageIcon,
} from "@phosphor-icons/react";

export const Route = createFileRoute("/_app/stok")({ component: Stok });

const LOW_STOCK = 5;

function Stok() {
  const { store } = useAppStore();
  const products = useQuery(api.products.list, store ? { storeId: store._id } : "skip");
  const adjustStock = useMutation(api.products.adjustStock);

  const [activeRestockProduct, setActiveRestockProduct] = useState<any | null>(null);
  const [restockAmt, setRestockAmt] = useState("10");
  const [saving, setSaving] = useState(false);

  const lowStock = (products ?? []).filter((p) => p.stock <= LOW_STOCK);
  const okStock = (products ?? []).filter((p) => p.stock > LOW_STOCK);

  const openRestock = (p: any) => {
    setActiveRestockProduct(p);
    setRestockAmt("10");
  };

  const handleRestock = async () => {
    if (!activeRestockProduct) return;
    const amt = parseInt(restockAmt, 10) || 0;
    if (amt <= 0) {
      toast.error("Jumlah restok harus minimal 1 pcs");
      return;
    }
    setSaving(true);
    try {
      await adjustStock({ id: activeRestockProduct._id, delta: amt });
      toast.success(`Stok ${activeRestockProduct.name} bertambah ${amt} pcs!`, {
        description: `Stok sekarang: ${(activeRestockProduct.stock ?? 0) + amt} pcs`,
      });
      setActiveRestockProduct(null);
      setRestockAmt("10");
    } catch {
      toast.error("Gagal memperbarui stok. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (!products) return <Loader />;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div className="eyebrow-tag">MANAJEMEN PERSEDIAAN</div>
        <h1
          style={{ fontSize: 24, fontWeight: 800, margin: "2px 0 0", color: "var(--color-text)" }}
        >
          Kontrol Stok Barang
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-2)" }}>
          Pantau dan lakukan restock cepat untuk barang yang hampir habis
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            background: "var(--color-danger-light)",
            border: "1.5px solid var(--color-danger)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "var(--color-danger-text)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Stok Rendah
            </span>
            <WarningIcon size={20} weight="fill" color="var(--color-danger)" />
          </div>
          <div
            className="price"
            style={{ fontSize: 32, fontWeight: 800, color: "var(--color-danger-text)" }}
          >
            {lowStock.length}
          </div>
          <div
            style={{ fontSize: 12, color: "var(--color-danger-text)", opacity: 0.8, marginTop: 4 }}
          >
            Produk perlu restock segera
          </div>
        </div>

        <div
          style={{
            background: "var(--color-brand-light)",
            border: "1.5px solid var(--color-brand)",
            borderRadius: "var(--radius-lg)",
            padding: "20px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "var(--color-brand-dark)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Stok Aman
            </span>
            <CheckCircleIcon size={20} weight="fill" color="var(--color-brand-dark)" />
          </div>
          <div
            className="price"
            style={{ fontSize: 32, fontWeight: 800, color: "var(--color-brand-dark)" }}
          >
            {okStock.length}
          </div>
          <div
            style={{ fontSize: 12, color: "var(--color-brand-dark)", opacity: 0.8, marginTop: 4 }}
          >
            Produk persediaan cukup
          </div>
        </div>
      </div>

      {/* Low stock alert section */}
      {lowStock.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <WarningIcon size={20} weight="fill" color="var(--color-danger)" />
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "var(--color-text)" }}>
              Perlu Restock Segera (Stok ≤ 5)
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            {lowStock.map((p) => (
              <div
                key={p._id}
                style={{
                  background: "var(--color-surface)",
                  border: "1.5px solid var(--color-danger)",
                  borderRadius: "var(--radius-lg)",
                  padding: "18px",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "var(--color-text)",
                        marginBottom: 2,
                      }}
                    >
                      {p.name}
                    </div>
                    <span style={{ fontSize: 12, color: "var(--color-text-3)", fontWeight: 600 }}>
                      {p.category}
                    </span>
                  </div>
                  <span
                    className="price"
                    style={{ fontSize: 20, fontWeight: 800, color: "var(--color-danger)" }}
                  >
                    {p.stock} pcs
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--color-border)",
                    paddingTop: 12,
                  }}
                >
                  <span
                    className="price"
                    style={{ fontSize: 14, fontWeight: 700, color: "var(--color-brand)" }}
                  >
                    {formatIDR(p.price)}
                  </span>
                  <button
                    onClick={() => openRestock(p)}
                    className="press-tactile"
                    style={smallPrimaryBtn}
                  >
                    <PlusIcon size={14} weight="bold" /> Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All products inventory section */}
      <section>
        <h2
          style={{ fontSize: 17, fontWeight: 800, margin: "0 0 14px", color: "var(--color-text)" }}
        >
          Semua Persediaan Produk ({products.length})
        </h2>

        {/* Desktop Table View */}
        <div
          className="desktop-only"
          style={{
            background: "var(--color-surface)",
            border: "1.5px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
            boxShadow: "var(--shadow-md)",
            flexDirection: "column",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "var(--color-surface-2)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  {[
                    "Nama Produk",
                    "Kategori",
                    "Stok Saat Ini",
                    "Status Persediaan",
                    "Aksi Restock",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "16px 20px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 800,
                        color: "var(--color-text-3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const isLow = p.stock <= LOW_STOCK;
                  return (
                    <tr key={p._id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text)" }}>
                          {p.name}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            background: "var(--color-surface-2)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 99,
                            padding: "4px 12px",
                            fontSize: 12,
                            color: "var(--color-text-2)",
                            fontWeight: 600,
                          }}
                        >
                          {p.category}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span
                          className="price"
                          style={{
                            fontWeight: 800,
                            fontSize: 16,
                            color: isLow ? "var(--color-danger)" : "var(--color-text)",
                          }}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            background: isLow
                              ? "var(--color-danger-light)"
                              : "var(--color-brand-light)",
                            color: isLow ? "var(--color-danger-text)" : "var(--color-brand-dark)",
                            borderRadius: 99,
                            padding: "4px 12px",
                            fontSize: 12,
                            fontWeight: 800,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {isLow ? (
                            <WarningIcon size={12} weight="fill" />
                          ) : (
                            <CheckCircleIcon size={12} weight="fill" />
                          )}
                          {isLow ? "Stok Rendah" : "Aman"}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => openRestock(p)}
                          className="press-tactile"
                          style={smallPrimaryBtn}
                        >
                          <PlusIcon size={14} weight="bold" /> Tambah Stok
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Touch Card List View */}
        <div className="mobile-topbar" style={{ flexDirection: "column", gap: 12 }}>
          {products.map((p) => {
            const isLow = p.stock <= LOW_STOCK;
            return (
              <div
                key={p._id}
                className="squircle-card"
                style={{
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  border: isLow
                    ? "1.5px solid var(--color-danger)"
                    : "1.5px solid var(--color-border)",
                }}
              >
                {/* Product Name & Category */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text)", marginBottom: 4 }}>
                      {p.name}
                    </div>
                    <span
                      style={{
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 99,
                        padding: "3px 10px",
                        fontSize: 11,
                        color: "var(--color-text-2)",
                        fontWeight: 600,
                      }}
                    >
                      {p.category}
                    </span>
                  </div>
                  <span className="price" style={{ fontSize: 16, fontWeight: 800, color: "var(--color-brand)" }}>
                    {formatIDR(p.price)}
                  </span>
                </div>

                {/* Status & Stock Count */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, borderTop: "1px solid var(--color-border-subtle)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--color-text-3)", fontWeight: 600 }}>Stok:</span>
                    <span
                      className="price"
                      style={{
                        fontWeight: 800,
                        fontSize: 18,
                        color: isLow ? "var(--color-danger)" : "var(--color-text)",
                      }}
                    >
                      {p.stock} pcs
                    </span>
                  </div>

                  <span
                    style={{
                      background: isLow ? "var(--color-danger-light)" : "var(--color-brand-light)",
                      color: isLow ? "var(--color-danger-text)" : "var(--color-brand-dark)",
                      borderRadius: 99,
                      padding: "4px 12px",
                      fontSize: 11,
                      fontWeight: 800,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {isLow ? <WarningIcon size={12} weight="fill" /> : <CheckCircleIcon size={12} weight="fill" />}
                    {isLow ? "Stok Rendah" : "Aman"}
                  </span>
                </div>

                {/* Inline Restock Action Footer */}
                <div style={{ paddingTop: 8, borderTop: "1px solid var(--color-border-subtle)", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => openRestock(p)}
                    className="press-tactile"
                    style={{ ...smallPrimaryBtn, width: "100%", justifyContent: "center", padding: "10px" }}
                  >
                    <PlusIcon size={16} weight="bold" /> Tambah Stok
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modern Restock Modal Dialog */}
      {activeRestockProduct && (
        <Modal onClose={() => !saving && setActiveRestockProduct(null)} maxWidth={440}>
          <div style={{ marginBottom: 18 }}>
            <div className="eyebrow-tag" style={{ marginBottom: 6 }}>
              TAMBAH PERSEDIAAN
            </div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                margin: 0,
                color: "var(--color-text)",
                letterSpacing: "-0.02em",
              }}
            >
              Restock {activeRestockProduct.name}
            </h2>
            <p style={{ fontSize: 13, color: "var(--color-text-3)", margin: "4px 0 0" }}>
              Kategori: {activeRestockProduct.category} · Harga:{" "}
              {formatIDR(activeRestockProduct.price)}
            </p>
          </div>

          {/* Before / After Visual Comparison Card */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--color-text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Stok Saat Ini
              </div>
              <div
                className="price"
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color:
                    activeRestockProduct.stock <= LOW_STOCK
                      ? "var(--color-danger)"
                      : "var(--color-text)",
                  marginTop: 2,
                }}
              >
                {activeRestockProduct.stock} pcs
              </div>
            </div>

            <div style={{ color: "var(--color-text-3)", fontSize: 16, fontWeight: 800, opacity: 0.6 }}>
              ➔
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--color-brand)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Stok Baru
              </div>
              <div
                className="price"
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "var(--color-brand)",
                  marginTop: 2,
                }}
              >
                {activeRestockProduct.stock + (parseInt(restockAmt, 10) || 0)} pcs
              </div>
            </div>
          </div>

          {/* Stepper Input with Strict Validation */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--color-text)",
                marginBottom: 8,
              }}
            >
              Jumlah Tambahan Stok (pcs)
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "var(--color-surface)",
                border: "1.5px solid var(--color-brand)",
                borderRadius: "var(--radius-lg)",
                padding: "8px 12px",
                boxShadow: "0 0 0 3px rgba(234, 88, 12, 0.15)",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const cur = parseInt(restockAmt, 10) || 0;
                  setRestockAmt(String(Math.max(1, cur - 1)));
                }}
                disabled={(parseInt(restockAmt, 10) || 0) <= 1 || saving}
                className="press-tactile"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  color:
                    (parseInt(restockAmt, 10) || 0) <= 1
                      ? "var(--color-text-3)"
                      : "var(--color-text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor:
                    (parseInt(restockAmt, 10) || 0) <= 1 || saving
                      ? "not-allowed"
                      : "pointer",
                  flexShrink: 0,
                }}
              >
                <MinusIcon size={18} weight="bold" />
              </button>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={restockAmt}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    const num = parseInt(raw, 10);
                    setRestockAmt(num > 0 ? String(num) : "");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (parseInt(restockAmt, 10) || 0) > 0 && !saving) {
                      e.preventDefault();
                      handleRestock();
                    }
                  }}
                  autoFocus
                  placeholder="0"
                  style={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: 26,
                    fontWeight: 800,
                    border: "none",
                    background: "transparent",
                    color: "var(--color-text)",
                    outline: "none",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const cur = parseInt(restockAmt, 10) || 0;
                  setRestockAmt(String(cur + 1));
                }}
                disabled={saving}
                className="press-tactile"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-brand)",
                  border: "none",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 8px rgba(234, 88, 12, 0.3)",
                  flexShrink: 0,
                }}
              >
                <PlusIcon size={18} weight="bold" />
              </button>
            </div>
          </div>

          {/* Quick Preset Pills */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-text-3)",
                fontWeight: 700,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Pilihan Cepat
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {[5, 10, 20, 50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setRestockAmt(String(preset))}
                  className="press-tactile"
                  style={{
                    padding: "9px 6px",
                    borderRadius: "var(--radius-md)",
                    background:
                      restockAmt === String(preset)
                        ? "var(--color-brand)"
                        : "var(--color-surface-2)",
                    color:
                      restockAmt === String(preset)
                        ? "#ffffff"
                        : "var(--color-text)",
                    border:
                      restockAmt === String(preset)
                        ? "1px solid var(--color-brand)"
                        : "1px solid var(--color-border)",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  +{preset} pcs
                </button>
              ))}
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              disabled={saving}
              onClick={() => setActiveRestockProduct(null)}
              className="press-tactile"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: 99,
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-2)",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Batal
            </button>
            <button
              type="button"
              disabled={(parseInt(restockAmt, 10) || 0) <= 0 || saving}
              onClick={handleRestock}
              className="press-tactile"
              style={{
                flex: 1.5,
                padding: "12px",
                borderRadius: 99,
                background: "var(--color-brand)",
                border: "none",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 800,
                cursor:
                  (parseInt(restockAmt, 10) || 0) > 0 && !saving ? "pointer" : "not-allowed",
                boxShadow: "0 4px 14px rgba(234, 88, 12, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: (parseInt(restockAmt, 10) || 0) <= 0 ? 0.6 : 1,
              }}
            >
              <CheckIcon size={16} weight="bold" />
              <span>{saving ? "Menyimpan..." : "Simpan Stok Baru"}</span>
            </button>
          </div>
        </Modal>
      )}
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
      <p style={{ color: "var(--color-text-2)", fontSize: 14, fontWeight: 700 }}>Memuat stok...</p>
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  padding: "16px 20px",
  fontSize: 14,
  color: "var(--color-text)",
};
const smallPrimaryBtn: React.CSSProperties = {
  padding: "7px 14px",
  background: "var(--color-brand)",
  color: "#ffffff",
  border: "none",
  borderRadius: 99,
  fontWeight: 800,
  fontSize: 13,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  boxShadow: "0 2px 8px rgba(234, 88, 12, 0.3)",
};
