import { useEffect, useRef } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  staggerDelay?: number;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {},
) {
  const containerRef = useRef<T | null>(null);
  const { threshold = 0.12, rootMargin = "0px 0px -40px 0px", staggerDelay = 60 } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    // If user prefers reduced motion, reveal instantly
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      const items = container.querySelectorAll<HTMLElement>(".reveal-init");
      items.forEach((item) => item.classList.add("reveal-visible"));
      return;
    }

    const timerIds = new Set<ReturnType<typeof setTimeout>>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const index = Number(target.dataset.revealIndex || 0);
            const timerId = setTimeout(() => {
              target.classList.add("reveal-visible");
              timerIds.delete(timerId);
            }, index * staggerDelay);
            timerIds.add(timerId);
            observer.unobserve(target);
          }
        });
      },
      { threshold, rootMargin },
    );

    const items = container.querySelectorAll<HTMLElement>(".reveal-init");
    items.forEach((item, i) => {
      if (!item.dataset.revealIndex) {
        item.dataset.revealIndex = String(i);
      }
      observer.observe(item);
    });

    return () => {
      timerIds.forEach((id) => clearTimeout(id));
      timerIds.clear();
      observer.disconnect();
    };
  }, [threshold, rootMargin, staggerDelay]);

  return containerRef;
}
