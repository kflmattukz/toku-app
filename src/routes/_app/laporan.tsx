import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { useState, useEffect } from "react";
import { dayRange, weekRange, monthRange } from "#/lib/utils";
import { EyeIcon, EyeSlashIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "#/components/ui";
import {
  ReportPeriodFilter,
  ReportKpiGrid,
  TrendChart,
  TopProductsLeaderboard,
  ExportReportModal,
  LaporanSkeleton,
  type Range,
  type TopProduct,
} from "#/features/laporan";

export const Route = createFileRoute("/_app/laporan")({ component: Laporan });

function Laporan() {
  const { store, privacyMode, togglePrivacyMode } = useAppStore();
  const [range, setRange] = useState<Range>("hari");
  const [showExportModal, setShowExportModal] = useState(false);

  const { startOfDay, endOfDay } =
    range === "hari" ? dayRange() : range === "minggu" ? weekRange() : monthRange();

  const dateLabel =
    range === "hari"
      ? `Hari Ini (${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })})`
      : range === "minggu"
        ? "Minggu Ini (7 Hari Terakhir)"
        : "Bulan Ini (30 Hari Terakhir)";

  const rawSummary = useQuery(
    api.transactions.dailySummary,
    store ? { storeId: store._id, startOfDay, endOfDay } : "skip",
  );

  const [prevRawSummary, setPrevRawSummary] = useState(rawSummary);
  const [cachedSummary, setCachedSummary] = useState<typeof rawSummary>(rawSummary);
  const [dataVersion, setDataVersion] = useState(0);

  if (rawSummary !== undefined && rawSummary !== prevRawSummary) {
    setPrevRawSummary(rawSummary);
    setCachedSummary(rawSummary);
    setDataVersion((v) => v + 1);
  }

  const summary = rawSummary ?? cachedSummary;
  const isFetching = rawSummary === undefined && cachedSummary !== undefined;

  if (!summary) return <LaporanSkeleton />;

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
          <h1 className="mt-0.5 text-2xl font-black tracking-tight text-(--color-text)">
            Laporan Keuangan & Profit
          </h1>
          <p className="mt-1 text-xs text-(--color-text-2)">
            Pantau performa bisnis, HPP, pengeluaran, dan laba riil toko secara real-time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ReportPeriodFilter range={range} onRangeChange={setRange} isLoading={isFetching} />

          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<DownloadSimpleIcon size={15} weight="bold" />}
            onClick={() => setShowExportModal(true)}
            className="shadow-xs"
          >
            Export Laporan
          </Button>

          <button
            type="button"
            onClick={togglePrivacyMode}
            className={`press-tactile flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
              privacyMode
                ? "border-brand bg-brand/10 text-brand shadow-xs"
                : "border-border bg-surface-3 text-(--color-text-2) hover:bg-surface-2 hover:text-(--color-text)"
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

      {/* Main KPI Stat Cards (P&L Breakdown) with continuous NumberFlow animations */}
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

      {/* Dynamic Charts & Ranking Content with Arrival Animation */}
      <div key={dataVersion} className="animate-data-arrival">
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

      {/* Export Report Modal (PDF, Excel, Google Sheets) */}
      <ExportReportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={{
          storeName: store?.name || "Toku POS",
          storeAddress: store?.address,
          range,
          dateLabel,
          totalRevenue,
          totalCogs,
          grossProfit,
          grossMargin,
          totalExpenses,
          netProfit,
          netMargin,
          totalTransactions,
          totalItems,
          cancelledCount: summary.cancelledCount ?? 0,
          cancelledTotal: summary.cancelledTotal ?? 0,
          topProducts,
          transactions: txs,
        }}
      />
    </div>
  );
}
