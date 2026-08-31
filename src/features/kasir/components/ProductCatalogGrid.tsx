import {
  MagnifyingGlassIcon,
  XIcon,
  FadersIcon,
  FireIcon,
  PackageIcon,
} from "@phosphor-icons/react";
import { KasirProductCard } from "./KasirProductCard";
import type { CartItem, Product } from "../types";

interface ProductCatalogGridProps {
  products: Product[];
  categories: string[];
  search: string;
  onSearchChange: (search: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQty: (productId: string, delta: number) => void;
}

export function ProductCatalogGrid({
  products,
  categories,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  cart,
  onAddToCart,
  onUpdateQty,
}: ProductCatalogGridProps) {
  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "Semua" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Search & Category Header */}
      <div className="mb-5">
        {/* Pill Search Input with filter icon and clear X button */}
        <div className="relative w-full mb-4">
          <MagnifyingGlassIcon
            size={18}
            weight="bold"
            className="absolute left-4.5 top-1/2 -translate-y-1/2 text-[var(--color-text-3)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau kategori..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pill-search-input w-full pl-12"
            style={{ paddingRight: search ? 82 : 48 }}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Hapus pencarian"
              className="press-tactile absolute right-11.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-3)] flex items-center justify-center cursor-pointer p-0 hover:text-[var(--color-text)]"
            >
              <XIcon size={12} weight="bold" />
            </button>
          )}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center shadow-xs">
            <FadersIcon size={16} weight="bold" />
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div
          className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {categories.map((cat) => {
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryFilterChange(cat)}
                className={`press-tactile py-2.5 px-5 rounded-full text-xs cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all border ${
                  active
                    ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white font-extrabold shadow-md shadow-primary-500/20"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] font-semibold shadow-xs"
                }`}
              >
                {cat === "Semua" && (
                  <FireIcon
                    size={16}
                    weight="fill"
                    color={active ? "#ffffff" : "var(--color-brand)"}
                  />
                )}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start">
        {filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-16 px-4 text-[var(--color-text-3)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
            <PackageIcon size={52} className="opacity-30 mb-3" />
            <p className="m-0 text-sm font-semibold">
              Tidak ada produk{search ? ` untuk "${search}"` : ""}
            </p>
          </div>
        ) : (
          filtered.map((product) => {
            const inCart = cart.find((i) => i.productId === product._id);
            return (
              <KasirProductCard
                key={product._id}
                product={product}
                inCart={inCart}
                onAddToCart={onAddToCart}
                onUpdateQty={onUpdateQty}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
