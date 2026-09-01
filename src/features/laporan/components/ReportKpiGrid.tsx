import {
  MoneyIcon,
  ShoppingCartIcon,
  ChartLineUpIcon,
  ArrowCounterClockwiseIcon,
  CoinsIcon,
  TrendUpIcon,
  PackageIcon,
  ScalesIcon,
} from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import type { Range } from "../types";

interface ReportKpiGridProps {
  range: Range;
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMargin: number;
  totalExpenses: number;
  netProfit: number;
  netMargin: number;
  totalTransactions: number;
  totalItems: number;
  cancelledCount: number;
  cancelledTotal: number;
  privacyMode?: boolean;
}

export function ReportKpiGrid({
  range,
  totalRevenue,
  totalCogs,
  grossProfit,
  grossMargin,
  totalExpenses,
  netProfit,
  netMargin,
  totalTransactions,
  totalItems,
  cancelledCount,
  cancelledTotal,
  privacyMode = false,
}: ReportKpiGridProps) {
  const periodLabel =
    range === "hari" ? "hari ini" : range === "minggu" ? "minggu ini" : "bulan ini";

  const renderMoney = (amount: number, prefix: string = "") => {
    if (privacyMode) return "Rp ••••••";
    return `${prefix}${formatIDR(amount)}`;
  };

  // Status Kesehatan Bisnis
  const isHealthy = netMargin >= 20;
  const isLoss = netMargin <= 0 && (totalRevenue > 0 || totalExpenses > 0);

  return (
    <div className="mb-6 space-y-4">
      {/* 4 Kartu P&L Utama (Income Statement) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Omset Kotor */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-[var(--color-brand)] uppercase">
                1. OMSET TOKO
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]">
                <MoneyIcon size={20} weight="duotone" />
              </div>
            </div>
            <div className="mb-1 text-xs font-bold text-[var(--color-text-2)]">Total Penjualan</div>
            <div className="price mb-1 text-2xl font-black tracking-tight text-[var(--color-text)] sm:text-2xl">
              {renderMoney(totalRevenue)}
            </div>
            <div className="text-[11px] font-medium text-[var(--color-text-3)]">
              Periode {periodLabel}
            </div>
          </div>
        </div>

        {/* 2. Total HPP / Modal */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-amber-600 uppercase">
                2. TOTAL HPP (MODAL)
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600">
                <PackageIcon size={20} weight="duotone" />
              </div>
            </div>
            <div className="mb-1 text-xs font-bold text-[var(--color-text-2)]">
              Modal Barang Terjual
            </div>
            <div className="price mb-1 text-2xl font-black tracking-tight text-amber-600 sm:text-2xl">
              {renderMoney(totalCogs, "-")}
            </div>
            <div className="text-[11px] font-medium text-[var(--color-text-3)]">
              {totalRevenue > 0
                ? `${Math.round((totalCogs / totalRevenue) * 100)}% dari omset`
                : "Biaya pokok barang"}
            </div>
          </div>
        </div>

        {/* 3. Beban & Biaya Operasional */}
        <div className="doppelrand-shell">
          <div className="doppelrand-core">
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-rose-600 uppercase">
                3. BIAYA OPERASIONAL
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600">
                <CoinsIcon size={20} weight="duotone" />
              </div>
            </div>
            <div className="mb-1 text-xs font-bold text-[var(--color-text-2)]">
              Beban & Pengeluaran
            </div>
            <div className="price mb-1 text-2xl font-black tracking-tight text-rose-600 sm:text-2xl">
              {renderMoney(totalExpenses, "-")}
            </div>
            <div className="text-[11px] font-medium text-[var(--color-text-3)]">
              Gaji, listrik, sewa & operasional
            </div>
          </div>
        </div>

        {/* 4. LABA BERSIH (NET PROFIT) - Highlight Card */}
        <div
          className={`rounded-2xl border-2 p-4.5 shadow-md transition-all ${
            isHealthy
              ? "border-emerald-500/60 bg-emerald-500/10"
              : isLoss
                ? "border-rose-500/60 bg-rose-500/10"
                : "border-amber-500/60 bg-amber-500/10"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase ${
                isHealthy
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-600"
                  : isLoss
                    ? "border-rose-500 bg-rose-500/20 text-rose-600"
                    : "border-amber-500 bg-amber-500/20 text-amber-600"
              }`}
            >
              4. LABA BERSIH (NET)
            </span>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                isHealthy
                  ? "bg-emerald-500 text-white"
                  : isLoss
                    ? "bg-rose-500 text-white"
                    : "bg-amber-500 text-white"
              }`}
            >
              <TrendUpIcon size={20} weight="bold" />
            </div>
          </div>

          <div className="mb-1 text-xs font-bold text-[var(--color-text)]">
            Keuntungan Bersih Riil
          </div>

          <div
            className={`price mb-1.5 text-2xl font-black tracking-tight sm:text-3xl ${
              isHealthy ? "text-emerald-600" : isLoss ? "text-rose-600" : "text-amber-600"
            }`}
          >
            {renderMoney(netProfit)}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-extrabold">
            <span
              className={`inline-block rounded-full px-2 py-0.5 ${
                isHealthy
                  ? "bg-emerald-500/20 text-emerald-700"
                  : isLoss
                    ? "bg-rose-500/20 text-rose-700"
                    : "bg-amber-500/20 text-amber-700"
              }`}
            >
              {isHealthy
                ? `🟢 Prima (${netMargin.toFixed(1)}% Margin)`
                : isLoss
                  ? `🔴 Rugi Operasional (${netMargin.toFixed(1)}%)`
                  : `🟡 Tipis (${netMargin.toFixed(1)}% Margin)`}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Quick Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-text-3)]">
            <ScalesIcon size={14} weight="bold" className="text-[var(--color-brand)]" />
            <span>Laba Kotor (Gross)</span>
          </div>
          <div className="price mt-1 text-base font-black text-[var(--color-text)]">
            {renderMoney(grossProfit)}
          </div>
          <div className="text-[10px] text-[var(--color-text-3)]">
            Margin Kotor: {grossMargin.toFixed(1)}%
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-text-3)]">
            <ShoppingCartIcon size={14} weight="bold" className="text-emerald-600" />
            <span>Nota Berhasil</span>
          </div>
          <div className="mt-1 text-base font-black text-[var(--color-text)]">
            {totalTransactions} Transaksi
          </div>
          <div className="text-[10px] text-[var(--color-text-3)]">Rata-rata nota selesai</div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-text-3)]">
            <ChartLineUpIcon size={14} weight="bold" className="text-amber-600" />
            <span>Unit Terjual</span>
          </div>
          <div className="mt-1 text-base font-black text-[var(--color-text)]">
            {totalItems} pcs
          </div>
          <div className="text-[10px] text-[var(--color-text-3)]">Total item keluar</div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--color-text-3)]">
            <ArrowCounterClockwiseIcon size={14} weight="bold" className="text-rose-600" />
            <span>Retur / Batal</span>
          </div>
          <div className="mt-1 text-base font-black text-[var(--color-text)]">
            {cancelledCount} Transaksi
          </div>
          <div className="truncate text-[10px] text-[var(--color-text-3)]">
            {cancelledTotal > 0 ? renderMoney(cancelledTotal) : "Nihil"}
          </div>
        </div>
      </div>
    </div>
  );
}
