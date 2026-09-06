import { forwardRef } from "react";
import { formatIDR } from "#/lib/utils";
import { getLaymanHealthDiagnosis, type ReportExportData } from "../lib/report-export";
import { SparkleIcon } from "@phosphor-icons/react";

interface PrintableReportProps {
  data: ReportExportData;
  includeTransactions: boolean;
}

export const PrintableReport = forwardRef<HTMLDivElement, PrintableReportProps>(
  ({ data, includeTransactions }, ref) => {
    const diagnosis = getLaymanHealthDiagnosis(data.totalRevenue, data.netProfit, data.netMargin);
    const sortedProducts = [...data.topProducts].sort((a, b) => b.totalRevenue - a.totalRevenue);

    return (
      <div
        ref={ref}
        className="printable-report w-full max-w-[800px] mx-auto bg-white p-8 text-neutral-900 font-sans box-border"
        style={{ color: "#171717", backgroundColor: "#ffffff" }}
      >
        {/* Header Toko */}
        <div className="report-avoid-break flex items-start justify-between border-b-2 border-neutral-900 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-orange-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded tracking-wide uppercase">
                Toku POS
              </span>
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Laporan Keuangan & Laba Bersih
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-neutral-900 m-0">
              {data.storeName}
            </h1>
            {data.storeAddress && (
              <p className="text-xs text-neutral-600 mt-1 m-0">{data.storeAddress}</p>
            )}
            {data.storePhone && (
              <p className="text-xs text-neutral-500 mt-0.5 m-0">Telp: {data.storePhone}</p>
            )}
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-neutral-500">Periode Laporan</div>
            <div className="text-sm font-extrabold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-md mt-0.5 border border-orange-200 inline-block">
              {data.dateLabel}
            </div>
            <div className="text-[10px] text-neutral-400 mt-1.5">
              Waktu Cetak: {new Date().toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        {/* Diagnosa Kesehatan Bisnis Sederhana (Layman Health Box) */}
        <div
          className={`report-avoid-break p-4 rounded-xl border mb-6 ${
            diagnosis.isHealthy
              ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
              : "bg-amber-50/70 border-amber-300 text-amber-950"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <SparkleIcon
              size={18}
              weight="fill"
              className={diagnosis.isHealthy ? "text-emerald-600" : "text-amber-600"}
            />
            <h3 className="text-sm font-extrabold m-0">{diagnosis.title}</h3>
          </div>
          <p className="text-xs leading-relaxed m-0 text-neutral-700">{diagnosis.text}</p>
        </div>

        {/* Rangkuman 4 Angka Kunci */}
        <div className="report-avoid-break grid grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50">
            <div className="text-[11px] font-bold text-neutral-500 uppercase">Uang Masuk (Omset)</div>
            <div className="text-base font-black text-neutral-900 mt-1">
              {formatIDR(data.totalRevenue)}
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">{data.totalTransactions} transaksi</div>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50">
            <div className="text-[11px] font-bold text-neutral-500 uppercase">Modal Barang (HPP)</div>
            <div className="text-base font-black text-neutral-900 mt-1">
              {formatIDR(data.totalCogs)}
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">{data.totalItems} pcs barang</div>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50">
            <div className="text-[11px] font-bold text-neutral-500 uppercase">Biaya Operasional</div>
            <div className="text-base font-black text-rose-700 mt-1">
              {formatIDR(data.totalExpenses)}
            </div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Listrik, sewa, gaji, dll</div>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70">
            <div className="text-[11px] font-extrabold text-emerald-800 uppercase">Cuan Bersih Akhir</div>
            <div className="text-lg font-black text-emerald-800 mt-0.5">
              {formatIDR(data.netProfit)}
            </div>
            <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
              Margin {data.netMargin.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Perjalanan Cuan Toko (Step-by-step P&L Formula) */}
        <div className="report-avoid-break border border-neutral-200 rounded-xl overflow-hidden mb-6">
          <div className="bg-neutral-100 px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-700 m-0">
              Perjalanan Laba Rugi Toko (Laba Bersih Riil)
            </h3>
            <span className="text-[11px] text-neutral-500">Keterangan Rumus Sederhana</span>
          </div>

          <table className="w-full text-xs text-left border-collapse">
            <tbody>
              <tr className="border-b border-neutral-150">
                <td className="py-2.5 px-4 font-bold text-neutral-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-[10px]">
                    1
                  </span>
                  Total Uang Masuk (Omset Penjualan)
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-black text-neutral-900">
                  {formatIDR(data.totalRevenue)}
                </td>
                <td className="py-2.5 px-4 text-neutral-500 text-[11px]">
                  Semua uang yang diterima dari pembeli
                </td>
              </tr>

              <tr className="border-b border-neutral-150 bg-neutral-50/50">
                <td className="py-2.5 px-4 font-bold text-neutral-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-black text-[10px]">
                    2
                  </span>
                  Dikurangi: Modal Kulakan Barang (HPP)
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-neutral-600">
                  - {formatIDR(data.totalCogs)}
                </td>
                <td className="py-2.5 px-4 text-neutral-500 text-[11px]">
                  Modal awal barang yang berhasil laku
                </td>
              </tr>

              <tr className="border-b border-neutral-150">
                <td className="py-2.5 px-4 font-bold text-neutral-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-black text-[10px]">
                    =
                  </span>
                  Hasil: Untung Kotor Toko (Gross Profit)
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-black text-orange-800">
                  {formatIDR(data.grossProfit)}
                </td>
                <td className="py-2.5 px-4 text-neutral-500 text-[11px]">
                  Selisih harga jual dikurangi modal ({data.grossMargin.toFixed(1)}%)
                </td>
              </tr>

              <tr className="border-b border-neutral-150 bg-neutral-50/50">
                <td className="py-2.5 px-4 font-bold text-neutral-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-black text-[10px]">
                    3
                  </span>
                  Dikurangi: Biaya Operasional Toko
                </td>
                <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700">
                  - {formatIDR(data.totalExpenses)}
                </td>
                <td className="py-2.5 px-4 text-neutral-500 text-[11px]">
                  Listrik, sewa, gaji, kantong plastik, dll
                </td>
              </tr>

              <tr className="bg-emerald-100/60 font-black">
                <td className="py-3 px-4 text-emerald-950 flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
                    ★
                  </span>
                  CUAN BERSIH AKHIR (Masuk Kantong)
                </td>
                <td className="py-3 px-4 text-right font-mono font-black text-emerald-900 text-base">
                  {formatIDR(data.netProfit)}
                </td>
                <td className="py-3 px-4 text-emerald-800 text-[11px] font-semibold">
                  Uang murni Anda (Margin {data.netMargin.toFixed(1)}%)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabel Produk Terlaris & Paling Menguntungkan */}
        <div className="border border-neutral-200 rounded-xl overflow-hidden mb-6">
          <div className="bg-neutral-100 px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-700 m-0">
              Produk Paling Laris & Paling Menguntungkan
            </h3>
            <span className="text-[11px] text-neutral-500">
              Total {sortedProducts.length} Produk
            </span>
          </div>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-[11px] text-neutral-500 border-b border-neutral-200">
                <th className="py-2 px-3 font-bold w-10">No</th>
                <th className="py-2 px-3 font-bold">Nama Produk</th>
                <th className="py-2 px-3 font-bold text-center">Terjual</th>
                <th className="py-2 px-3 font-bold text-right">Total Omset</th>
                <th className="py-2 px-3 font-bold text-right">Total Modal</th>
                <th className="py-2 px-3 font-bold text-right">Cuan Bersih</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.slice(0, 15).map((p, idx) => (
                <tr key={p.name} className="border-b border-neutral-150 last:border-0 hover:bg-neutral-50">
                  <td className="py-2 px-3 text-neutral-500 font-bold">{idx + 1}</td>
                  <td className="py-2 px-3 font-extrabold text-neutral-900">{p.name}</td>
                  <td className="py-2 px-3 text-center font-bold text-neutral-700">{p.totalQty} pcs</td>
                  <td className="py-2 px-3 text-right font-mono text-neutral-800">
                    {formatIDR(p.totalRevenue)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-neutral-500">
                    {formatIDR(p.totalCost)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-black text-emerald-700">
                    {formatIDR(p.totalProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabel Transaksi Kasir (Jika dicentang) */}
        {includeTransactions && data.transactions.length > 0 && (
          <div className="border border-neutral-200 rounded-xl overflow-hidden mb-6">
            <div className="bg-neutral-100 px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-700 m-0">
                Buku Riwayat Transaksi Kasir
              </h3>
              <span className="text-[11px] text-neutral-500">
                {data.transactions.length} Transaksi Tercatat
              </span>
            </div>

            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-[10px] text-neutral-500 border-b border-neutral-200">
                  <th className="py-2 px-3 font-bold w-8">No</th>
                  <th className="py-2 px-3 font-bold">Waktu</th>
                  <th className="py-2 px-3 font-bold">Kasir</th>
                  <th className="py-2 px-3 font-bold">Item Terjual</th>
                  <th className="py-2 px-3 font-bold">Metode</th>
                  <th className="py-2 px-3 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.slice(0, 50).map((tx, idx) => (
                  <tr key={idx} className="border-b border-neutral-150 last:border-0">
                    <td className="py-2 px-3 text-neutral-500">{idx + 1}</td>
                    <td className="py-2 px-3 text-neutral-700 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2 px-3 font-semibold text-neutral-800">
                      {tx.cashierName || "Kasir"}
                    </td>
                    <td className="py-2 px-3 text-neutral-600 truncate max-w-[240px]">
                      {(tx.items || []).map((i: any) => `${i.name} (${i.qty})`).join(", ")}
                    </td>
                    <td className="py-2 px-3 uppercase font-bold text-[10px] text-neutral-600">
                      {tx.paymentMethod || "CASH"}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-neutral-900">
                      {formatIDR(tx.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer & Tanda Tangan */}
        <div className="mt-8 pt-4 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-400">
          <div>
            Dicetak otomatis dari sistem <strong>Toku POS</strong> · Solusi Kasir & Pembukuan UMKM
          </div>
          <div className="text-right">
            Halaman Dokumen Resmi {data.storeName}
          </div>
        </div>
      </div>
    );
  },
);

PrintableReport.displayName = "PrintableReport";
