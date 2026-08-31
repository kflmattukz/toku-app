/**
 * Toku POS Design Tokens & Standard Component Styles
 * Single source of truth for unified aesthetic, colors, and border radii.
 */

export const RADIUS = {
  xs: "rounded-[6px]",      // Micro badges, tags
  sm: "rounded-[10px]",     // Form inputs, small buttons
  md: "rounded-[14px]",     // Standard cards, table rows, dropdown items
  lg: "rounded-[18px]",     // Large sections, drawers, cards
  xl: "rounded-[24px]",     // Modals, outer containers
  full: "rounded-full",     // Pills, chips, circular icon buttons
} as const;

export const BUTTON = {
  primary:
    "press-tactile py-2.5 px-5 rounded-full bg-[var(--color-brand)] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-primary-500/25 disabled:opacity-50 transition-all",
  secondary:
    "press-tactile py-2.5 px-4 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[var(--color-surface-2)] transition-all",
  danger:
    "press-tactile py-2.5 px-4 rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger-text)] text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-all",
  ghost:
    "press-tactile p-2 rounded-full text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] cursor-pointer transition-all",
  pillSmall:
    "press-tactile py-1.5 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all",
} as const;

export const BADGE = {
  brand:
    "inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-extrabold bg-[var(--color-brand-light)] text-[var(--color-brand)] border border-[var(--color-brand)]",
  success:
    "inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-extrabold bg-[var(--color-success-light)] text-[var(--color-success-text)]",
  danger:
    "inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-extrabold bg-[var(--color-danger-light)] text-[var(--color-danger-text)] border border-[var(--color-danger)]/30",
  warning:
    "inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-extrabold bg-[var(--color-warning-light)] text-[var(--color-warning-text)] border border-[var(--color-warning)]/30",
  neutral:
    "inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-semibold bg-[var(--color-surface-2)] text-[var(--color-text-2)] border border-[var(--color-border)]",
} as const;

export const CARD = {
  base: "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[18px] p-5 shadow-xs",
  interactive:
    "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[18px] p-4 shadow-xs transition-all hover:border-[var(--color-brand)] hover:shadow-md cursor-pointer",
  modal:
    "bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[24px] shadow-xl overflow-hidden",
} as const;

export const INPUT = {
  base: "w-full px-3.5 py-2.5 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all",
  pill: "w-full px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all",
} as const;
