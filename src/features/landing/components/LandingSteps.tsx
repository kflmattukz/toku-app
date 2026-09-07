import { STEPS } from "../data";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { SpotlightCard } from "./SpotlightCard";

export function LandingSteps() {
  const containerRef = useScrollReveal<HTMLElement>({ threshold: 0.12, staggerDelay: 80 });

  return (
    <section
      ref={containerRef}
      style={{ padding: "64px 20px", maxWidth: 1040, margin: "0 auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div className="reveal-init eyebrow-tag" style={{ justifyContent: "center" }}>
          CARA KERJA CEPAT
        </div>
        <h2
          className="reveal-init"
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 800,
            margin: "4px 0 0",
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
          }}
        >
          3 Langkah Mudah Memulai Jualan
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <SpotlightCard
              key={s.step}
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
                  marginBottom: 18,
                }}
              >
                <span
                  className="price"
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: "var(--color-brand)",
                    opacity: 0.85,
                  }}
                >
                  {s.step}
                </span>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 99,
                    background: "var(--color-brand-light)",
                    border: "1px solid var(--color-brand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(234, 88, 12, 0.12)",
                  }}
                >
                  <Icon size={22} weight="duotone" color="var(--color-brand)" />
                </div>
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
                {s.title}
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
                {s.desc}
              </p>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
}
