import { FEATURES } from "../data";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { SpotlightCard } from "./SpotlightCard";

export function LandingFeatures() {
  const containerRef = useScrollReveal<HTMLElement>({ threshold: 0.1, staggerDelay: 70 });

  return (
    <section
      ref={containerRef}
      style={{ padding: "0 20px 80px", maxWidth: 1080, margin: "0 auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div className="reveal-init eyebrow-tag" style={{ justifyContent: "center" }}>
          FITUR LENGKAP KASIR
        </div>
        <h2
          className="reveal-init"
          style={{
            fontSize: "clamp(24px, 4vw, 34px)",
            fontWeight: 800,
            margin: "4px 0 0",
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
          }}
        >
          Dirancang Khusus Untuk Kecepatan Jualan
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <SpotlightCard
              key={f.title}
              className="reveal-init"
              style={{
                padding: "26px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 99,
                    background: "var(--color-brand-light)",
                    border: "1px solid var(--color-brand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(234, 88, 12, 0.12)",
                  }}
                >
                  <Icon size={24} weight="duotone" color="var(--color-brand)" />
                </div>
                {f.badge && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-brand)",
                      padding: "3px 10px",
                      borderRadius: 99,
                    }}
                  >
                    {f.badge}
                  </span>
                )}
              </div>

              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  margin: "0 0 8px",
                  color: "var(--color-text)",
                  letterSpacing: "-0.015em",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--color-text-2)",
                  margin: 0,
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                {f.desc}
              </p>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
}
