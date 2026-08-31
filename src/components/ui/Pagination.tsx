import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

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

  return (
    <div
      className={`p-4 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3 bg-[var(--color-surface)] ${className}`}
    >
      <div className="text-xs sm:text-sm text-[var(--color-text-3)] font-semibold">
        Menampilkan {startIndex + 1} - {endIndex} dari {totalCount} {itemLabel}
      </div>

      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} baris
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="press-tactile flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--color-border)] text-xs sm:text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
          title="Halaman Sebelumnya"
        >
          <CaretLeftIcon size={14} weight="bold" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        <span className="text-xs sm:text-sm font-bold text-[var(--color-text)] px-1">
          {currentPage} / {Math.max(1, totalPages)}
        </span>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="press-tactile flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--color-border)] text-xs sm:text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
          title="Halaman Selanjutnya"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <CaretRightIcon size={14} weight="bold" />
        </button>
      </div>
    </div>
  );
}
