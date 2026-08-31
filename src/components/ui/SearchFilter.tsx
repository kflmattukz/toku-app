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
    <div className={`flex flex-col items-stretch gap-3 sm:flex-row sm:items-center ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex-1">
        <MagnifyingGlassIcon
          size={18}
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--color-text-3)]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pr-10 pl-10 text-xs font-semibold text-[var(--color-text)] transition-all placeholder:text-[var(--color-text-3)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full p-1 text-[var(--color-text-3)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
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
            className="cursor-pointer rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-xs font-semibold text-[var(--color-text)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:outline-none"
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
