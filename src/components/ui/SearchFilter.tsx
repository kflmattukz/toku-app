import React from "react";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";

interface SearchFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  placeholder?: string;
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  className?: string;
  extraActions?: React.ReactNode;
}

export function SearchFilter({
  search,
  onSearchChange,
  placeholder = "Cari...",
  categories,
  selectedCategory,
  onCategoryChange,
  className = "",
  extraActions,
}: SearchFilterProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex-1">
        <MagnifyingGlassIcon
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-3)] pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-3)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)] transition-all"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-3)] hover:text-[var(--color-text)] rounded-full hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
            title="Hapus pencarian"
          >
            <XIcon size={14} weight="bold" />
          </button>
        )}
      </div>

      {/* Optional Category Dropdown or Pills */}
      {categories && categories.length > 0 && onCategoryChange && (
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory || "Semua"}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3.5 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)] cursor-pointer"
          >
            <option value="Semua">Semua Kategori</option>
            {categories
              .filter((cat) => cat !== "Semua")
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
        </div>
      )}

      {extraActions && <div className="flex items-center gap-2">{extraActions}</div>}
    </div>
  );
}
