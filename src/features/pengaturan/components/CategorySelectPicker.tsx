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

  const activeCategory =
    UMKM_CATEGORIES.find((c) => c.value === value) || UMKM_CATEGORIES[0];
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
    <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-1">
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
              className={`press-tactile w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
                isSelected
                  ? "bg-[var(--color-brand-light)] border-[var(--color-brand)]"
                  : "bg-transparent border-transparent hover:bg-[var(--color-surface-2)]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-[var(--color-brand)] text-white"
                      : "bg-[var(--color-surface-2)] text-[var(--color-text-2)]"
                  }`}
                >
                  <Icon size={20} weight={isSelected ? "bold" : "regular"} />
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-xs truncate ${
                      isSelected
                        ? "font-extrabold text-[var(--color-brand)]"
                        : "font-bold text-[var(--color-text)]"
                    }`}
                  >
                    {cat.label}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-3)] truncate mt-0.5">
                    {cat.desc}
                  </div>
                </div>
              </div>

              {isSelected && (
                <CheckCircleIcon
                  size={20}
                  weight="fill"
                  className="text-[var(--color-brand)] shrink-0"
                />
              )}
            </button>
          );
        })
      ) : (
        <div className="py-6 px-4 text-center text-xs text-[var(--color-text-3)]">
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
        className={`press-tactile w-full py-2.5 px-3.5 rounded-xl border bg-[var(--color-surface)] flex items-center justify-between gap-3 cursor-pointer text-left transition-all ${
          isOpen
            ? "border-[var(--color-brand)] ring-2 ring-primary-500/20"
            : "border-[var(--color-border)]"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)] flex items-center justify-center shrink-0">
            <ActiveIcon size={20} weight="bold" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-[var(--color-text)] truncate">
              {activeCategory.label}
            </div>
            <div className="text-xs text-[var(--color-text-3)] truncate">
              {activeCategory.desc}
            </div>
          </div>
        </div>

        <div
          className={`text-[var(--color-text-3)] flex items-center shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <CaretDownIcon size={18} weight="bold" />
        </div>
      </button>

      {/* Floating Popover on Desktop / Tablet */}
      {isOpen && !isMobile && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl p-3 max-h-[380px] flex flex-col animate-fadeIn">
          {/* Search filter */}
          <div className="relative mb-2 flex items-center">
            <MagnifyingGlassIcon
              size={16}
              weight="bold"
              className="absolute left-3 text-[var(--color-text-3)] pointer-events-none"
            />
            <input
              type="text"
              autoFocus
              placeholder="Cari kategori UMKM (bengkel, sembako, laundry...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-text)] outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {renderCategoryList()}
        </div>
      )}

      {/* Responsive Modal on Mobile */}
      {isOpen && isMobile && (
        <Modal onClose={() => setIsOpen(false)} maxWidth={440}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <StorefrontIcon size={22} weight="bold" className="text-[var(--color-brand)]" />
              <h3 className="text-base font-extrabold text-[var(--color-text)] m-0">
                Pilih Kategori Usaha UMKM
              </h3>
            </div>

            <div className="relative mb-3 flex items-center">
              <MagnifyingGlassIcon
                size={16}
                weight="bold"
                className="absolute left-3 text-[var(--color-text-3)] pointer-events-none"
              />
              <input
                type="text"
                autoFocus
                placeholder="Cari kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-text)] outline-none"
              />
            </div>

            {renderCategoryList()}
          </div>
        </Modal>
      )}
    </div>
  );
}
