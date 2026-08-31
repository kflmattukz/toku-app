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
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Omset Netto */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-[var(--color-brand)] uppercase">
              OMSET NETTO
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              <MoneyIcon size={22} weight="duotone" />
            </div>
          </div>
          <div className="mb-1 text-xs font-bold text-[var(--color-text-2)]">Total Pendapatan</div>
          <div className="price mb-1.5 text-2xl font-black tracking-tight text-[var(--color-text)] sm:text-3xl">
            {formatIDR(totalRevenue)}
          </div>
          <div className="text-[11px] font-medium text-[var(--color-text-3)]">
            Periode {periodLabel}
          </div>
        </div>
      </div>

      {/* 2. Nota Sukses */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="rounded-full border border-[var(--color-success)] bg-[var(--color-success-light)] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-[var(--color-success-text)] uppercase">
              NOTA SUKSES
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-success)] bg-[var(--color-success-light)] text-[var(--color-success-text)]">
              <ShoppingCartIcon size={22} weight="duotone" />
            </div>
          </div>
          <div className="mb-1 text-xs font-bold text-[var(--color-text-2)]">Jumlah Transaksi</div>
          <div className="mb-1.5 text-2xl font-black tracking-tight text-[var(--color-text)] sm:text-3xl">
            {totalTransactions} Transaksi
          </div>
          <div className="text-[11px] font-medium text-[var(--color-text-3)]">
            Total nota penjualan berhasil
          </div>
        </div>
      </div>

      {/* 3. Total Item Out */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="rounded-full border border-[var(--color-warning)] bg-[var(--color-warning-light)] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-[var(--color-warning-text)] uppercase">
              TOTAL ITEM OUT
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-warning)] bg-[var(--color-warning-light)] text-[var(--color-warning-text)]">
              <ChartLineUpIcon size={22} weight="duotone" />
            </div>
          </div>
          <div className="mb-1 text-xs font-bold text-[var(--color-text-2)]">Produk Terjual</div>
          <div className="mb-1.5 text-2xl font-black tracking-tight text-[var(--color-text)] sm:text-3xl">
            {totalItems} pcs
          </div>
          <div className="text-[11px] font-medium text-[var(--color-text-3)]">
            Total unit barang keluar dari toko
          </div>
        </div>
      </div>

      {/* 4. Retur / Batal */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="rounded-full border border-[var(--color-danger)] bg-[var(--color-danger-light)] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-[var(--color-danger-text)] uppercase">
              RETUR / BATAL
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-danger)] bg-[var(--color-danger-light)] text-[var(--color-danger-text)]">
              <ArrowCounterClockwiseIcon size={22} weight="duotone" />
            </div>
          </div>
          <div className="mb-1 text-xs font-bold text-[var(--color-text-2)]">
            Transaksi Dibatalkan
          </div>
          <div className="mb-1.5 text-2xl font-black tracking-tight text-[var(--color-text)] sm:text-3xl">
            {cancelledCount} Transaksi
          </div>
          <div className="truncate text-[11px] font-medium text-[var(--color-text-3)]">
            {cancelledTotal > 0
              ? `Total Retur: ${formatIDR(cancelledTotal)}`
              : "Tidak ada transaksi retur"}
          </div>
        </div>
      </div>
    </div>
  );
}
