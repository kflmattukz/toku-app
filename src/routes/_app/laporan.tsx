import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { useState } from "react";
import { dayRange, weekRange, monthRange } from "#/lib/utils";
import { PackageIcon } from "@phosphor-icons/react";
import {
  ReportPeriodFilter,
  ReportKpiGrid,
  TrendChart,
  TopProductsLeaderboard,
  type Range,
  type TopProduct,
} from "#/features/laporan";

export const Route = createFileRoute("/_app/laporan")({ component: Laporan });

function Laporan() {
  const { store } = useAppStore();
  const [range, setRange] = useState<Range>("hari");

  const { startOfDay, endOfDay } =
    range === "hari" ? dayRange() : range === "minggu" ? weekRange() : monthRange();

  const summary = useQuery(
    api.transactions.dailySummary,
    store ? { storeId: store._id, startOfDay, endOfDay } : "skip",
  );

  if (!summary) return <LaporanLoader />;

  const totalRevenue = summary.total ?? 0;
  const totalTransactions = summary.count ?? 0;
  const txs = summary.transactions ?? [];
  const totalItems = txs.reduce(
    (sum, tx) => sum + tx.items.reduce((s, i) => s + i.qty, 0),
    0,
  );

  const productMap: Record<string, TopProduct> = {};
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
    <div className="w-full pb-12">
      {/* Header with period toggle pills */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="eyebrow-tag">RINGKASAN OMSET & REKAP</div>
          <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight mt-0.5">
            Laporan Penjualan
          </h1>
          <p className="text-xs text-[var(--color-text-2)] mt-1">
            Pantau performa bisnis dan omset toko secara real-time
          </p>
        </div>

        <ReportPeriodFilter range={range} onRangeChange={setRange} />
      </div>

      {/* Main KPI Stat Cards */}
      <ReportKpiGrid
        range={range}
        totalRevenue={totalRevenue}
        totalTransactions={totalTransactions}
        totalItems={totalItems}
        cancelledCount={summary.cancelledCount ?? 0}
        cancelledTotal={summary.cancelledTotal ?? 0}
      />

      {/* Interactive Sales & Revenue Trend Chart */}
      <TrendChart
        txs={txs}
        range={range}
        totalRevenue={totalRevenue}
      />

      {/* Top-Selling Products Ranking List */}
      <TopProductsLeaderboard topProducts={topProducts} />
    </div>
  );
}

function LaporanLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <PackageIcon
        size={48}
        weight="duotone"
        className="text-[var(--color-brand)] opacity-50 animate-pulse"
      />
      <p className="text-[var(--color-text-2)] text-sm font-bold">Memuat laporan...</p>
    </div>
  );
}
