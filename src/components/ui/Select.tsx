import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  CaretDownIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";

// ============================================================================
// Types
// ============================================================================

export type SelectSize = "sm" | "md" | "lg";
export type SelectVariant = "form" | "pill";

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

interface SelectContextValue<T extends string | number = string> {
  value: T | T[] | undefined;
  onValueChange: (val: T) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  size: SelectSize;
  variant: SelectVariant;
  disabled?: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeDescendant: string | null;
  setActiveDescendant: (id: string | null) => void;
  registerItem: (id: string, value: T, text: string, disabled?: boolean) => void;
  unregisterItem: (id: string) => void;
  isMultiple: boolean;
  selectId: string;
}

const SelectContext = createContext<SelectContextValue<any> | null>(null);

function useSelectContext<T extends string | number = string>() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select compound components must be used within a <Select>");
  }
  return context as SelectContextValue<T>;
}

// ============================================================================
// Root Component (Hybrid)
// ============================================================================

export interface SelectProps<T extends string | number = string> {
  value?: T | T[];
  defaultValue?: T | T[];
  onChange?: (value: T) => void;
  onMultiChange?: (values: T[]) => void;
  size?: SelectSize;
  variant?: SelectVariant;
  disabled?: boolean;
  placeholder?: string;
  options?: SelectOption<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  multiple?: boolean;
  className?: string;
  children?: ReactNode;
  name?: string;
}

