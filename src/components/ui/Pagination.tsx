import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Select, type SelectOption } from "./Select";
import { Button } from "./Button";
import { cn } from "#/lib/utils";

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
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4",
        className,
      )}
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

        <Button
          type="button"
          variant="secondary"
          size="xs"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          leftIcon={<CaretLeftIcon size={14} weight="bold" />}
          title="Halaman Sebelumnya"
        >
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        <span className="px-1 text-xs font-bold text-[var(--color-text)] sm:text-sm">
          {currentPage} / {Math.max(1, totalPages)}
        </span>

        <Button
          type="button"
          variant="secondary"
          size="xs"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          rightIcon={<CaretRightIcon size={14} weight="bold" />}
          title="Halaman Selanjutnya"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
        </Button>
      </div>
    </div>
  );
}
