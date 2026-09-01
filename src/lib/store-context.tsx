import { createContext, useContext } from "react";
import type { Doc, Id } from "../../convex/_generated/dataModel";

export interface ActiveCashier {
  id?: string;
  name: string;
  role: "owner" | "manager" | "cashier";
}

export interface AppStoreContextType {
  store: Doc<"stores"> | null | undefined;
  session: any;
  currentCashier: ActiveCashier | null;
  setCurrentCashier: (cashier: ActiveCashier | null) => void;
  selectedStoreId: Id<"stores"> | null;
  setSelectedStoreId: (id: Id<"stores"> | null) => void;
  isPro: boolean;
  openUpgradeModal: (defaultPlan?: "monthly" | "yearly") => void;
  privacyMode: boolean;
  togglePrivacyMode: () => void;
}

export const AppStoreContext = createContext<AppStoreContextType>({
  store: undefined,
  session: null,
  currentCashier: null,
  setCurrentCashier: () => {},
  selectedStoreId: null,
  setSelectedStoreId: () => {},
  isPro: false,
  openUpgradeModal: () => {},
  privacyMode: false,
  togglePrivacyMode: () => {},
});

export function useAppStore() {
  return useContext(AppStoreContext);
}
