import { useState } from "react";
import { ChartBarIcon, TrendUpIcon, ReceiptIcon, FireIcon, ClockIcon } from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import type { Range, TrendBucket } from "../types";

interface TrendChartProps {
  txs: Array<{ createdAt: number; total: number; items: Array<any> }>;
  range: Range;
  totalRevenue: number;
}

export function TrendChart({ txs, range, totalRevenue }: TrendChartProps) {
  const [metric, setMetric] = useState<"revenue" | "count">("revenue");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

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

    const b: TrendBucket[] = Array.from({ length: daysInMonth }, (_, idx) => {
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
    <section className="doppelrand-shell mb-6" onMouseLeave={() => setActiveIdx(null)}>
      <div className="doppelrand-core">
        {/* Header & Controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              <ChartBarIcon size={22} weight="duotone" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="m-0 text-lg font-extrabold tracking-tight text-[var(--color-text)]">
                  Grafik Tren Penjualan
                </h2>
                {peakBucket && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] px-2 py-0.5 text-[11px] font-extrabold text-[var(--color-brand)]">
                    <FireIcon size={12} weight="fill" />
                    <span>
                      Puncak: {peakBucket.shortLabel} (
                      {metric === "revenue"
                        ? formatIDR(peakBucket.revenue)
                        : `${peakBucket.count} Nota`}
                      )
                    </span>
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-xs text-[var(--color-text-3)]">
                {range === "hari"
                  ? "Distribusi penjualan per jam operasional toko hari ini"
                  : range === "minggu"
                    ? "Performa penjualan harian sepanjang minggu ini"
                    : "Akumulasi tren penjualan harian bulan ini"}
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
              <span>Omset (Rp)</span>
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
              <span>Transaksi (Nota)</span>
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
                    {formatIDR(activeBucket.revenue)}
                  </strong>
                </div>
                <div className="text-[var(--color-text-2)]">
                  Nota:{" "}
                  <strong className="font-extrabold text-[var(--color-text)]">
                    {activeBucket.count} transaksi
                  </strong>
                </div>
                {totalRevenue > 0 && (
                  <div className="text-[11px] text-[var(--color-text-3)]">
                    ({Math.round((activeBucket.revenue / totalRevenue) * 100)}% dari total)
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <TrendUpIcon size={16} weight="bold" className="text-[var(--color-brand)]" />
                <span className="text-xs font-bold text-[var(--color-brand-dark)]">
                  Ringkasan Tren{" "}
                  {range === "hari" ? "Hari Ini" : range === "minggu" ? "Minggu Ini" : "Bulan Ini"}
                </span>
              </div>
              <div className="text-xs text-[var(--color-text-2)]">
                Arahkan kursor atau sentuh diagram batang di bawah untuk melihat rincian setiap
                waktu
              </div>
            </>
          )}
        </div>

        {/* Chart Canvas */}
        <div className="relative h-52 w-full pt-2.5">
          {/* Grid Lines */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-7">
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
                <div key={pct} className="flex w-full items-center gap-2">
                  <span className="price min-w-[54px] text-right text-[10px] font-semibold text-[var(--color-text-3)]">
                    {label}
                  </span>
                  <div
                    className={`flex-1 ${
                      pct === 0
                        ? "border-b border-[var(--color-border)]"
                        : "border-b border-dashed border-[var(--color-border-subtle)]"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Bar Columns Container */}
          <div
            className={`absolute inset-0 flex items-end pb-7 pl-16 ${
              range === "bulan" ? "gap-0.5" : range === "minggu" ? "gap-3.5" : "gap-1.5"
            }`}
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
                  className="relative flex h-full flex-1 cursor-pointer flex-col items-center justify-end"
                >
                  <div
                    className={`w-full rounded-t-md transition-all duration-200 ${
                      range === "minggu"
                        ? "max-w-[48px]"
                        : range === "hari"
                          ? "max-w-[26px]"
                          : "max-w-[14px]"
                    } ${
                      isHovered
                        ? "shadow-primary-500/50 scale-y-105 bg-[var(--color-brand)] shadow-lg"
                        : isPeak
                          ? "shadow-primary-500/30 bg-[var(--color-brand)] shadow-md"
                          : hasData
                            ? "bg-[var(--color-brand)]/70"
                            : "bg-[var(--color-surface-3)]"
                    }`}
                    style={{
                      height: hasData ? `${Math.max(6, heightPct)}%` : "4px",
                      transformOrigin: "bottom",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* X-Axis Labels */}
          <div className="absolute right-0 bottom-0 left-16 flex h-6 items-center justify-between gap-0.5">
            {buckets.map((b, idx) => {
              const showLabel =
                range === "minggu" ||
                (range === "hari" && idx % 2 === 0) ||
                (range === "bulan" &&
                  (idx === 0 || (idx + 1) % 5 === 0 || idx === buckets.length - 1));
              const isHovered = activeIdx === idx;

              return (
                <div
                  key={b.id}
                  className={`flex-1 truncate text-center text-[10px] ${
                    isHovered
                      ? "font-extrabold text-[var(--color-brand)]"
                      : showLabel
                        ? "font-semibold text-[var(--color-text-3)]"
                        : "text-transparent"
                  }`}
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