export function Select<T extends string | number = string>({
  value: controlledValue,
  defaultValue,
  onChange,
  onMultiChange,
  size = "md",
  variant = "form",
  disabled = false,
  placeholder = "Pilih...",
  options,
  searchable = false,
  searchPlaceholder = "Cari opsi...",
  multiple = false,
  className = "",
  children,
}: SelectProps<T>) {
  const selectId = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState<T | T[] | undefined>(
    defaultValue ?? (multiple ? [] : undefined),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDescendant, setActiveDescendant] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const itemsRef = useRef<Map<string, { value: T; text: string; disabled?: boolean }>>(
    new Map(),
  );

  const registerItem = useCallback(
    (id: string, val: T, text: string, isDisabled?: boolean) => {
      itemsRef.current.set(id, { value: val, text, disabled: isDisabled });
    },
    [],
  );

  const unregisterItem = useCallback((id: string) => {
    itemsRef.current.delete(id);
  }, []);

  const isControlled = controlledValue !== undefined;
  const rawValue = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = useCallback(
    (itemVal: T) => {
      if (multiple) {
        const currentArr = Array.isArray(rawValue) ? [...rawValue] : [];
        const existsIndex = currentArr.indexOf(itemVal);
        let updated: T[];
        if (existsIndex >= 0) {
          updated = currentArr.filter((_, idx) => idx !== existsIndex);
        } else {
          updated = [...currentArr, itemVal];
        }
        if (!isControlled) {
          setUncontrolledValue(updated);
        }
        onMultiChange?.(updated);
      } else {
        if (!isControlled) {
          setUncontrolledValue(itemVal);
        }
        onChange?.(itemVal);
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    },
    [multiple, rawValue, isControlled, onMultiChange, onChange],
  );

  const toggleOpen = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
      setSearchQuery("");
    }
  }, [disabled]);

  const contextValue: SelectContextValue<T> = {
    value: rawValue,
    onValueChange: handleValueChange,
    isOpen,
    setIsOpen,
    toggleOpen,
    size,
    variant,
    disabled,
    triggerRef,
    searchQuery,
    setSearchQuery,
    activeDescendant,
    setActiveDescendant,
    registerItem,
    unregisterItem,
    isMultiple: multiple,
    selectId,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div className={`relative inline-block w-full text-left ${className}`}>
        {/* Shorthand rendering if options prop is supplied */}
        {options ? (
          <>
            <SelectTrigger placeholder={placeholder}>
              <SelectValue placeholder={placeholder}>
                {(() => {
                  if (multiple && Array.isArray(rawValue)) {
                    if (rawValue.length === 0) return null;
                    return (
                      <div className="flex flex-wrap items-center gap-1">
                        {rawValue.map((val) => {
                          const matched = options.find((o) => o.value === val);
                          return (
                            <span
                              key={String(val)}
                              className="inline-flex items-center gap-1 rounded-md bg-[var(--color-brand-light)] px-2 py-0.5 text-xs font-bold text-[var(--color-brand-dark)]"
                            >
                              {matched?.label ?? String(val)}
                            </span>
                          );
                        })}
                      </div>
                    );
                  }
                  const matched = options.find((o) => o.value === rawValue);
                  if (!matched) return null;
                  return (
                    <div className="flex items-center gap-2 truncate">
                      {matched.icon && <span className="shrink-0">{matched.icon}</span>}
                      <span className="truncate">{matched.label}</span>
                      {matched.badge && <span className="ml-auto shrink-0">{matched.badge}</span>}
                    </div>
                  );
                })()}
              </SelectValue>
            </SelectTrigger>

            <SelectContent>
              {searchable && <SelectSearchInput placeholder={searchPlaceholder} />}
              {options
                .filter((opt) => {
                  if (!searchQuery.trim()) return true;
                  const labelStr = typeof opt.label === "string" ? opt.label : String(opt.value);
                  const descStr = typeof opt.description === "string" ? opt.description : "";
                  return (
                    labelStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    descStr.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                })
                .map((opt) => (
                  <SelectItem
                    key={String(opt.value)}
                    value={opt.value}
                    disabled={opt.disabled}
                    icon={opt.icon}
                    badge={opt.badge}
                    description={opt.description}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </>
        ) : (
          children
        )}
      </div>
    </SelectContext.Provider>
  );
}

// ============================================================================
// SelectTrigger Component
// ============================================================================

export interface SelectTriggerProps {
  placeholder?: string;
  className?: string;
  children?: ReactNode;
  id?: string;
}

export function SelectTrigger({
  placeholder,
  className = "",
  children,
  id,
}: SelectTriggerProps) {
  const {
    isOpen,
    toggleOpen,
    size,
    variant,
    disabled,
    triggerRef,
    selectId,
    activeDescendant,
  } = useSelectContext();

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs font-semibold min-h-[30px] gap-1.5",
    md: "px-3.5 py-2.5 text-xs font-semibold min-h-[42px] gap-2",
    lg: "px-4 py-3 text-sm font-semibold min-h-[48px] gap-2.5",
  }[size];

  const variantClasses = {
    form: "rounded-xl",
    pill: "rounded-full",
  }[variant];

  return (
    <button
      ref={triggerRef}
      id={id || `${selectId}-trigger`}
      type="button"
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls={`${selectId}-listbox`}
      aria-activedescendant={activeDescendant || undefined}
      disabled={disabled}
      onClick={toggleOpen}
      className={`group flex w-full cursor-pointer items-center justify-between border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] transition-all select-none hover:border-[var(--color-brand)] focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses} ${variantClasses} ${
        isOpen ? "border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/20" : ""
      } ${className}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 text-left">
        {children || (
          <span className="truncate text-[var(--color-text-3)]">{placeholder}</span>
        )}
      </div>
      <CaretDownIcon
        size={size === "sm" ? 13 : 16}
        weight="bold"
        className={`shrink-0 text-[var(--color-text-3)] transition-transform duration-200 group-hover:text-[var(--color-text)] ${
          isOpen ? "rotate-180 text-[var(--color-brand)]" : ""
        }`}
      />
    </button>
  );
}

// ============================================================================
// SelectValue Component
// ============================================================================

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
  children?: ReactNode;
}

export function SelectValue({
  placeholder = "Pilih...",
  className = "",
  children,
}: SelectValueProps) {
  const { value, isMultiple } = useSelectContext();

  const isEmpty =
    value === undefined ||
    value === null ||
    value === "" ||
    (isMultiple && Array.isArray(value) && value.length === 0);

  return (
    <div className={`min-w-0 flex-1 truncate ${className}`}>
      {children ? (
        children
      ) : isEmpty ? (
        <span className="text-[var(--color-text-3)]">{placeholder}</span>
      ) : (
        <span className="font-semibold text-[var(--color-text)]">{String(value)}</span>
      )}
    </div>
  );
}

// ============================================================================
// SelectContent Component (Portaled with collision detection)
// ============================================================================

export interface SelectContentProps {
  className?: string;
  children?: ReactNode;
  maxHeight?: number;
}

export function SelectContent({
  className = "",
  children,
  maxHeight = 280,
}: SelectContentProps) {
  const {
    isOpen,
    setIsOpen,
    triggerRef,
    selectId,
    activeDescendant,
    setActiveDescendant,
    onValueChange,
  } = useSelectContext();

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUpwards: boolean;
  } | null>(null);

  // Calculate dynamic floating position
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpwards = spaceBelow < maxHeight && spaceAbove > spaceBelow;

    setCoords({
      top: openUpwards ? rect.top - 6 : rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 160),
      openUpwards,
    });
  }, [triggerRef, maxHeight]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      return () => {
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    }
  }, [isOpen, updatePosition]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        contentRef.current &&
        !contentRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, setIsOpen, triggerRef]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!contentRef.current) return;

      const items = Array.from(
        contentRef.current.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])'),
      );
      if (items.length === 0) return;

      const currentIndex = items.findIndex((el) => el.id === activeDescendant);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        const target = items[nextIndex];
        setActiveDescendant(target.id);
        target.scrollIntoView({ block: "nearest" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        const target = items[prevIndex];
        setActiveDescendant(target.id);
        target.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Home") {
        e.preventDefault();
        const target = items[0];
        setActiveDescendant(target.id);
        target.scrollIntoView({ block: "nearest" });
      } else if (e.key === "End") {
        e.preventDefault();
        const target = items[items.length - 1];
        setActiveDescendant(target.id);
        target.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" || e.key === " ") {
        if (activeDescendant) {
          e.preventDefault();
          const activeEl = document.getElementById(activeDescendant);
          if (activeEl) {
            activeEl.click();
          }
        }
      } else if (e.key === "Escape" || e.key === "Tab") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeDescendant, setActiveDescendant, setIsOpen, triggerRef, onValueChange]);

  if (!isOpen || !coords) return null;

  return createPortal(
    <div
      ref={contentRef}
      id={`${selectId}-listbox`}
      role="listbox"
      tabIndex={-1}
      style={{
        position: "fixed",
        top: coords.openUpwards ? "auto" : `${coords.top}px`,
        bottom: coords.openUpwards ? `${window.innerHeight - coords.top}px` : "auto",
        left: `${coords.left}px`,
        minWidth: `${coords.width}px`,
        maxWidth: "min(92vw, 420px)",
        maxHeight: `${maxHeight}px`,
        zIndex: 99999,
      }}
      className={`animate-in fade-in-0 zoom-in-95 flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-2xl transition-all duration-150 ${className}`}
    >
      <div className="flex-1 overflow-y-auto overscroll-contain pr-1 custom-scrollbar">
        {children}
      </div>
    </div>,
    document.body,
  );
}

// ============================================================================
// SelectSearchInput Component
// ============================================================================

export interface SelectSearchInputProps {
  placeholder?: string;
  className?: string;
}

export function SelectSearchInput({
  placeholder = "Cari opsi...",
  className = "",
}: SelectSearchInputProps) {
  const { searchQuery, setSearchQuery } = useSelectContext();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Focus search input automatically when popup opens
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`relative mb-1.5 px-1 ${className}`}>
      <div className="relative flex items-center">
        <MagnifyingGlassIcon
          size={14}
          className="pointer-events-none absolute left-2.5 text-[var(--color-text-3)]"
        />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] py-1.5 pr-8 pl-8 text-xs font-semibold text-[var(--color-text)] placeholder:text-[var(--color-text-3)] focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]/30 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 cursor-pointer p-0.5 text-[var(--color-text-3)] hover:text-[var(--color-text)]"
          >
            <XIcon size={12} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SelectItem Component
// ============================================================================

export interface SelectItemProps<T extends string | number = string> {
  value: T;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function SelectItem<T extends string | number = string>({
  value: itemValue,
  disabled = false,
  icon,
  badge,
  description,
  className = "",
  children,
}: SelectItemProps<T>) {
  const {
    value: selectedValue,
    onValueChange,
    activeDescendant,
    setActiveDescendant,
    registerItem,
    unregisterItem,
    isMultiple,
    selectId,
  } = useSelectContext<T>();

  const itemId = `${selectId}-item-${String(itemValue)}`;

  const isSelected = isMultiple
    ? Array.isArray(selectedValue) && selectedValue.includes(itemValue)
    : selectedValue === itemValue;

  const isHighlighted = activeDescendant === itemId;

  // Extract text representation for keyboard jump
  const textContent =
    typeof children === "string"
      ? children
      : typeof children === "number"
        ? String(children)
        : String(itemValue);

  useEffect(() => {
    registerItem(itemId, itemValue, textContent, disabled);
    return () => unregisterItem(itemId);
  }, [itemId, itemValue, textContent, disabled, registerItem, unregisterItem]);

  return (
    <div
      id={itemId}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      tabIndex={-1}
      onClick={() => {
        if (!disabled) {
          onValueChange(itemValue);
        }
      }}
      onMouseEnter={() => {
        if (!disabled) {
          setActiveDescendant(itemId);
        }
      }}
      className={`group relative flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all select-none ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : isSelected
            ? "bg-[var(--color-brand-light)] font-bold text-[var(--color-brand-dark)]"
            : isHighlighted
              ? "bg-[var(--color-surface-2)] text-[var(--color-text)]"
              : "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
      } ${className}`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        {icon && (
          <span
            className={`mt-0.5 shrink-0 text-sm ${
              isSelected ? "text-[var(--color-brand)]" : "text-[var(--color-text-3)] group-hover:text-[var(--color-text)]"
            }`}
          >
            {icon}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 truncate">
            <span className="truncate">{children}</span>
            {badge && <span className="shrink-0">{badge}</span>}
          </div>
          {description && (
            <p
              className={`mt-0.5 text-[11px] font-normal leading-tight line-clamp-1 ${
                isSelected ? "text-[var(--color-brand)]/80" : "text-[var(--color-text-3)]"
              }`}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {isSelected && (
        <CheckIcon
          size={15}
          weight="bold"
          className="ml-2 shrink-0 text-[var(--color-brand)]"
        />
      )}
    </div>
  );
}

// ============================================================================
// SelectGroup & SelectLabel & SelectSeparator Components
// ============================================================================

export interface SelectGroupProps {
  label?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function SelectGroup({ label, className = "", children }: SelectGroupProps) {
  return (
    <div role="group" className={`py-1 ${className}`}>
      {label && <SelectLabel>{label}</SelectLabel>}
      {children}
    </div>
  );
}

export interface SelectLabelProps {
  className?: string;
  children: ReactNode;
}

export function SelectLabel({ className = "", children }: SelectLabelProps) {
  return (
    <div
      className={`px-3 py-1 text-[10px] font-extrabold tracking-wider text-[var(--color-text-3)] uppercase ${className}`}
    >
      {children}
    </div>
  );
}

export function SelectSeparator({ className = "" }: { className?: string }) {
  return (
    <div
      className={`my-1 -mx-1 h-px bg-[var(--color-border-subtle)] ${className}`}
    />
  );
}

// ============================================================================
// Attach Compound Sub-Components to Select
// ============================================================================

Select.Trigger = SelectTrigger;
Select.Value = SelectValue;
Select.Content = SelectContent;
Select.Item = SelectItem;
Select.Group = SelectGroup;
Select.Label = SelectLabel;
Select.Separator = SelectSeparator;
Select.SearchInput = SelectSearchInput;
