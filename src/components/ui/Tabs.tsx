import React, { createContext, useContext, useId } from "react";

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
  return (
    <TabsContext.Provider value={{ value, onValueChange, baseId }}>
      <div className={`w-full ${className}`}>{children}</div>
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
      className={`flex items-center gap-1.5 p-1.5 bg-[var(--color-surface-2)] rounded-[14px] border border-[var(--color-border)] overflow-x-auto ${className}`}
    >
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; size?: number | string; weight?: "regular" | "bold" | "fill" | "duotone" }>;
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
      className={`press-tactile flex items-center gap-2 px-4 py-2 rounded-[10px] text-xs transition-all whitespace-nowrap select-none cursor-pointer ${
        isActive
          ? "bg-[var(--color-surface)] text-[var(--color-brand)] shadow-xs font-extrabold border border-[var(--color-border)]"
          : "text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]/60 font-bold border border-transparent"
      } ${className}`}
    >
      {Icon && (
        <Icon
          size={16}
          weight={isActive ? "fill" : "regular"}
          className={isActive ? "text-[var(--color-brand)]" : "text-[var(--color-text-3)]"}
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
  const isActive = activeValue === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  if (!isActive && !forceMount) return null;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={!isActive}
      className={`mt-4 focus:outline-none ${className}`}
    >
      {children}
    </div>
  );
};
