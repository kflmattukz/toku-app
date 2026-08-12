import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "#/lib/auth-client";
import { useState } from "react";
import { formatIDR, dayRange, weekRange, monthRange } from "#/lib/utils";
import {
  ChartLineUpIcon,
  MoneyIcon,
  ShoppingCartIcon,
  TrophyIcon,
  PackageIcon,
} from "@phosphor-icons/react";

export const Route = createFileRoute("/_app/laporan")({ component: Laporan });

type Range = "hari" | "minggu" | "bulan";

function Laporan() {
  const { data: session } = authClient.useSession();
  const store = useQuery(
    api.stores.getByUserId,
    session ? { userId: session.user.id, userEmail: session.user.email } : "skip",
  );
  const [range, setRange] = useState<Range>("hari");

  const { startOfDay, endOfDay } =
    range === "hari" ? dayRange() : range === "minggu" ? weekRange() : monthRange();

  const summary = useQuery(
    api.transactions.dailySummary,
    store ? { storeId: store._id, startOfDay, endOfDay } : "skip",
  );

  if (!summary) return <Loader />;

  const totalRevenue = summary.total ?? 0;
  const totalTransactions = summary.count ?? 0;
  const txs = summary.transactions ?? [];
  const totalItems = txs.reduce((sum, tx) => sum + tx.items.reduce((s, i) => s + i.qty, 0), 0);

  const productMap: Record<string, { name: string; totalQty: number; totalRevenue: number }> = {};
  for (const tx of txs) {
    for (const item of tx.items) {
      if (!productMap[item.name]) {
        productMap[item.name] = { name: item.name, totalQty: 0, totalRevenue: 0 };
      }
      productMap[item.name].totalQty += item.qty;
      productMap[item.name].totalRevenue += item.price * item.qty;
    }
  }
  const topProducts = Object.values(productMap).sort((a, b) => b.totalQty - a.totalQty);

  return (
    <div>
      {/* Header with period toggle pills */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <div className="eyebrow-tag">RINGKASAN OSET & REKAP</div>
          <h1
            style={{ fontSize: 24, fontWeight: 800, margin: "2px 0 0", color: "var(--color-text)" }}
          >
            Laporan Penjualan
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-2)" }}>
            Pantau performa bisnis dan omset toko secara real-time
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            background: "var(--color-surface-3)",
            padding: 4,
            borderRadius: 99,
            border: "1px solid var(--color-border)",
          }}
        >
          {[
            { key: "hari", label: "Hari Ini" },
            { key: "minggu", label: "Minggu Ini" },
            { key: "bulan", label: "Bulan Ini" },
          ].map((r) => {
            const active = range === r.key;
            return (
              <button
                key={r.key}
                onClick={() => setRange(r.key as Range)}
                className="press-tactile"
                style={{
                  padding: "7px 16px",
                  borderRadius: 99,
                  border: "none",
                  background: active ? "var(--color-surface)" : "transparent",
                  color: active ? "var(--color-brand-dark)" : "var(--color-text-2)",
                  fontSize: 13,
                  fontWeight: active ? 800 : 600,
                  cursor: "pointer",
                  boxShadow: active ? "var(--shadow-sm)" : "none",
                  transition: "all 150ms ease",
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main KPI Stat Cards — Doppelrand Double-Bezel Architecture */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard
          icon={<MoneyIcon size={24} weight="duotone" color="var(--color-brand)" />}
          badgeText="OMSET NETTO"
          label="Total Pendapatan"
          value={formatIDR(totalRevenue)}
          subtext={`Periode ${range === "hari" ? "hari ini" : range === "minggu" ? "minggu ini" : "bulan ini"}`}
          isMoney
          accentColor="var(--color-brand)"
          bgColor="var(--color-brand-light)"
        />
        <StatCard
          icon={<ShoppingCartIcon size={24} weight="duotone" color="#059669" />}
          badgeText="NOTA SUKSES"
          label="Jumlah Transaksi"
          value={`${totalTransactions} Transaksi`}
          subtext="Total nota penjualan berhasil"
          accentColor="#059669"
          bgColor="#ecfdf5"
        />
        <StatCard
          icon={<ChartLineUpIcon size={24} weight="duotone" color="#d97706" />}
          badgeText="TOTAL ITEM OUT"
          label="Produk Terjual"
          value={`${totalItems} pcs`}
          subtext="Total unit barang keluar dari toko"
          accentColor="#d97706"
          bgColor="#fffbeb"
        />
      </div>

      {/* Top-Selling Products Ranking List */}
      <section
        style={{
          background: "var(--color-surface)",
          border: "1.5px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "24px",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 99,
                background: "var(--color-brand-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--color-brand)",
              }}
            >
              <TrophyIcon size={22} weight="fill" color="var(--color-brand)" />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  margin: 0,
                  color: "var(--color-text)",
                  letterSpacing: "-0.01em",
                }}
              >
                Produk Terlaris
              </h2>
              <div style={{ fontSize: 12, color: "var(--color-text-3)" }}>
                Peringkat berdasarkan kuantitas & omset terlaris
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "var(--color-brand)",
              background: "var(--color-brand-light)",
              border: "1px solid var(--color-brand)",
              padding: "4px 14px",
              borderRadius: 99,
            }}
          >
            {topProducts.length} Produk Terjual
          </span>
        </div>

        {topProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-3)" }}>
            <PackageIcon size={44} style={{ opacity: 0.25, marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
              Belum ada transaksi pada periode ini.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topProducts.map((p: any, idx: number) => (
              <div
                key={p.name}
                className="squircle-card press-tactile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  background: "var(--color-surface-2)",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 99,
                      background:
                        idx === 0
                          ? "var(--color-brand)"
                          : idx === 1
                            ? "#57534e"
                            : idx === 2
                              ? "#a8a29e"
                              : "var(--color-surface-3)",
                      color: idx <= 2 ? "#ffffff" : "var(--color-text-2)",
                      fontSize: 13,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: idx === 0 ? "0 4px 12px rgba(234,88,12,0.35)" : "none",
                    }}
                  >
                    #{idx + 1}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "var(--color-text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--color-text-3)",
                        marginTop: 2,
                        fontWeight: 600,
                      }}
                    >
                      Terjual{" "}
                      <strong style={{ color: "var(--color-text)" }}>{p.totalQty} pcs</strong>
                    </div>
                  </div>
                </div>

                <div
                  className="price"
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: "var(--color-brand)",
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {formatIDR(p.totalRevenue)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  badgeText,
  label,
  value,
  subtext,
  isMoney,
  accentColor,
  bgColor,
}: {
  icon: React.ReactNode;
  badgeText: string;
  label: string;
  value: string;
  subtext: string;
  isMoney?: boolean;
  accentColor: string;
  bgColor: string;
}) {
  return (
    <div className="doppelrand-shell">
      <div className="doppelrand-core">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: accentColor,
              background: bgColor,
              border: `1px solid ${accentColor}`,
              padding: "3px 10px",
              borderRadius: 99,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {badgeText}
          </span>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 99,
              background: bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${accentColor}`,
            }}
          >
            {icon}
          </div>
        </div>

        <div
          style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-2)", marginBottom: 4 }}
        >
          {label}
        </div>
        <div
          className={isMoney ? "price" : ""}
          style={{
            fontSize: "clamp(22px, 3vw, 28px)",
            fontWeight: 800,
            color: "var(--color-text)",
            lineHeight: 1.2,
            marginBottom: 6,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-3)", fontWeight: 500 }}>{subtext}</div>
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
      <p style={{ color: "var(--color-text-2)", fontSize: 14, fontWeight: 700 }}>
        Memuat laporan...
      </p>
    </div>
  );
}
