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
    <div className="flex items-center gap-1 bg-[var(--color-surface-3)] p-1 rounded-full border border-[var(--color-border)]">
      {PERIODS.map((r) => {
        const active = range === r.key;
        return (
          <button
            key={r.key}
            type="button"
            onClick={() => onRangeChange(r.key)}
            className={`press-tactile py-1.5 px-4 rounded-full text-xs cursor-pointer transition-all border-none ${
              active
                ? "bg-[var(--color-surface)] text-[var(--color-brand-dark)] font-extrabold shadow-xs"
                : "bg-transparent text-[var(--color-text-2)] font-semibold hover:text-[var(--color-text)]"
            }`}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
