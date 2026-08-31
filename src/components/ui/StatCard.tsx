import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<{
    size?: number | string;
    className?: string;
    weight?: "regular" | "bold" | "fill" | "duotone";
  }>;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs transition-all hover:border-[var(--color-brand)] sm:p-5 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold tracking-wider text-[var(--color-text-3)] uppercase">
          {title}
        </span>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-brand)]/30 bg-[var(--color-brand-light)] text-[var(--color-brand)]">
            <Icon size={18} weight="bold" />
          </div>
        )}
      </div>

      <div className="mt-2 text-xl font-black tracking-tight text-[var(--color-text)] sm:text-2xl">
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="mt-1 flex items-center gap-2 text-xs font-medium text-[var(--color-text-2)]">
          {trend && (
            <span
              className={`font-bold ${
                trend.isPositive
                  ? "text-[var(--color-success-text)]"
                  : "text-[var(--color-danger-text)]"
              }`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
