import React from "react";
import { MagnifyingGlassIcon, XIcon, TagIcon } from "@phosphor-icons/react";
import { Select, type SelectOption } from "./Select";

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
  const categoryOptions: SelectOption<string>[] = (categories || []).map((cat) => ({
    value: cat,
    label: cat === "Semua" ? "Semua Kategori" : cat,
    icon: <TagIcon size={14} weight="bold" />,
  }));

  // Ensure "Semua" option is included if not in categories
  if (
    categories &&
    categories.length > 0 &&
    !categoryOptions.some((opt) => opt.value === "Semua")
  ) {
    categoryOptions.unshift({
      value: "Semua",
      label: "Semua Kategori",
      icon: <TagIcon size={14} weight="bold" />,
    });
  }

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

      {/* Category Dropdown Pill */}
      {categories && categories.length > 0 && onCategoryChange && (
        <div className="w-full sm:w-48">
          <Select
            value={selectedCategory || "Semua"}
            onChange={onCategoryChange}
            options={categoryOptions}
            variant="pill"
            size="md"
            placeholder="Pilih Kategori"
          />
        </div>
      )}

      {extraActions && <div className="flex items-center gap-2">{extraActions}</div>}
    </div>
  );
}
