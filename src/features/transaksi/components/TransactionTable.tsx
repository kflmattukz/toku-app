import { useMemo } from "react";
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
import { Button, DataTable } from "#/components/ui";
import { useAppTable, createAppColumnHelper } from "#/lib/table";
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

const columnHelper = createAppColumnHelper<Transaction>();

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

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("_id", {
          header: "No. Struk",
          enableSorting: false,
          cell: (info) => {
            const tx = info.row.original;
            const txIndex = info.row.index;
            const txNumber = totalCount - (startIndex + txIndex);
            const isCancelled = tx.status === "cancelled";

            return (
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
            );
          },
        }),
        columnHelper.accessor("createdAt", {
          header: "Waktu",
          cell: (info) => (
            <div className="text-xs font-semibold text-[var(--color-text)]">
              {formatDate(info.getValue())}
            </div>
          ),
        }),
        columnHelper.accessor("paymentMethod", {
          header: "Metode",
          cell: (info) => {
            const method = info.getValue();
            return (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                  method === "cash"
                    ? "border border-[var(--color-brand)]/20 bg-[var(--color-brand-light)] text-[var(--color-brand)]"
                    : "border border-[var(--color-border)] bg-[var(--color-surface-3)] text-[var(--color-text)]"
                }`}
              >
                {method === "cash" ? (
                  <MoneyIcon size={14} weight="bold" />
                ) : (
                  <QrCodeIcon size={14} weight="bold" />
                )}
                <span>{method === "cash" ? "Tunai" : "QRIS"}</span>
              </span>
            );
          },
        }),
        columnHelper.display({
          id: "items",
          header: "Item Pesanan",
          enableSorting: false,
          cell: (info) => {
            const tx = info.row.original;
            const itemsSummary = tx.items?.map((i) => `${i.name} (${i.qty})`).join(", ");
            return (
              <div
                className="max-w-[240px] truncate text-xs text-[var(--color-text-2)]"
                title={itemsSummary}
              >
                {itemsSummary || "-"}
              </div>
            );
          },
        }),
        columnHelper.accessor("total", {
          header: "Total",
          cell: (info) => {
            const tx = info.row.original;
            const isCancelled = tx.status === "cancelled";
            return (
              <span
                className={`price text-sm font-extrabold ${
                  isCancelled
                    ? "text-[var(--color-danger-text)] line-through"
                    : "text-[var(--color-text)]"
                }`}
              >
                {formatIDR(info.getValue())}
              </span>
            );
          },
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: (info) => {
            const isCancelled = info.getValue() === "cancelled";
            return isCancelled ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--color-danger-text)]">
                <XCircleIcon size={14} weight="fill" />
                <span>DIBATALKAN</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-light)] px-2.5 py-0.5 text-[11px] font-extrabold text-[var(--color-success-text)]">
                <CheckCircleIcon size={14} weight="fill" />
                <span>SELESAI</span>
              </span>
            );
          },
        }),
        columnHelper.display({
          id: "actions",
          header: "Aksi",
          enableSorting: false,
          cell: (info) => (
            <Button
              type="button"
              variant="secondary"
              size="xs"
              leftIcon={<PrinterIcon size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(info.row.original);
              }}
            >
              Rincian
            </Button>
          ),
        }),
      ]),
    [onSelect, startIndex, totalCount],
  );

  const table = useAppTable({
    data: transactions,
    columns,
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
    autoResetPageIndex: false,
  });

  const pagedRows = table.getRowModel().rows;

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
          <div className="desktop-only w-full">
            <DataTable table={table} />
          </div>

          {/* Mobile Phone Card List View */}
          <div className="mobile-only flex flex-col divide-y divide-[var(--color-border)]">
            {pagedRows.map((row: any, idx: number) => {
              const tx = row.original;
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
