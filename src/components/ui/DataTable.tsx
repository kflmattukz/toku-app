import { flexRender } from "@tanstack/react-table";
import { CaretUpIcon, CaretDownIcon, CaretUpDownIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

interface DataTableProps {
  table: any;
  emptyMessage?: ReactNode;
  className?: string;
}

export function DataTable({
  table,
  emptyMessage = "Tidak ada data ditemukan",
  className = "",
}: DataTableProps) {
  const rows = table.getRowModel().rows;
  const colCount = table.getAllColumns().length;

  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-left">
        <thead>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <tr
              key={headerGroup.id}
              className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]"
            >
              {headerGroup.headers.map((header: any) => {
                const canSort = header.column.getCanSort();
                const isSorted = header.column.getIsSorted();

                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={`px-5 py-4 text-[11px] font-extrabold tracking-wider text-[var(--color-text-3)] uppercase select-none ${
                      canSort
                        ? "cursor-pointer hover:bg-[var(--color-surface-3)] transition-colors"
                        : ""
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                      {canSort && (
                        <span className="text-[var(--color-text-3)] opacity-80">
                          {isSorted === "asc" ? (
                            <CaretUpIcon
                              size={14}
                              weight="bold"
                              className="text-[var(--color-brand)]"
                            />
                          ) : isSorted === "desc" ? (
                            <CaretDownIcon
                              size={14}
                              weight="bold"
                              className="text-[var(--color-brand)]"
                            />
                          ) : (
                            <CaretUpDownIcon size={14} weight="regular" className="opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={colCount}
                className="px-5 py-12 text-center text-sm font-semibold text-[var(--color-text-3)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row: any) => (
              <tr
                key={row.id}
                className="border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-2)] last:border-b-0"
              >
                {row.getVisibleCells().map((cell: any) => (
                  <td
                    key={cell.id}
                    className="px-5 py-3.5 text-xs text-[var(--color-text)] align-middle"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
