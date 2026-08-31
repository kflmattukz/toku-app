import { CheckCircleIcon } from "@phosphor-icons/react";
import { ONBOARDING_CATEGORIES, type OnboardingCategory } from "../constants";

interface BusinessCategoryGridProps {
  selectedCategory: OnboardingCategory | null;
  onSelectCategory: (cat: OnboardingCategory) => void;
}

export function BusinessCategoryGrid({
  selectedCategory,
  onSelectCategory,
}: BusinessCategoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {ONBOARDING_CATEGORIES.map((c) => {
        const Icon = c.icon;
        const isSelected = selectedCategory === c.value;
        return (
          <div
            key={c.value}
            onClick={() => onSelectCategory(c.value)}
            className={`press-tactile p-3.5 rounded-2xl border-2 cursor-pointer transition-all relative ${
              isSelected
                ? "border-[var(--color-brand)] bg-[var(--color-brand-light)] shadow-md shadow-primary-500/15"
                : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-subtle)]"
            }`}
          >
            {isSelected && (
              <div className="absolute top-2.5 right-2.5">
                <CheckCircleIcon size={18} weight="fill" className="text-[var(--color-brand)]" />
              </div>
            )}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 border ${
                isSelected
                  ? "bg-[var(--color-surface)] text-[var(--color-brand)] border-[var(--color-brand)]"
                  : "bg-[var(--color-surface-2)] text-[var(--color-text-2)] border-[var(--color-border)]"
              }`}
            >
              <Icon size={20} weight="duotone" />
            </div>
            <div className="text-xs font-extrabold text-[var(--color-text)]">
              {c.label}
            </div>
            <div className="text-[10px] text-[var(--color-text-3)] mt-0.5 leading-snug font-medium line-clamp-2">
              {c.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
}
