import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { useState } from "react";
import { formatIDR, dayRange, weekRange, monthRange } from "#/lib/utils";
import {
  ChartLineUpIcon,
  ChartBarIcon,
  MoneyIcon,
  ShoppingCartIcon,
  TrophyIcon,
  PackageIcon,
  FireIcon,
  ClockIcon,
  TrendUpIcon,
  ReceiptIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";

export const Route = createFileRoute("/_app/laporan")({ component: Laporan });

type Range = "hari" | "minggu" | "bulan";

function Laporan() {
  const { store } = useAppStore();
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
          marginBottom: 24,
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
        <StatCard
          icon={<ArrowCounterClockwiseIcon size={24} weight="duotone" color="var(--color-danger)" />}
          badgeText="RETUR / BATAL"
          label="Transaksi Dibatalkan"
          value={`${summary.cancelledCount ?? 0} Transaksi`}
          subtext={
            summary.cancelledTotal && summary.cancelledTotal > 0
              ? `Total Retur: ${formatIDR(summary.cancelledTotal)}`
              : "Tidak ada transaksi retur"
          }
          accentColor="var(--color-danger)"
          bgColor="rgba(239, 68, 68, 0.08)"
        />
      </div>

      {/* Interactive Sales & Revenue Trend Chart */}
      <TrendChart
        txs={txs}
        range={range}
        totalRevenue={totalRevenue}
        totalTransactions={totalTransactions}
      />

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

function TrendChart({
  txs,
  range,
  totalRevenue,
  totalTransactions: _totalTransactions,
}: {
  txs: Array<{ createdAt: number; total: number; items: Array<any> }>;
  range: Range;
  totalRevenue: number;
  totalTransactions: number;
}) {
  const [metric, setMetric] = useState<"revenue" | "count">("revenue");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // 1. Build Time Buckets based on selected range
  type Bucket = {
    id: string;
    label: string;
    shortLabel: string;
    subLabel: string;
    revenue: number;
    count: number;
  };

  const buckets: Bucket[] = (() => {
    if (range === "hari") {
      // 06:00 to 23:00 (18 hours)
      const hours = Array.from({ length: 18 }, (_, i) => i + 6);
      const b: Bucket[] = hours.map((h) => ({
        id: `h-${h}`,
        label: `Pukul ${String(h).padStart(2, "0")}:00 - ${String(h + 1).padStart(2, "0")}:00`,
        shortLabel: `${String(h).padStart(2, "0")}:00`,
        subLabel: `${String(h).padStart(2, "0")}:00`,
        revenue: 0,
        count: 0,
      }));

      for (const tx of txs) {
        const txHour = new Date(tx.createdAt).getHours();
        const target = b.find((item) => item.id === `h-${txHour}`);
        if (target) {
          target.revenue += tx.total;
          target.count += 1;
        }
      }
      return b;
    }

    if (range === "minggu") {
      const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
      const shortDayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      const now = new Date();
      const day = now.getDay() || 7; // 1 = Mon, 7 = Sun
      const monday = new Date(now);
      monday.setDate(now.getDate() - (day - 1));
      monday.setHours(0, 0, 0, 0);

      const b: Bucket[] = dayNames.map((dName, idx) => {
        const curDate = new Date(monday);
        curDate.setDate(monday.getDate() + idx);
        const dayOfMonth = curDate.getDate();
        const monthShort = curDate.toLocaleDateString("id-ID", { month: "short" });
        return {
          id: `w-${idx}`,
          label: `${dName}, ${dayOfMonth} ${monthShort}`,
          shortLabel: shortDayNames[idx],
          subLabel: `${dayOfMonth} ${monthShort}`,
          revenue: 0,
          count: 0,
        };
      });

      for (const tx of txs) {
        const txDate = new Date(tx.createdAt);
        const txDay = txDate.getDay() || 7; // 1 to 7
        const target = b[txDay - 1];
        if (target) {
          target.revenue += tx.total;
          target.count += 1;
        }
      }
      return b;
    }

    // Bulan Ini (Days 1 to End of Month)
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthName = now.toLocaleDateString("id-ID", { month: "short" });

    const b: Bucket[] = Array.from({ length: daysInMonth }, (_, idx) => {
      const dayNum = idx + 1;
      return {
        id: `m-${dayNum}`,
        label: `${dayNum} ${monthName} ${now.getFullYear()}`,
        shortLabel: String(dayNum),
        subLabel: `${dayNum} ${monthName}`,
        revenue: 0,
        count: 0,
      };
    });

    for (const tx of txs) {
      const txDay = new Date(tx.createdAt).getDate();
      const target = b[txDay - 1];
      if (target) {
        target.revenue += tx.total;
        target.count += 1;
      }
    }
    return b;
  })();

  // 2. Computed Metrics & Peak detection
  const values = buckets.map((b) => (metric === "revenue" ? b.revenue : b.count));
  const maxVal = Math.max(...values, 1);
  const peakVal = Math.max(...values, 0);
  const peakIdx = values.findIndex((v) => v === peakVal && v > 0);
  const peakBucket = peakIdx !== -1 ? buckets[peakIdx] : null;

  const activeBucket = activeIdx !== null ? buckets[activeIdx] : null;

  return (
    <section
      className="doppelrand-shell"
      style={{ marginBottom: 28 }}
      onMouseLeave={() => setActiveIdx(null)}
    >
      <div className="doppelrand-core">
        {/* Header & Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 99,
                background: "var(--color-brand-light)",
                border: "1px solid var(--color-brand)",
                color: "var(--color-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChartBarIcon size={22} weight="duotone" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    margin: 0,
                    color: "var(--color-text)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Grafik Tren Penjualan
                </h2>
                {peakBucket && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "var(--color-brand)",
                      background: "var(--color-brand-light)",
                      border: "1px solid var(--color-brand)",
                      padding: "2px 8px",
                      borderRadius: 99,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <FireIcon size={12} weight="fill" />
                    Puncak: {peakBucket.shortLabel} (
                    {metric === "revenue"
                      ? formatIDR(peakBucket.revenue)
                      : `${peakBucket.count} Nota`}
                    )
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 2 }}>
                {range === "hari"
                  ? "Distribusi penjualan per jam operasional toko hari ini"
                  : range === "minggu"
                    ? "Performa penjualan harian sepanjang minggu ini"
                    : "Akumulasi tren penjualan harian bulan ini"}
              </div>
            </div>
          </div>

          {/* Metric Switcher Toggle */}
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "var(--color-surface-2)",
              padding: 4,
              borderRadius: 99,
              border: "1px solid var(--color-border)",
            }}
          >
            <button
              onClick={() => {
                setMetric("revenue");
                setActiveIdx(null);
              }}
              className="press-tactile"
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                border: "none",
                background: metric === "revenue" ? "var(--color-brand)" : "transparent",
                color: metric === "revenue" ? "#ffffff" : "var(--color-text-2)",
                fontSize: 12,
                fontWeight: metric === "revenue" ? 800 : 600,
                cursor: "pointer",
                boxShadow:
                  metric === "revenue" ? "0 2px 8px rgba(234, 88, 12, 0.35)" : "none",
                transition: "all 150ms ease",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <TrendUpIcon size={14} weight="bold" />
              <span>Omset (Rp)</span>
            </button>
            <button
              onClick={() => {
                setMetric("count");
                setActiveIdx(null);
              }}
              className="press-tactile"
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                border: "none",
                background: metric === "count" ? "var(--color-brand)" : "transparent",
                color: metric === "count" ? "#ffffff" : "var(--color-text-2)",
                fontSize: 12,
                fontWeight: metric === "count" ? 800 : 600,
                cursor: "pointer",
                boxShadow:
                  metric === "count" ? "0 2px 8px rgba(234, 88, 12, 0.35)" : "none",
                transition: "all 150ms ease",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ReceiptIcon size={14} weight="bold" />
              <span>Transaksi (Nota)</span>
            </button>
          </div>
        </div>

        {/* Floating Active Insight Banner */}
        <div
          style={{
            background: activeBucket
              ? "var(--color-surface-2)"
              : "var(--color-brand-light)",
            border: `1px solid ${activeBucket ? "var(--color-border)" : "var(--color-brand)"}`,
            borderRadius: "var(--radius-md)",
            padding: "10px 16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            transition: "all 150ms ease",
          }}
        >
          {activeBucket ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ClockIcon size={16} weight="bold" color="var(--color-brand)" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}>
                  {activeBucket.label}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 13, color: "var(--color-text-2)" }}>
                  Omset:{" "}
                  <strong className="price" style={{ color: "var(--color-brand)", fontWeight: 800 }}>
                    {formatIDR(activeBucket.revenue)}
                  </strong>
                </div>
                <div style={{ fontSize: 13, color: "var(--color-text-2)" }}>
                  Nota:{" "}
                  <strong style={{ color: "var(--color-text)", fontWeight: 800 }}>
                    {activeBucket.count} transaksi
                  </strong>
                </div>
                {totalRevenue > 0 && (
                  <div style={{ fontSize: 12, color: "var(--color-text-3)" }}>
                    ({Math.round((activeBucket.revenue / totalRevenue) * 100)}% dari total)
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TrendUpIcon size={16} weight="bold" color="var(--color-brand)" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-brand-dark)" }}>
                  Ringkasan Tren {range === "hari" ? "Hari Ini" : range === "minggu" ? "Minggu Ini" : "Bulan Ini"}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-2)" }}>
                Arahkan kursor atau sentuh diagram batang di bawah untuk melihat rincian setiap waktu
              </div>
            </>
          )}
        </div>

        {/* Chart Visualization Canvas */}
        <div style={{ position: "relative", width: "100%", height: 210, paddingTop: 10 }}>
          {/* Reference Horizontal Grid Lines */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              pointerEvents: "none",
              paddingBottom: 28,
            }}
          >
            {[100, 50, 0].map((pct) => {
              const val = Math.round((maxVal * pct) / 100);
              const label =
                metric === "revenue"
                  ? val === 0
                    ? "Rp 0"
                    : val >= 1000000
                      ? `Rp ${(val / 1000000).toFixed(1)}jt`
                      : `Rp ${(val / 1000).toFixed(0)}rb`
                  : `${val} nota`;

              return (
                <div
                  key={pct}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                  }}
                >
                  <span
                    className="price"
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "var(--color-text-3)",
                      minWidth: 54,
                      textAlign: "right",
                    }}
                  >
                    {label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      borderBottom: pct === 0 ? "1px solid var(--color-border)" : "1px dashed var(--color-border-subtle)",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Bar Columns Container */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              paddingLeft: 64,
              paddingBottom: 28,
              display: "flex",
              alignItems: "flex-end",
              gap: range === "bulan" ? 2 : range === "minggu" ? 14 : 6,
            }}
          >
            {buckets.map((b, idx) => {
              const val = metric === "revenue" ? b.revenue : b.count;
              const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
              const isPeak = idx === peakIdx && val > 0;
              const isHovered = activeIdx === idx;
              const hasData = val > 0;

              return (
                <div
                  key={b.id}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onTouchStart={() => setActiveIdx(idx)}
                  onClick={() => setActiveIdx(idx)}
                  style={{
                    flex: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {/* The Vertical Bar */}
                  <div
                    style={{
                      width: "100%",
                      maxWidth: range === "minggu" ? 48 : range === "hari" ? 26 : 14,
                      height: hasData ? `${Math.max(6, heightPct)}%` : "4px",
                      borderRadius: "6px 6px 2px 2px",
                      background: isHovered
                        ? "var(--color-brand)"
                        : isPeak
                          ? "linear-gradient(180deg, var(--color-brand) 0%, rgba(234, 88, 12, 0.75) 100%)"
                          : hasData
                            ? "linear-gradient(180deg, var(--color-brand) 0%, rgba(234, 88, 12, 0.4) 100%)"
                            : "var(--color-surface-3)",
                      boxShadow: isHovered
                        ? "0 0 16px rgba(234, 88, 12, 0.55)"
                        : isPeak
                          ? "0 0 10px rgba(234, 88, 12, 0.4)"
                          : "none",
                      border: isPeak
                        ? "1px solid var(--color-brand)"
                        : isHovered
                          ? "1px solid #ffffff"
                          : "none",
                      transition: "height 300ms cubic-bezier(0.32, 0.72, 0, 1), transform 150ms ease, background 150ms ease",
                      transform: isHovered ? "scaleY(1.04)" : "scaleY(1)",
                      transformOrigin: "bottom",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Bottom X-Axis Labels */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 64,
              right: 0,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {buckets.map((b, idx) => {
              // Hide some labels on month view to prevent overlap
              const showLabel =
                range === "minggu" ||
                (range === "hari" && idx % 2 === 0) ||
                (range === "bulan" && (idx === 0 || (idx + 1) % 5 === 0 || idx === buckets.length - 1));

              const isHovered = activeIdx === idx;

              return (
                <div
                  key={b.id}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: isHovered ? 800 : 600,
                    color: isHovered
                      ? "var(--color-brand)"
                      : showLabel
                        ? "var(--color-text-3)"
                        : "transparent",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {showLabel ? b.shortLabel : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
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
