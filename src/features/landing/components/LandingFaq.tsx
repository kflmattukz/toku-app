import { CaretDownIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { FAQS } from "../data";
import { useScrollReveal } from "../hooks/useScrollReveal";

export function LandingFaq() {
  const containerRef = useScrollReveal<HTMLElement>({ threshold: 0.1, staggerDelay: 60 });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  return (
    <section ref={containerRef} style={{ padding: "80px 20px", maxWidth: 860, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div className="reveal-init eyebrow-tag" style={{ justifyContent: "center" }}>
          PERTANYAAN UMUM
        </div>
        <h2
          className="reveal-init"
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 800,
            margin: "4px 0 0",
            color: "var(--color-text)",
          }}
        >
          Pertanyaan yang Sering Diajukan
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {FAQS.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={faq.q}
              className="reveal-init squircle-card"
              style={{
                cursor: "pointer",
                padding: "20px 24px",
                borderColor: isOpen ? "var(--color-brand)" : "var(--color-border)",
                transition: "border-color 220ms ease, box-shadow 220ms ease",
                boxShadow: isOpen ? "0 8px 24px -6px rgba(234, 88, 12, 0.14)" : "var(--shadow-sm)",
              }}
              onClick={() => toggleFaq(idx)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: isOpen ? "var(--color-brand)" : "var(--color-text)",
                    transition: "color 200ms ease",
                  }}
                >
                  {faq.q}
                </div>
                <div
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 240ms cubic-bezier(0.16, 1, 0.3, 1)",
                    color: isOpen ? "var(--color-brand)" : "var(--color-text-3)",
                    flexShrink: 0,
                  }}
                >
                  <CaretDownIcon size={18} weight="bold" />
                </div>
              </div>

              {/* Smooth CSS Grid Height Expansion */}
              <div className={`faq-grid-wrapper ${isOpen ? "is-open" : ""}`}>
                <div className="faq-grid-content">
                  <p
                    style={{
                      margin: "14px 0 0",
                      fontSize: 14,
                      color: "var(--color-text-2)",
                      lineHeight: 1.65,
                      fontWeight: 500,
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
