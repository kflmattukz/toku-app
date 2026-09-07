import { CATEGORIES } from "../data";
import { useScrollReveal } from "../hooks/useScrollReveal";

export function LandingCategories() {
  const containerRef = useScrollReveal<HTMLElement>({ threshold: 0.12, staggerDelay: 50 });

  return (
    <section
      ref={containerRef}
      style={{
        padding: "64px 20px",
        background: "var(--color-surface-2)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", textAlign: "center" }}>
        <div className="reveal-init eyebrow-tag">DUKUNGAN USAHA</div>
        <h2
          className="reveal-init"
          style={{
            fontSize: "clamp(24px, 4vw, 32px)",
            fontWeight: 800,
            margin: "4px 0 32px",
            color: "var(--color-text)",
          }}
        >
          Cocok Untuk Semua Jenis Toko & Warung
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
          }}
        >
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="reveal-init press-tactile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "var(--color-surface)",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: 99,
                  padding: "12px 22px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--color-text)",
                  boxShadow: "var(--shadow-sm)",
                  cursor: "default",
                  transition: "all 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <Icon size={20} weight="duotone" color="var(--color-brand)" />
                <span>{c.label}</span>
                {c.badge && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      background: "var(--color-brand-light)",
                      color: "var(--color-brand)",
                      padding: "2px 8px",
                      borderRadius: 99,
                      border: "1px solid var(--color-brand)",
                    }}
                  >
                    {c.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
