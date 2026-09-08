import { CircleNotchIcon } from "@phosphor-icons/react";
import type { Range } from "../types";

interface ReportPeriodFilterProps {
  range: Range;
  onRangeChange: (range: Range) => void;
  isLoading?: boolean;
}

const PERIODS: { key: Range; label: string }[] = [
  { key: "hari", label: "Hari Ini" },
  { key: "minggu", label: "Minggu Ini" },
  { key: "bulan", label: "Bulan Ini" },
];

export function ReportPeriodFilter({
  range,
  onRangeChange,
  isLoading = false,
}: ReportPeriodFilterProps) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-3)] p-1">
      {PERIODS.map((r) => {
        const active = range === r.key;
        return (
          <button
            key={r.key}
            type="button"
            onClick={() => onRangeChange(r.key)}
            className={`press-tactile flex cursor-pointer items-center gap-1.5 rounded-full border-none px-4 py-1.5 text-xs transition-all ${
              active
                ? "bg-[var(--color-surface)] font-extrabold text-[var(--color-brand-dark)] shadow-xs"
                : "bg-transparent font-semibold text-[var(--color-text-2)] hover:text-[var(--color-text)]"
            }`}
          >
            {active && isLoading && (
              <CircleNotchIcon
                size={13}
                weight="bold"
                className="animate-spin text-[var(--color-brand)]"
              />
            )}
            <span>{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
