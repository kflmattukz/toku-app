import type { Range } from "../types";

interface ReportPeriodFilterProps {
  range: Range;
  onRangeChange: (range: Range) => void;
}

const PERIODS: { key: Range; label: string }[] = [
  { key: "hari", label: "Hari Ini" },
  { key: "minggu", label: "Minggu Ini" },
  { key: "bulan", label: "Bulan Ini" },
];

export function ReportPeriodFilter({ range, onRangeChange }: ReportPeriodFilterProps) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-3)] p-1">
      {PERIODS.map((r) => {
        const active = range === r.key;
        return (
          <button
            key={r.key}
            type="button"
            onClick={() => onRangeChange(r.key)}
            className={`press-tactile cursor-pointer rounded-full border-none px-4 py-1.5 text-xs transition-all ${
              active
                ? "bg-[var(--color-surface)] font-extrabold text-[var(--color-brand-dark)] shadow-xs"
                : "bg-transparent font-semibold text-[var(--color-text-2)] hover:text-[var(--color-text)]"
            }`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
