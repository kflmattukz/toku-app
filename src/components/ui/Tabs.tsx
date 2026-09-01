import React, { createContext, useContext, useId, useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/lib/utils";

// ============================================================================
// CVA Tabs Variants
// ============================================================================

export const tabListVariants = cva(
  "flex items-center gap-1.5 overflow-x-auto rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-1.5",
);

export const tabTriggerVariants = cva(
  "press-tactile flex cursor-pointer items-center gap-2 rounded-[10px] px-4 py-2 text-xs whitespace-nowrap transition-all select-none",
  {
    variants: {
      isActive: {
        true: "border border-[var(--color-border)] bg-[var(--color-surface)] font-extrabold text-[var(--color-brand)] shadow-xs",
        false: "border border-transparent font-bold text-[var(--color-text-2)] hover:bg-[var(--color-surface)]/60 hover:text-[var(--color-text)]",
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
);

export type TabTriggerVariants = VariantProps<typeof tabTriggerVariants>;

type TabsContextType = {
  value: string;
  onValueChange: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextType | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs compound components must be rendered inside <Tabs>");
  }
  return context;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className = "" }: TabsProps) {
  const baseId = useId();
  const contextValue = useMemo(
    () => ({ value, onValueChange, baseId }),
    [value, onValueChange, baseId],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

Tabs.List = function TabsList({ children, className = "" }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(tabListVariants(), className)}
    >
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{
    className?: string;
    size?: number | string;
    weight?: "regular" | "bold" | "fill" | "duotone";
  }>;
  className?: string;
  badge?: React.ReactNode;
}

Tabs.Trigger = function TabsTrigger({
  value,
  children,
  icon: Icon,
  className = "",
  badge,
}: TabsTriggerProps) {
  const { value: activeValue, onValueChange, baseId } = useTabsContext();
  const isActive = activeValue === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      onClick={() => onValueChange(value)}
      className={cn(tabTriggerVariants({ isActive }), className)}
    >
      {Icon && (
        <Icon
          size={16}
          weight={isActive ? "fill" : "regular"}
          className={cn(isActive ? "text-[var(--color-brand)]" : "text-[var(--color-text-3)]")}
        />
      )}
      <span>{children}</span>
      {badge}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  forceMount?: boolean;
}

Tabs.Content = function TabsContent({
  value,
  children,
  className = "",
  forceMount = false,
}: TabsContentProps) {
  const { value: activeValue, baseId } = useTabsContext();
  const isSelected = activeValue === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  if (!isSelected && !forceMount) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={!isSelected}
      className={cn("w-full", className)}
    >
      {children}
    </div>
  );
};
