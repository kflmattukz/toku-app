import { useRef, type ComponentPropsWithoutRef, type MouseEvent, type ReactNode } from "react";

interface SpotlightCardProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  className?: string;
}

export function SpotlightCard({ children, className = "", style, ...props }: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.removeProperty("--mouse-x");
    card.style.removeProperty("--mouse-y");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`spotlight-card ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
