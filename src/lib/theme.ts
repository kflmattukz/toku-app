/**
 * Toku POS Design Tokens & Standard Component Styles
 * Single source of truth for unified aesthetic, colors, and border radii.
 */

export const RADIUS = {
  xs: "rounded-xs", // Micro badges, tags (6px)
  sm: "rounded-sm", // Form inputs, small buttons (10px)
  md: "rounded-md", // Standard cards, table rows, dropdown items (14px)
  lg: "rounded-lg", // Large sections, drawers, cards (18px)
  xl: "rounded-xl", // Modals, outer containers (24px)
  full: "rounded-full", // Pills, chips, circular icon buttons
} as const;

export const BUTTON = {
  primary:
    "press-tactile py-2.5 px-5 rounded-full bg-brand text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-brand/25 disabled:opacity-50 transition-all",
  secondary:
    "press-tactile py-2.5 px-4 rounded-full border border-border bg-surface text-text text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-surface-2 transition-all",
  danger:
    "press-tactile py-2.5 px-4 rounded-full border border-danger/30 bg-danger-light text-danger-text text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-all",
  ghost:
    "press-tactile p-2 rounded-full text-text-2 hover:text-text hover:bg-surface-2 cursor-pointer transition-all",
  pillSmall:
    "press-tactile py-1.5 px-3 rounded-full text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all",
} as const;

export const BADGE = {
  brand:
    "inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-extrabold bg-brand-light text-brand border border-brand",
  success:
    "inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-extrabold bg-success-light text-success-text",
  danger:
    "inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-extrabold bg-danger-light text-danger-text border border-danger/30",
  warning:
    "inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-extrabold bg-warning-light text-warning-text border border-warning/30",
  neutral:
    "inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-semibold bg-surface-2 text-text-2 border border-border",
} as const;

export const CARD = {
  base: "bg-surface border border-border rounded-lg p-5 shadow-xs",
  interactive:
    "bg-surface border border-border rounded-lg p-4 shadow-xs transition-all hover:border-brand hover:shadow-md cursor-pointer",
  modal: "bg-surface border border-border rounded-xl shadow-xl overflow-hidden",
} as const;

export const INPUT = {
  base: "w-full px-3.5 py-2.5 rounded-sm border border-border bg-surface text-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all",
  pill: "w-full px-4 py-2.5 rounded-full border border-border bg-surface text-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all",
} as const;
