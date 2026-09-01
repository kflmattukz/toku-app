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
import { Button } from "#/components/ui";
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
    <div className="overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center text-[var(--color-text-3)]">
          <ReceiptIcon size={52} className="mb-3 opacity-30" />
          <p className="m-0 text-sm font-semibold">Tidak ada transaksi ditemukan</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-only w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  {["No. Struk", "Waktu", "Metode", "Item Pesanan", "Total", "Status", "Aksi"].map(
                    (h, idx) => (
                      <th
                        key={h}
                        className={`px-5 py-4 text-[11px] font-extrabold tracking-wider text-[var(--color-text-3)] uppercase ${
                          idx === 4 || idx === 6
                            ? "text-right"
                            : idx === 5
                              ? "text-center"
                              : "text-left"
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
                  const itemsSummary = tx.items?.map((i) => `${i.name} (${i.qty})`).join(", ");

                  return (
                    <tr
                      key={tx._id}
                      onClick={() => onSelect(tx)}
                      className={`cursor-pointer border-b border-[var(--color-border-subtle)] transition-colors hover:bg-[var(--color-surface-2)] ${
                        isCancelled ? "bg-[var(--color-danger-light)]/30 opacity-75" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-black ${
                              isCancelled
                                ? "text-[var(--color-danger-text)]"
                                : "text-[var(--color-brand)]"
                            }`}
                          >
                            #{txNumber}
                          </span>
                          {tx.syncedFromOffline && (
                            <span className="rounded-full border border-[var(--color-warning)]/30 bg-[var(--color-warning-light)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-warning-text)]">
                              Offline
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs font-semibold text-[var(--color-text)]">
                          {formatDate(tx.createdAt)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                            tx.paymentMethod === "cash"
                              ? "border border-[var(--color-brand)]/20 bg-[var(--color-brand-light)] text-[var(--color-brand)]"
                              : "border border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text)]"
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
                      <td className="px-5 py-3.5">
                        <div
                          className="max-w-[240px] truncate text-xs text-[var(--color-text-2)]"
                          title={itemsSummary}
                        >
                          {itemsSummary}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`price text-sm font-extrabold ${
                            isCancelled
                              ? "text-[var(--color-danger-text)] line-through"
                              : "text-[var(--color-text)]"
                          }`}
                        >
                          {formatIDR(tx.total)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--color-danger-text)]">
                            <XCircleIcon size={14} weight="fill" />
                            <span>DIBATALKAN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-light)] px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--color-success-text)]">
                            <CheckCircleIcon size={14} weight="fill" />
                            <span>SELESAI</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          type="button"
                          variant="secondary"
                          size="xs"
                          leftIcon={<PrinterIcon size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(tx);
                          }}
                        >
                          Rincian
                        </Button>
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
                  className={`flex cursor-pointer flex-col gap-2.5 p-4 ${
                    isCancelled ? "bg-[var(--color-danger-light)]/20 opacity-75" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-extrabold ${
                          isCancelled
                            ? "text-[var(--color-danger-text)]"
                            : "text-[var(--color-brand)]"
                        }`}
                      >
                        #{txNumber}
                      </span>
                      {isCancelled ? (
                        <span className="rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-danger-text)]">
                          Batal
                        </span>
                      ) : (
                        <span className="rounded-full bg-[var(--color-success-light)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-success-text)]">
                          Selesai
                        </span>
                      )}
                    </div>
                    <div className="price text-sm font-black text-[var(--color-text)]">
                      {formatIDR(tx.total)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--color-text-3)]">
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
