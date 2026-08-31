import {
  MoneyIcon,
  ShoppingCartIcon,
  ChartLineUpIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import type { Range } from "../types";

interface ReportKpiGridProps {
  range: Range;
  totalRevenue: number;
  totalTransactions: number;
  totalItems: number;
  cancelledCount: number;
  cancelledTotal: number;
}

export function ReportKpiGrid({
  range,
  totalRevenue,
  totalTransactions,
  totalItems,
  cancelledCount,
  cancelledTotal,
}: ReportKpiGridProps) {
  const periodLabel =
    range === "hari" ? "hari ini" : range === "minggu" ? "minggu ini" : "bulan ini";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Omset Netto */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-extrabold text-[var(--color-brand)] bg-[var(--color-brand-light)] border border-[var(--color-brand)] py-0.5 px-2.5 rounded-full tracking-wider uppercase">
              OMSET NETTO
            </span>
            <div className="w-10 h-10 rounded-full bg-[var(--color-brand-light)] border border-[var(--color-brand)] flex items-center justify-center text-[var(--color-brand)]">
              <MoneyIcon size={22} weight="duotone" />
            </div>
          </div>
          <div className="text-xs font-bold text-[var(--color-text-2)] mb-1">
            Total Pendapatan
          </div>
          <div className="price text-2xl sm:text-3xl font-black text-[var(--color-text)] mb-1.5 tracking-tight">
            {formatIDR(totalRevenue)}
          </div>
          <div className="text-[11px] text-[var(--color-text-3)] font-medium">
            Periode {periodLabel}
          </div>
        </div>
      </div>

      {/* 2. Nota Sukses */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-extrabold text-[var(--color-success-text)] bg-[var(--color-success-light)] border border-[var(--color-success)] py-0.5 px-2.5 rounded-full tracking-wider uppercase">
              NOTA SUKSES
            </span>
            <div className="w-10 h-10 rounded-full bg-[var(--color-success-light)] border border-[var(--color-success)] flex items-center justify-center text-[var(--color-success-text)]">
              <ShoppingCartIcon size={22} weight="duotone" />
            </div>
          </div>
          <div className="text-xs font-bold text-[var(--color-text-2)] mb-1">
            Jumlah Transaksi
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--color-text)] mb-1.5 tracking-tight">
            {totalTransactions} Transaksi
          </div>
          <div className="text-[11px] text-[var(--color-text-3)] font-medium">
            Total nota penjualan berhasil
          </div>
        </div>
      </div>

      {/* 3. Total Item Out */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-extrabold text-[var(--color-warning-text)] bg-[var(--color-warning-light)] border border-[var(--color-warning)] py-0.5 px-2.5 rounded-full tracking-wider uppercase">
              TOTAL ITEM OUT
            </span>
            <div className="w-10 h-10 rounded-full bg-[var(--color-warning-light)] border border-[var(--color-warning)] flex items-center justify-center text-[var(--color-warning-text)]">
              <ChartLineUpIcon size={22} weight="duotone" />
            </div>
          </div>
          <div className="text-xs font-bold text-[var(--color-text-2)] mb-1">
            Produk Terjual
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--color-text)] mb-1.5 tracking-tight">
            {totalItems} pcs
          </div>
          <div className="text-[11px] text-[var(--color-text-3)] font-medium">
            Total unit barang keluar dari toko
          </div>
        </div>
      </div>

      {/* 4. Retur / Batal */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-extrabold text-[var(--color-danger-text)] bg-[var(--color-danger-light)] border border-[var(--color-danger)] py-0.5 px-2.5 rounded-full tracking-wider uppercase">
              RETUR / BATAL
            </span>
            <div className="w-10 h-10 rounded-full bg-[var(--color-danger-light)] border border-[var(--color-danger)] flex items-center justify-center text-[var(--color-danger-text)]">
              <ArrowCounterClockwiseIcon size={22} weight="duotone" />
            </div>
          </div>
          <div className="text-xs font-bold text-[var(--color-text-2)] mb-1">
            Transaksi Dibatalkan
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--color-text)] mb-1.5 tracking-tight">
            {cancelledCount} Transaksi
          </div>
          <div className="text-[11px] text-[var(--color-text-3)] font-medium truncate">
            {cancelledTotal > 0
              ? `Total Retur: ${formatIDR(cancelledTotal)}`
              : "Tidak ada transaksi retur"}
          </div>
        </div>
      </div>
    </div>
  );
}
