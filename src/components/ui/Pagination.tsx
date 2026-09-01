import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Select, type SelectOption } from "./Select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  itemLabel = "data",
  className = "",
}: PaginationProps) {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);

  if (totalCount === 0) return null;

  const sizeOptions: SelectOption<number>[] = pageSizeOptions.map((opt) => ({
    value: opt,
    label: `${opt} baris`,
  }));

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 ${className}`}
    >
      <div className="text-xs font-semibold text-[var(--color-text-3)] sm:text-sm">
        Menampilkan {startIndex + 1} - {endIndex} dari {totalCount} {itemLabel}
      </div>

      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <div className="w-28">
            <Select<number>
              value={pageSize}
              onChange={(val) => onPageSizeChange(val)}
              options={sizeOptions}
              variant="form"
              size="sm"
            />
          </div>
        )}

        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="press-tactile flex cursor-pointer items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-bold text-[var(--color-text)] transition-all hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          title="Halaman Sebelumnya"
        >
          <CaretLeftIcon size={14} weight="bold" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        <span className="px-1 text-xs font-bold text-[var(--color-text)] sm:text-sm">
          {currentPage} / {Math.max(1, totalPages)}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="press-tactile flex cursor-pointer items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-bold text-[var(--color-text)] transition-all hover:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          title="Halaman Selanjutnya"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <CaretRightIcon size={14} weight="bold" />
        </button>
      </div>
    </div>
  );
}
