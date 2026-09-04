import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { useState } from "react";
import { dayRange, weekRange, monthRange } from "#/lib/utils";
import { PackageIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
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
  const { store, privacyMode, togglePrivacyMode } = useAppStore();
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
  const totalCogs = summary.totalCogs ?? 0;
  const grossProfit = summary.grossProfit ?? 0;
  const grossMargin = summary.grossMargin ?? 0;
  const totalExpenses = summary.totalExpenses ?? 0;
  const netProfit = summary.netProfit ?? 0;
  const netMargin = summary.netMargin ?? 0;

  const txs = summary.transactions ?? [];
  const totalItems = txs.reduce((sum, tx) => sum + tx.items.reduce((s, i) => s + i.qty, 0), 0);

  const productMap: Record<string, TopProduct> = {};
  for (const tx of txs) {
    for (const item of tx.items) {
      const itemCost = (item.costPrice ?? 0) * item.qty;
      const itemRev = item.price * item.qty;
      const itemProfit = itemRev - itemCost;

      if (!productMap[item.name]) {
        productMap[item.name] = {
          name: item.name,
          totalQty: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
        };
      }
      productMap[item.name].totalQty += item.qty;
      productMap[item.name].totalRevenue += itemRev;
      productMap[item.name].totalCost += itemCost;
      productMap[item.name].totalProfit += itemProfit;
    }
  }
  const topProducts = Object.values(productMap);

  return (
    <div className="w-full pb-12">
      {/* Header with period toggle pills */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="eyebrow-tag">RINGKASAN OMSET, HPP & LABA BERSIH</div>
          <h1 className="mt-0.5 text-2xl font-black tracking-tight text-[var(--color-text)]">
            Laporan Keuangan & Profit
          </h1>
          <p className="mt-1 text-xs text-[var(--color-text-2)]">
            Pantau performa bisnis, HPP, pengeluaran, dan laba riil toko secara real-time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ReportPeriodFilter range={range} onRangeChange={setRange} />
          <button
            type="button"
            onClick={togglePrivacyMode}
            className={`press-tactile flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
              privacyMode
                ? "border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)] shadow-xs"
                : "border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
            }`}
            title={privacyMode ? "Tampilkan Angka Omset & Cuan" : "Sensor Angka Privasi"}
          >
            {privacyMode ? (
              <>
                <EyeSlashIcon size={15} weight="bold" />
                <span className="text-[11px]">Privasi Aktif</span>
              </>
            ) : (
              <>
                <EyeIcon size={15} weight="bold" />
                <span className="text-[11px]">Sensor Angka</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main KPI Stat Cards (P&L Breakdown) */}
      <ReportKpiGrid
        range={range}
        totalRevenue={totalRevenue}
        totalCogs={totalCogs}
        grossProfit={grossProfit}
        grossMargin={grossMargin}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        netMargin={netMargin}
        totalTransactions={totalTransactions}
        totalItems={totalItems}
        cancelledCount={summary.cancelledCount ?? 0}
        cancelledTotal={summary.cancelledTotal ?? 0}
        privacyMode={privacyMode}
      />

      {/* Interactive Sales & Profit Trend Chart */}
      <TrendChart
        txs={txs}
        range={range}
        totalRevenue={totalRevenue}
        totalProfit={grossProfit}
        privacyMode={privacyMode}
      />

      {/* Top-Selling & Most Profitable Products Ranking List */}
      <TopProductsLeaderboard topProducts={topProducts} privacyMode={privacyMode} />
    </div>
  );
}

function LaporanLoader() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <PackageIcon
        size={48}
        weight="duotone"
        className="animate-pulse text-[var(--color-brand)] opacity-50"
      />
      <p className="text-sm font-bold text-[var(--color-text-2)]">Memuat laporan...</p>
    </div>
  );
}
