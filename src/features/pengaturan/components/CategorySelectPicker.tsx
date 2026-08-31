import { useState, useRef, useEffect } from "react";
import { Modal } from "#/components/Modal";
import {
  MagnifyingGlassIcon,
  CaretDownIcon,
  CheckCircleIcon,
  StorefrontIcon,
} from "@phosphor-icons/react";
import { UMKM_CATEGORIES } from "../constants";

interface CategorySelectPickerProps {
  value: string;
  onChange: (val: string) => void;
}

export function CategorySelectPicker({ value, onChange }: CategorySelectPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activeCategory = UMKM_CATEGORIES.find((c) => c.value === value) || UMKM_CATEGORIES[0];
  const ActiveIcon = activeCategory.icon;

  const filtered = UMKM_CATEGORIES.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isMobile && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isMobile]);

  const renderCategoryList = () => (
    <div className="flex max-h-[320px] flex-col gap-1.5 overflow-y-auto pr-1">
      {filtered.length > 0 ? (
        filtered.map((cat) => {
          const Icon = cat.icon;
          const isSelected = cat.value === value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                onChange(cat.value);
                setIsOpen(false);
                setSearch("");
              }}
              className={`press-tactile flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border p-2.5 text-left transition-all ${
                isSelected
                  ? "border-[var(--color-brand)] bg-[var(--color-brand-light)]"
                  : "border-transparent bg-transparent hover:bg-[var(--color-surface-2)]"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    isSelected
                      ? "bg-[var(--color-brand)] text-white"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-2)]"
                  }`}
                >
                  <Icon size={20} weight={isSelected ? "bold" : "regular"} />
                </div>
                <div className="min-w-0">
                  <div
                    className={`truncate text-xs ${
                      isSelected
                        ? "font-extrabold text-[var(--color-brand)]"
                        : "font-bold text-[var(--color-text)]"
                    }`}
                  >
                    {cat.label}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-[var(--color-text-3)]">
                    {cat.desc}
                  </div>
                </div>
              </div>

              {isSelected && (
                <CheckCircleIcon
                  size={20}
                  weight="fill"
                  className="shrink-0 text-[var(--color-brand)]"
                />
              )}
            </button>
          );
        })
      ) : (
        <div className="px-4 py-6 text-center text-xs text-[var(--color-text-3)]">
          Kategori tidak ditemukan.
        </div>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`press-tactile flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border bg-[var(--color-surface)] px-3.5 py-2.5 text-left transition-all ${
          isOpen
            ? "ring-primary-500/20 border-[var(--color-brand)] ring-2"
            : "border-[var(--color-border)]"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)]">
            <ActiveIcon size={20} weight="bold" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold text-[var(--color-text)]">
              {activeCategory.label}
            </div>
            <div className="truncate text-xs text-[var(--color-text-3)]">{activeCategory.desc}</div>
          </div>
        </div>

        <div
          className={`flex shrink-0 items-center text-[var(--color-text-3)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <CaretDownIcon size={18} weight="bold" />
        </div>
      </button>

      {/* Floating Popover on Desktop / Tablet */}
      {isOpen && !isMobile && (
        <div className="animate-fadeIn absolute top-[calc(100%+8px)] right-0 left-0 z-50 flex max-h-[380px] flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-xl">
          {/* Search filter */}
          <div className="relative mb-2 flex items-center">
            <MagnifyingGlassIcon
              size={16}
              weight="bold"
              className="pointer-events-none absolute left-3 text-[var(--color-text-3)]"
            />
            <input
              type="text"
              autoFocus
              placeholder="Cari kategori UMKM (bengkel, sembako, laundry...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="focus:ring-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] py-2 pr-3 pl-9 text-xs text-[var(--color-text)] outline-none focus:ring-1"
            />
          </div>

          {renderCategoryList()}
        </div>
      )}

      {/* Responsive Modal on Mobile */}
      {isOpen && isMobile && (
        <Modal onClose={() => setIsOpen(false)} maxWidth={440}>
          <div>
            <div className="mb-4 flex items-center gap-2">
              <StorefrontIcon size={22} weight="bold" className="text-[var(--color-brand)]" />
              <h3 className="m-0 text-base font-extrabold text-[var(--color-text)]">
                Pilih Kategori Usaha UMKM
              </h3>
            </div>

            <div className="relative mb-3 flex items-center">
              <MagnifyingGlassIcon
                size={16}
                weight="bold"
                className="pointer-events-none absolute left-3 text-[var(--color-text-3)]"
              />
              <input
                type="text"
                autoFocus
                placeholder="Cari kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] py-2 pr-3 pl-9 text-xs text-[var(--color-text)] outline-none"
              />
            </div>

            {renderCategoryList()}
          </div>
        </Modal>
      )}
    </div>
  );
}
