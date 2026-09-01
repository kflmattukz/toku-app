import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { CircleNotchIcon } from "@phosphor-icons/react";

// ============================================================================
// Types
// ============================================================================

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "danger-subtle"
  | "outline"
  | "ghost"
  | "brand-subtle";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ButtonShape = "pill" | "rounded";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  loading?: boolean;
  isLoading?: boolean;
  loadingText?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
  className?: string;
}

// ============================================================================
// Style Maps
// ============================================================================

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-brand)] text-white shadow-md shadow-[var(--color-brand)]/25 hover:bg-[var(--color-brand-dark)] focus-visible:ring-[var(--color-brand)]/40 active:brightness-95",
  secondary:
    "border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface-3)] focus-visible:ring-[var(--color-brand)]/30 active:bg-[var(--color-border-subtle)]",
  danger:
    "bg-rose-600 text-white shadow-md shadow-rose-500/25 hover:bg-rose-700 focus-visible:ring-rose-500/40 active:brightness-95",
  "danger-subtle":
    "border border-rose-500/20 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 focus-visible:ring-rose-500/30",
  outline:
    "border border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-brand)] focus-visible:ring-[var(--color-brand)]/30",
  ghost:
    "bg-transparent text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] focus-visible:ring-[var(--color-brand)]/30",
  "brand-subtle":
    "bg-[var(--color-brand-light)] text-[var(--color-brand)] hover:bg-[var(--color-brand-light)]/80 focus-visible:ring-[var(--color-brand)]/30 font-bold",
};

const SIZE_STYLES: Record<ButtonSize, { base: string; iconSize: number }> = {
  xs: { base: "min-h-[28px] px-2.5 py-1 text-[11px] font-bold gap-1.5", iconSize: 13 },
  sm: { base: "min-h-[34px] px-3 py-1.5 text-xs font-bold gap-1.5", iconSize: 15 },
  md: { base: "min-h-[42px] px-4 py-2.5 text-xs font-extrabold gap-2", iconSize: 16 },
  lg: { base: "min-h-[48px] px-5 py-3 text-sm font-extrabold gap-2.5", iconSize: 18 },
  xl: { base: "min-h-[54px] px-6 py-3.5 text-base font-black gap-3", iconSize: 20 },
};

const SHAPE_STYLES: Record<ButtonShape, string> = {
  pill: "rounded-full",
  rounded: "rounded-xl",
};

// ============================================================================
// Button Component
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      shape = "pill",
      loading = false,
      isLoading,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      type = "button",
      children,
      className = "",
      ...props
    },
    ref,
  ) => {
    const isBusy = loading || isLoading;
    const isDisabled = disabled || isBusy;

    const sizeConfig = SIZE_STYLES[size] || SIZE_STYLES.md;
    const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
    const shapeClass = SHAPE_STYLES[shape] || SHAPE_STYLES.pill;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isBusy}
        aria-disabled={isDisabled}
        className={`press-tactile group relative inline-flex items-center justify-center font-sans tracking-tight whitespace-nowrap transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
          fullWidth ? "w-full flex-1" : "shrink-0"
        } ${sizeConfig.base} ${variantClass} ${shapeClass} ${className}`}
        {...props}
      >
        {/* Loading Spinner or Left Icon */}
        {isBusy ? (
          <CircleNotchIcon
            size={sizeConfig.iconSize}
            className="shrink-0 animate-spin"
            weight="bold"
          />
        ) : leftIcon ? (
          <span className="inline-flex shrink-0 items-center">{leftIcon}</span>
        ) : null}

        {/* Button Content / Label */}
        {isBusy && loadingText ? (
          <span className="min-w-0 truncate">{loadingText}</span>
        ) : children ? (
          <span className="min-w-0 truncate">{children}</span>
        ) : null}

        {/* Right Icon */}
        {!isBusy && rightIcon && (
          <span className="inline-flex shrink-0 items-center">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
