import { createContext, useContext } from "react";
import type { Doc } from "../../convex/_generated/dataModel";

export interface AppStoreContextType {
  store: Doc<"stores"> | null | undefined;
  session: any;
}

export const AppStoreContext = createContext<AppStoreContextType>({
  store: undefined,
  session: null,
});

export function useAppStore() {
  return useContext(AppStoreContext);
}
