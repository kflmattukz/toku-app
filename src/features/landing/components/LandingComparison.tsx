import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import { COMPARISONS } from "../data";
import { useScrollReveal } from "../hooks/useScrollReveal";

export function LandingComparison() {
  const containerRef = useScrollReveal<HTMLElement>({ threshold: 0.1 });

  return (
    <section
      ref={containerRef}
      style={{ padding: "64px 20px", maxWidth: 1040, margin: "0 auto" }}
    >
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div className="reveal-init eyebrow-tag" style={{ justifyContent: "center" }}>
          PERBANDINGAN KASIR
        </div>
        <h2
          className="reveal-init"
          style={{
            fontSize: "clamp(24px, 4vw, 34px)",
            fontWeight: 800,
            margin: "4px 0 0",
            color: "var(--color-text)",
          }}
        >
          Mengapa beralih ke Toku POS?
        </h2>
      </div>

      <div className="reveal-init doppelrand-shell">
        <div className="doppelrand-core" style={{ padding: "12px 18px", overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              minWidth: 620,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                <th
                  style={{
                    padding: "16px 14px",
                    fontSize: 13,
                    color: "var(--color-text-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Fitur & Pengalaman
                </th>
                <th
                  style={{
                    padding: "16px 14px",
                    fontSize: 13,
                    color: "var(--color-danger-text)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Buku Catatan Manual
                </th>
                <th
                  style={{
                    padding: "16px 14px",
                    fontSize: 13,
                    color: "var(--color-brand)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Toku POS Modern
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISONS.map((c, i) => (
                <tr
                  key={c.feature}
                  style={{
                    borderBottom:
                      i === COMPARISONS.length - 1
                        ? "none"
                        : "1px solid var(--color-border-subtle)",
                    transition: "background-color 150ms ease",
                  }}
                  className="hover:bg-[var(--color-surface-2)]"
                >
                  <td
                    style={{
                      padding: "16px 14px",
                      fontWeight: 800,
                      fontSize: 14,
                      color: "var(--color-text)",
                    }}
                  >
                    {c.feature}
                  </td>
                  <td
                    style={{
                      padding: "16px 14px",
                      fontSize: 13,
                      color: "var(--color-text-2)",
                      fontWeight: 500,
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <XCircleIcon size={18} weight="fill" color="var(--color-danger)" /> {c.oldWay}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "16px 14px",
                      fontSize: 13,
                      color: "var(--color-text)",
                      fontWeight: 700,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: "var(--color-brand)",
                      }}
                    >
                      <CheckCircleIcon size={18} weight="fill" color="var(--color-brand)" />{" "}
                      {c.tokuWay}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
