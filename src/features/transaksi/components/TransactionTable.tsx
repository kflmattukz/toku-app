import {
  ReceiptIcon,
  MoneyIcon,
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PrinterIcon,
} from "@phosphor-icons/react";
import { formatDate, formatIDR } from "#/lib/utils";
import { Pagination } from "#/components/ui/Pagination";
import type { Transaction } from "../types";

interface TransactionTableProps {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelect: (tx: Transaction) => void;
}

export function TransactionTable({
  transactions,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSelect,
}: TransactionTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedTransactions = transactions.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[18px] overflow-hidden shadow-xs">
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 text-[var(--color-text-3)]">
          <ReceiptIcon size={52} className="opacity-30 mb-3" />
          <p className="m-0 text-sm font-semibold">Tidak ada transaksi ditemukan</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-only w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
                  {["No. Struk", "Waktu", "Metode", "Item Pesanan", "Total", "Status", "Aksi"].map(
                    (h, idx) => (
                      <th
                        key={h}
                        className={`py-4 px-5 text-[11px] font-extrabold text-[var(--color-text-3)] uppercase tracking-wider ${
                          idx === 4 || idx === 6 ? "text-right" : idx === 5 ? "text-center" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {pagedTransactions.map((tx, idx) => {
                  const txNumber = totalCount - (startIndex + idx);
                  const isCancelled = tx.status === "cancelled";
                  const itemsSummary = tx.items
                    ?.map((i) => `${i.name} (${i.qty})`)
                    .join(", ");

                  return (
                    <tr
                      key={tx._id}
                      onClick={() => onSelect(tx)}
                      className={`border-b border-[var(--color-border-subtle)] cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors ${
                        isCancelled ? "opacity-75 bg-[var(--color-danger-light)]/30" : ""
                      }`}
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-black ${
                              isCancelled ? "text-[var(--color-danger-text)]" : "text-[var(--color-brand)]"
                            }`}
                          >
                            #{txNumber}
                          </span>
                          {tx.syncedFromOffline && (
                            <span className="text-[10px] font-extrabold bg-[var(--color-warning-light)] text-[var(--color-warning-text)] px-2 py-0.5 rounded-full border border-[var(--color-warning)]/30">
                              Offline
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="text-xs font-semibold text-[var(--color-text)]">
                          {formatDate(tx.createdAt)}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-bold ${
                            tx.paymentMethod === "cash"
                              ? "bg-[var(--color-brand-light)] text-[var(--color-brand)] border border-[var(--color-brand)]/20"
                              : "bg-[var(--color-surface-3)] text-[var(--color-text)] border border-[var(--color-border)]"
                          }`}
                        >
                          {tx.paymentMethod === "cash" ? (
                            <MoneyIcon size={14} weight="bold" />
                          ) : (
                            <QrCodeIcon size={14} weight="bold" />
                          )}
                          <span>{tx.paymentMethod === "cash" ? "Tunai" : "QRIS"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div
                          className="text-xs text-[var(--color-text-2)] max-w-[240px] truncate"
                          title={itemsSummary}
                        >
                          {itemsSummary}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span
                          className={`price font-extrabold text-sm ${
                            isCancelled
                              ? "text-[var(--color-danger-text)] line-through"
                              : "text-[var(--color-text)]"
                          }`}
                        >
                          {formatIDR(tx.total)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 bg-[var(--color-danger-light)] text-[var(--color-danger-text)] border border-[var(--color-danger)]/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
                            <XCircleIcon size={14} weight="fill" />
                            <span>DIBATALKAN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-[var(--color-success-light)] text-[var(--color-success-text)] px-2.5 py-0.5 rounded-full text-[11px] font-extrabold">
                            <CheckCircleIcon size={14} weight="fill" />
                            <span>SELESAI</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(tx);
                          }}
                          className="press-tactile py-1.5 px-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[var(--color-surface)]"
                        >
                          <PrinterIcon size={14} />
                          <span>Rincian</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Phone Card List View */}
          <div className="mobile-only flex flex-col divide-y divide-[var(--color-border)]">
            {pagedTransactions.map((tx, idx) => {
              const txNumber = totalCount - (startIndex + idx);
              const isCancelled = tx.status === "cancelled";

              return (
                <div
                  key={tx._id}
                  onClick={() => onSelect(tx)}
                  className={`p-4 flex flex-col gap-2.5 cursor-pointer ${
                    isCancelled ? "opacity-75 bg-[var(--color-danger-light)]/20" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-extrabold ${
                          isCancelled ? "text-[var(--color-danger-text)]" : "text-[var(--color-brand)]"
                        }`}
                      >
                        #{txNumber}
                      </span>
                      {isCancelled ? (
                        <span className="text-[10px] font-extrabold bg-[var(--color-danger-light)] text-[var(--color-danger-text)] border border-[var(--color-danger)]/30 px-2 py-0.5 rounded-full">
                          Batal
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold bg-[var(--color-success-light)] text-[var(--color-success-text)] px-2 py-0.5 rounded-full">
                          Selesai
                        </span>
                      )}
                    </div>
                    <div className="price text-sm font-black text-[var(--color-text)]">
                      {formatIDR(tx.total)}
                    </div>
                  </div>

                  <div className="text-xs text-[var(--color-text-3)] flex items-center justify-between">
                    <span>{formatDate(tx.createdAt)}</span>
                    <span className="font-bold text-[var(--color-text-2)]">
                      {tx.paymentMethod === "cash" ? "Tunai" : "QRIS"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            itemLabel="transaksi"
          />
        </>
      )}
    </div>
  );
}
