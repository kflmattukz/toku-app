import { useEffect, useRef } from "react";
import { MagnifyingGlassIcon, XCircleIcon } from "@phosphor-icons/react";
import { cn } from "#/lib/utils";

interface StorefrontSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  totalProductsCount: number;
}

export function StorefrontSearchBar({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  totalProductsCount,
}: StorefrontSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input on '/' shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-3">
      {/* Search Input Bar */}
      <div className="relative">
        <MagnifyingGlassIcon
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-3)] pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          role="searchbox"
          aria-label="Cari produk atau kategori"
          placeholder="Cari produk... (tekan '/' untuk cari)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 transition-all placeholder:text-[var(--color-text-3)] text-[var(--color-text)]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              inputRef.current?.focus();
            }}
            aria-label="Hapus pencarian"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-colors p-1"
          >
            <XCircleIcon size={18} weight="fill" />
          </button>
        )}
      </div>

      {/* Categories chips */}
      {categories.length > 0 && (
        <div
          role="tablist"
          aria-label="Kategori produk"
          className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === "all"}
            onClick={() => onSelectCategory("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all press-tactile",
              selectedCategory === "all"
                ? "bg-[var(--color-brand)] text-white shadow-xs"
                : "bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)] border border-[var(--color-border)]",
            )}
          >
            Semua ({totalProductsCount})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => onSelectCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all press-tactile",
                selectedCategory === cat
                  ? "bg-[var(--color-brand)] text-white shadow-xs"
                  : "bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)] border border-[var(--color-border)]",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
