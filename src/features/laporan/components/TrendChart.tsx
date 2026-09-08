import { useMemo, useState } from "react";
import {
  WaveformIcon,
  TrendUpIcon,
  ReceiptIcon,
  FireIcon,
  ClockIcon,
  ScalesIcon,
} from "@phosphor-icons/react";
import { defineChart, areaY, lineY, dot } from "@tanstack/charts";
import { scalePoint } from "@tanstack/charts/scales/point";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { Chart } from "@tanstack/charts/react";
import { formatIDR } from "#/lib/utils";
import type { Range, TrendBucket } from "../types";

interface TrendChartProps {
  txs: Array<{ createdAt: number; total: number; items: Array<any> }>;
  range: Range;
  totalRevenue: number;
  totalProfit?: number;
  privacyMode?: boolean;
}

export function TrendChart({
  txs,
  range,
  totalRevenue: _totalRevenue,
  totalProfit: _totalProfit = 0,
  privacyMode = false,
}: TrendChartProps) {
  const [metric, setMetric] = useState<"revenue" | "profit" | "count">("revenue");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const renderMoney = (amount: number) => {
    if (privacyMode) return "Rp ••••••";
    return formatIDR(amount);
  };

  // 1. Build Time Buckets based on selected range
  const buckets: TrendBucket[] = (() => {
    if (range === "hari") {
      // 06:00 to 23:00 (18 hours)
      const hours = Array.from({ length: 18 }, (_, i) => i + 6);
      const b: TrendBucket[] = hours.map((h) => ({
        id: `h-${h}`,
        label: `Pukul ${String(h).padStart(2, "0")}:00 - ${String(h + 1).padStart(2, "0")}:00`,
        shortLabel: `${String(h).padStart(2, "0")}:00`,
        subLabel: `${String(h).padStart(2, "0")}:00`,
        revenue: 0,
        cogs: 0,
        profit: 0,
        count: 0,
      }));

      for (const tx of txs) {
        const txHour = new Date(tx.createdAt).getHours();
        const target = b.find((item) => item.id === `h-${txHour}`);
        if (target) {
          target.revenue += tx.total;
          const txCogs = tx.items.reduce((s, i) => s + (i.costPrice ?? 0) * i.qty, 0);
          target.cogs += txCogs;
          target.profit += tx.total - txCogs;
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

      const b: TrendBucket[] = dayNames.map((dName, idx) => {
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
          cogs: 0,
          profit: 0,
          count: 0,
        };
      });

      for (const tx of txs) {
        const txDate = new Date(tx.createdAt);
        const txDay = txDate.getDay() || 7; // 1 to 7
        const target = b[txDay - 1];
        if (target) {
          target.revenue += tx.total;
          const txCogs = tx.items.reduce((s, i) => s + (i.costPrice ?? 0) * i.qty, 0);
          target.cogs += txCogs;
          target.profit += tx.total - txCogs;
          target.count += 1;
        }
      }
      return b;
    }

    // Bulan Ini (Days 1 to End of Month)
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthName = now.toLocaleDateString("id-ID", { month: "short" });

    const b: TrendBucket[] = Array.from({ length: daysInMonth }, (_, idx) => {
      const dayNum = idx + 1;
      return {
        id: `m-${dayNum}`,
        label: `${dayNum} ${monthName} ${now.getFullYear()}`,
        shortLabel: String(dayNum),
        subLabel: `${dayNum} ${monthName}`,
        revenue: 0,
        cogs: 0,
        profit: 0,
        count: 0,
      };
    });

    for (const tx of txs) {
      const txDay = new Date(tx.createdAt).getDate();
      const target = b[txDay - 1];
      if (target) {
        target.revenue += tx.total;
        const txCogs = tx.items.reduce((s, i) => s + (i.costPrice ?? 0) * i.qty, 0);
        target.cogs += txCogs;
        target.profit += tx.total - txCogs;
        target.count += 1;
      }
    }
    return b;
  })();

  // 2. Computed Metrics & Peak detection
  const values = buckets.map((b) =>
    metric === "revenue" ? b.revenue : metric === "profit" ? b.profit : b.count,
  );
  const peakVal = Math.max(...values, 0);
  const peakIdx = values.findIndex((v) => v === peakVal && v > 0);
  const peakBucket = peakIdx !== -1 ? buckets[peakIdx] : null;
  const activeBucket = activeIdx !== null ? buckets[activeIdx] : null;

  // Smooth wave curve calculation (Catmull-Rom to Cubic Bezier)
  const smoothCurve = useMemo(
    () => ({
      line: (points: readonly (readonly [number, number])[]) => {
        if (points.length < 2) return "";
        let d = `M ${points[0][0]} ${points[0][1]}`;
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i === 0 ? 0 : i - 1];
          const p1 = points[i];
          const p2 = points[i + 1];
          const p3 = points[i + 2] || p2;
          const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
          const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
          const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
          const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
          d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
        }
        return d;
      },
      area: (
        top: readonly (readonly [number, number])[],
        bottom: readonly (readonly [number, number])[],
      ) => {
        if (top.length < 2) return "";
        const topLine = smoothCurve.line(top);
        const revBottom = [...bottom].reverse();
        const botLine = smoothCurve.line(revBottom);
        return `${topLine} L ${revBottom[0][0]} ${revBottom[0][1]} ${botLine.replace(/^M [^ ]+ [^ ]+/, "")} Z`;
      },
    }),
    [],
  );

  // 3. TanStack Charts Data & Definition
  const chartData = useMemo(() => {
    return buckets.map((b, idx) => ({
      ...b,
      idx,
      value: metric === "revenue" ? b.revenue : metric === "profit" ? b.profit : b.count,
    }));
  }, [buckets, metric]);

  const chartDef = useMemo(() => {
    const isProfit = metric === "profit";
    return defineChart({
      svgAnimation: { duration: 320, easing: "ease-out" },
      marks: [
        areaY(chartData, {
          key: (d) => d.id,
          x: (d: any) => d.shortLabel,
          y: (d) => d.value,
          fill: isProfit ? "url(#wave-profit-grad)" : "url(#wave-revenue-grad)",
          fillOpacity: 1,
          curve: smoothCurve,
        }),
        lineY(chartData, {
          key: (d) => d.id,
          x: (d: any) => d.shortLabel,
          y: (d) => d.value,
          stroke: isProfit ? "#10b981" : "var(--color-brand)",
          strokeWidth: 2.5,
          curve: smoothCurve,
        }),
        ...(peakBucket && peakIdx !== -1 && peakVal > 0
          ? [
              dot([chartData[peakIdx]], {
                key: (d: any) => `peak-${d.id}`,
                x: (d: any) => d.shortLabel,
                y: (d: any) => d.value,
                r: 4.5,
                fill: isProfit ? "#10b981" : "var(--color-brand)",
                stroke: "#ffffff",
                strokeWidth: 2,
              }),
            ]
          : []),
      ],
      scales: {
        x: {
          scale: scalePoint,
          axis: {
            ticks: {
              format: (val: any) => {
                const str = String(val ?? "");
                if (range === "bulan") {
                  const n = parseInt(str, 10);
                  return n === 1 || n % 5 === 0 || n === buckets.length ? str : "";
                }
                if (range === "hari") {
                  const hour = parseInt(str, 10);
                  return hour % 2 === 0 ? str : "";
                }
                return str;
              },
            },
          },
        },
        y: {
          scale: scaleLinear,
          axis: {
            ticks: {
              format: (val: any) => {
                const num = Number(val);
                if (metric === "count") return Number.isInteger(num) ? `${num} nota` : "";
                if (num === 0) return "Rp 0";
                if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)}jt`;
                if (num >= 1000) return `Rp ${(num / 1000).toFixed(0)}rb`;
                return `Rp ${num}`;
              },
            },
          },
        },
      },
    });
  }, [chartData, metric, peakIdx, peakVal, peakBucket, range, buckets.length, smoothCurve]);

  return (
    <section className="doppelrand-shell mb-6" onMouseLeave={() => setActiveIdx(null)}>
      <div className="doppelrand-core">
        {/* SVG Gradients for Wave Chart */}
        <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
          <defs>
            <linearGradient id="wave-revenue-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.4" />
              <stop offset="60%" stopColor="var(--color-brand)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id="wave-profit-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </linearGradient>
          </defs>
        </svg>

        {/* Header & Controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)] transition-transform duration-200 hover:scale-105">
              <WaveformIcon size={22} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="m-0 text-lg font-extrabold tracking-tight text-[var(--color-text)]">
                  Grafik Kurva & Tren Pertumbuhan
                </h2>
                {peakBucket && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] px-2 py-0.5 text-[11px] font-extrabold text-[var(--color-brand)] shadow-xs transition-transform duration-200 hover:scale-105">
                    <FireIcon size={12} weight="fill" className="animate-pulse" />
                    <span>
                      Puncak: {peakBucket.shortLabel} (
                      {metric === "revenue"
                        ? renderMoney(peakBucket.revenue)
                        : metric === "profit"
                          ? renderMoney(peakBucket.profit)
                          : `${peakBucket.count} Nota`}
                      )
                    </span>
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-xs text-[var(--color-text-3)]">
                {range === "hari"
                  ? "Distribusi kurva performa per jam operasional toko hari ini"
                  : range === "minggu"
                    ? "Kurva tren performa harian sepanjang minggu ini"
                    : "Akumulasi kurva tren harian sepanjang bulan ini"}
              </div>
            </div>
          </div>

          {/* Metric Switcher Toggle */}
          <div className="flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] p-1">
            <button
              type="button"
              onClick={() => {
                setMetric("revenue");
                setActiveIdx(null);
              }}
              className={`press-tactile flex cursor-pointer items-center gap-1.5 rounded-full border-none px-3.5 py-1.5 text-xs font-bold transition-all ${
                metric === "revenue"
                  ? "shadow-primary-500/35 bg-[var(--color-brand)] text-white shadow-xs"
                  : "bg-transparent text-[var(--color-text-2)]"
              }`}
            >
              <TrendUpIcon size={14} weight="bold" />
              <span>Omset</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMetric("profit");
                setActiveIdx(null);
              }}
              className={`press-tactile flex cursor-pointer items-center gap-1.5 rounded-full border-none px-3.5 py-1.5 text-xs font-bold transition-all ${
                metric === "profit"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-transparent text-[var(--color-text-2)]"
              }`}
            >
              <ScalesIcon size={14} weight="bold" />
              <span>Laba Kotor</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMetric("count");
                setActiveIdx(null);
              }}
              className={`press-tactile flex cursor-pointer items-center gap-1.5 rounded-full border-none px-3.5 py-1.5 text-xs font-bold transition-all ${
                metric === "count"
                  ? "shadow-primary-500/35 bg-[var(--color-brand)] text-white shadow-xs"
                  : "bg-transparent text-[var(--color-text-2)]"
              }`}
            >
              <ReceiptIcon size={14} weight="bold" />
              <span>Transaksi</span>
            </button>
          </div>
        </div>

        {/* Active Insight Banner */}
        <div
          className={`mb-5 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border p-3 transition-all ${
            activeBucket
              ? "border-[var(--color-border)] bg-[var(--color-surface-2)]"
              : "border-[var(--color-brand)] bg-[var(--color-brand-light)]"
          }`}
        >
          {activeBucket ? (
            <>
              <div className="flex items-center gap-2">
                <ClockIcon size={16} weight="bold" className="text-[var(--color-brand)]" />
                <span className="text-xs font-bold text-[var(--color-text)]">
                  {activeBucket.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="text-[var(--color-text-2)]">
                  Omset:{" "}
                  <strong className="price font-extrabold text-[var(--color-brand)]">
                    {renderMoney(activeBucket.revenue)}
                  </strong>
                </div>
                <div className="text-[var(--color-text-2)]">
                  Laba Kotor:{" "}
                  <strong className="price font-extrabold text-emerald-600">
                    {renderMoney(activeBucket.profit)}
                  </strong>
                </div>
                <div className="text-[var(--color-text-2)]">
                  Nota:{" "}
                  <strong className="font-extrabold text-[var(--color-text)]">
                    {activeBucket.count} transaksi
                  </strong>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <TrendUpIcon size={16} weight="bold" className="text-[var(--color-brand)]" />
                <span className="text-xs font-bold text-[var(--color-brand-dark)]">
                  Ringkasan Kurva Tren{" "}
                  {range === "hari" ? "Hari Ini" : range === "minggu" ? "Minggu Ini" : "Bulan Ini"}
                </span>
              </div>
              <div className="text-xs text-[var(--color-text-2)]">
                Arahkan kursor atau sentuh kurva gelombang untuk melihat rincian omset dan laba
                setiap waktu
              </div>
            </>
          )}
        </div>

        {/* TanStack Chart Canvas */}
        <div className="relative w-full pt-2 transition-opacity duration-300">
          <Chart
            definition={chartDef}
            height={220}
            ariaLabel="Grafik Kurva Tren Penjualan"
            onFocusChange={(point) => {
              const nextIdx =
                point && point.datum && typeof (point.datum as any).idx === "number"
                  ? (point.datum as any).idx
                  : null;
              setActiveIdx((prev) => (prev === nextIdx ? prev : nextIdx));
            }}
            className="w-full text-[var(--color-text-3)]"
          />
        </div>
      </div>
    </section>
  );
}
