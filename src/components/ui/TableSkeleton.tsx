import React from "react";

interface TableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
  mobileCardCount?: number;
  renderMobileCard?: (index: number) => React.ReactNode;
}

export function TableSkeleton({
  columnCount = 5,
  rowCount = 6,
  mobileCardCount = 4,
  renderMobileCard,
}: TableSkeletonProps) {
  // Pre-calculated diverse cell widths for natural table look
  const widthMap = ["w-16", "w-32", "w-24", "w-20", "w-28", "w-16", "w-20"];

  return (
    <div
      aria-busy="true"
      aria-label="Memuat tabel data"
      className="overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs"
    >
      {/* Desktop / Tablet Table Skeleton View */}
      <div className="desktop-only w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
              {Array.from({ length: columnCount }).map((_, colIdx) => (
                <th key={`th-${colIdx}`} className="px-5 py-4">
                  <div
                    className={`shimmer-placeholder h-3.5 rounded-sm ${
                      widthMap[colIdx % widthMap.length]
                    }`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, rowIdx) => (
              <tr
                key={`tr-${rowIdx}`}
                className="border-b border-[var(--color-border)] last:border-b-0"
              >
                {Array.from({ length: columnCount }).map((_, colIdx) => (
                  <td key={`td-${rowIdx}-${colIdx}`} className="px-5 py-4 align-middle">
                    {colIdx === 0 && (
                      <div className="flex items-center gap-3">
                        <div className="shimmer-placeholder h-10 w-10 shrink-0 rounded-md" />
                        <div className="flex flex-col gap-1.5">
                          <div className="shimmer-placeholder h-3.5 w-32 rounded-sm" />
                          <div className="shimmer-placeholder h-2.5 w-20 rounded-sm" />
                        </div>
                      </div>
                    )}
                    {colIdx > 0 && colIdx < columnCount - 1 && (
                      <div
                        className={`shimmer-placeholder h-3.5 rounded-sm ${
                          widthMap[(colIdx + rowIdx) % widthMap.length]
                        }`}
                      />
                    )}
                    {colIdx === columnCount - 1 && (
                      <div className="flex items-center gap-2">
                        <div className="shimmer-placeholder h-7 w-14 rounded-md" />
                        <div className="shimmer-placeholder h-7 w-14 rounded-md" />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Phone Card List Skeleton View */}
      <div className="mobile-only flex flex-col divide-y divide-[var(--color-border)]">
        {Array.from({ length: mobileCardCount }).map((_, idx) =>
          renderMobileCard ? (
            <React.Fragment key={`mobile-card-${idx}`}>{renderMobileCard(idx)}</React.Fragment>
          ) : (
            <div key={`mobile-card-${idx}`} className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="shimmer-placeholder h-10 w-10 shrink-0 rounded-lg" />
                  <div className="flex flex-col gap-1.5">
                    <div className="shimmer-placeholder h-3.5 w-36 rounded-sm" />
                    <div className="shimmer-placeholder h-2.5 w-20 rounded-sm" />
                  </div>
                </div>
                <div className="shimmer-placeholder h-5 w-14 rounded-full" />
              </div>

              {/* 3-Cell Mini Stats Grid Placeholder */}
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-[var(--color-surface-2)] p-2.5">
                <div className="flex flex-col items-center gap-1">
                  <div className="shimmer-placeholder h-2.5 w-10 rounded-xs" />
                  <div className="shimmer-placeholder h-3.5 w-14 rounded-sm" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="shimmer-placeholder h-2.5 w-10 rounded-xs" />
                  <div className="shimmer-placeholder h-3.5 w-14 rounded-sm" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="shimmer-placeholder h-2.5 w-10 rounded-xs" />
                  <div className="shimmer-placeholder h-3.5 w-14 rounded-sm" />
                </div>
              </div>

              {/* Action Buttons Placeholder */}
              <div className="flex gap-2 pt-1">
                <div className="shimmer-placeholder h-8 flex-1 rounded-md" />
                <div className="shimmer-placeholder h-8 flex-1 rounded-md" />
              </div>
            </div>
          ),
        )}
      </div>

      {/* Pagination Footer Skeleton */}
      <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:px-6">
        <div className="shimmer-placeholder h-3.5 w-28 rounded-sm" />
        <div className="flex items-center gap-2">
          <div className="shimmer-placeholder h-8 w-20 rounded-full" />
          <div className="shimmer-placeholder h-8 w-8 rounded-full" />
          <div className="shimmer-placeholder h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}
