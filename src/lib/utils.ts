import { cx } from "class-variance-authority";
import type { ClassValue } from "class-variance-authority/types";
import { twMerge } from "tailwind-merge";

/**
 * Merge multiple class names conditionally using class-variance-authority and tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(cx(inputs));
}

export type { ClassValue };

const idrCurrencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const idrNumberFormatter = new Intl.NumberFormat("id-ID");

/** Format a number as IDR currency: Rp 15.000 */
export function formatIDR(amount: number): string {
  return idrCurrencyFormatter.format(amount);
}

/** Format input string or number with IDR thousand separators: "15000" -> "15.000" */
export function formatIDRInput(value: string | number): string {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  return idrNumberFormatter.format(Number(digits));
}

/** Parse formatted IDR input string back to pure number: "15.000" -> 15000 */
export function parseIDRInput(value: string | number): number {
  const digits = String(value).replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export type DiscountType = "percentage" | "nominal";

/** Calculate net item price and discount amount for a single product */
export function calculateItemDiscount(
  price: number,
  discountType?: DiscountType | string,
  discountValue?: number,
): {
  unitPrice: number;
  discountAmount: number;
  hasDiscount: boolean;
  discountLabel: string;
} {
  if (!discountType || !discountValue || discountValue <= 0) {
    return {
      unitPrice: price,
      discountAmount: 0,
      hasDiscount: false,
      discountLabel: "",
    };
  }

  let discountAmount = 0;
  let discountLabel = "";

  if (discountType === "percentage") {
    const pct = Math.min(100, Math.max(0, discountValue));
    discountAmount = Math.round((price * pct) / 100);
    discountLabel = `${pct}%`;
  } else if (discountType === "nominal") {
    discountAmount = Math.min(price, Math.max(0, discountValue));
    discountLabel = formatIDR(discountAmount);
  }

  const unitPrice = Math.max(0, price - discountAmount);
  return {
    unitPrice,
    discountAmount,
    hasDiscount: discountAmount > 0,
    discountLabel,
  };
}

/** Calculate cart subtotals, item savings, basket-level discount, and final total */
export function calculateCartTotals(
  items: Array<{
    price: number;
    qty: number;
    discountType?: DiscountType | string;
    discountValue?: number;
  }>,
  basketDiscountType?: DiscountType | string,
  basketDiscountValue?: number,
): {
  grossTotal: number;
  itemsSubtotal: number;
  itemsSavings: number;
  basketDiscountAmount: number;
  finalTotal: number;
  totalSavings: number;
} {
  let grossTotal = 0;
  let itemsSubtotal = 0;
  let itemsSavings = 0;

  for (const item of items) {
    const { unitPrice, discountAmount } = calculateItemDiscount(
      item.price,
      item.discountType,
      item.discountValue,
    );
    grossTotal += item.price * item.qty;
    itemsSubtotal += unitPrice * item.qty;
    itemsSavings += discountAmount * item.qty;
  }

  let basketDiscountAmount = 0;
  if (basketDiscountType && basketDiscountValue && basketDiscountValue > 0) {
    if (basketDiscountType === "percentage") {
      const pct = Math.min(100, Math.max(0, basketDiscountValue));
      basketDiscountAmount = Math.round((itemsSubtotal * pct) / 100);
    } else if (basketDiscountType === "nominal") {
      basketDiscountAmount = Math.min(itemsSubtotal, Math.max(0, basketDiscountValue));
    }
  }

  const finalTotal = Math.max(0, itemsSubtotal - basketDiscountAmount);
  const totalSavings = itemsSavings + basketDiscountAmount;

  return {
    grossTotal,
    itemsSubtotal,
    itemsSavings,
    basketDiscountAmount,
    finalTotal,
    totalSavings,
  };
}

/** Round IDR to nearest 100 */
export function roundIDR(amount: number): number {
  return Math.round(amount / 100) * 100;
}

const standardDateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Format date for display in BI */
export function formatDate(ts: number): string {
  return standardDateTimeFormatter.format(new Date(ts));
}

/** Start/end of a day for range queries */
export function dayRange(date = new Date()): { startOfDay: number; endOfDay: number } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { startOfDay: start.getTime(), endOfDay: end.getTime() };
}

/** Start/end of current week (Mon–Sun) */
export function weekRange(): { startOfDay: number; endOfDay: number } {
  const now = new Date();
  const day = now.getDay() || 7; // make Sunday = 7
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { startOfDay: monday.getTime(), endOfDay: sunday.getTime() };
}

/** Start/end of current month */
export function monthRange(): { startOfDay: number; endOfDay: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { startOfDay: start.getTime(), endOfDay: end.getTime() };
}

/** Check if current active theme is dark */
export function isDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem("toku_theme");
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Toggle theme and notify app */
export function toggleTheme(): boolean {
  const next = !isDarkMode();
  localStorage.setItem("toku_theme", next ? "dark" : "light");
  document.documentElement.classList.toggle("dark", next);
  window.dispatchEvent(new CustomEvent("toku_theme_change", { detail: next }));
  return next;
}

/** Compress uploaded image File into a lightweight Base64 data URL (max 400x400) */
export function compressImage(file: File, maxDim = 400, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context unavailable"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Compress uploaded image File into a lightweight JPEG Blob (max 600x600, ~50-100KB) */
export function compressImageToBlob(file: File, maxDim = 600, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context unavailable"));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas toBlob failed"));
          },
          "image/jpeg",
          quality,
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
