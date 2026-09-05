import {
  MagnifyingGlassIcon,
  XIcon,
  FireIcon,
  PackageIcon,
  BarcodeIcon,
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
  onOpenScanner?: () => void;
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
  onOpenScanner,
}: ProductCatalogGridProps) {
  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q);
    const matchBarcode = p.barcode ? p.barcode.toLowerCase().includes(q) : false;
    const matchCat = categoryFilter === "Semua" || p.category === categoryFilter;
    return (matchSearch || matchBarcode) && matchCat;
  });

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {/* Search & Category Header */}
      <div className="mb-5">
        {/* Pill Search Input with filter icon, scan button and clear X button */}
        <div className="relative mb-4 w-full">
          <MagnifyingGlassIcon
            size={18}
            weight="bold"
            className="pointer-events-none absolute top-1/2 left-4.5 -translate-y-1/2 text-[var(--color-text-3)]"
          />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, kategori, atau barcode..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pill-search-input w-full pl-12"
            style={{
              paddingRight: onOpenScanner ? (search ? 120 : 84) : search ? 82 : 48,
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Hapus pencarian"
              className="press-tactile absolute top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] p-0 text-[var(--color-text-3)] hover:text-[var(--color-text)]"
              style={{ right: onOpenScanner ? 86 : 14 }}
            >
              <XIcon size={12} weight="bold" />
            </button>
          )}
          {onOpenScanner && (
            <button
              type="button"
              onClick={onOpenScanner}
              title="Buka Scanner Barcode Kamera"
              className="press-tactile absolute top-1/2 right-2 flex h-8 -translate-y-1/2 cursor-pointer items-center gap-1.5 rounded-full bg-[var(--color-brand)] px-3 text-xs font-extrabold text-white shadow-xs transition-all hover:opacity-90 active:scale-95"
            >
              <BarcodeIcon size={16} weight="bold" />
              <span className="hidden sm:inline">Scan</span>
            </button>
          )}
        </div>

        {/* Category Navigation Pills */}
        <div
          className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1"
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
                className={`press-tactile flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-5 py-2.5 text-xs whitespace-nowrap transition-all ${
                  active
                    ? "shadow-primary-500/20 border-[var(--color-brand)] bg-[var(--color-brand)] font-extrabold text-white shadow-md"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] font-semibold text-[var(--color-text-2)] shadow-xs"
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
      <div className="grid flex-1 grid-cols-2 content-start gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-16 text-center text-[var(--color-text-3)]">
            <PackageIcon size={52} className="mb-3 opacity-30" />
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
