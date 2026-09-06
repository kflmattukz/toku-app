import {
  ChartBarIcon,
  CheckCircleIcon,
  CoffeeIcon,
  LightningIcon,
  PrinterIcon,
  SparkleIcon,
  StorefrontIcon,
  WifiHighIcon,
} from "@phosphor-icons/react";

interface PosSimulationShowcaseProps {
  dark: boolean;
}

export function PosSimulationShowcase({ dark }: PosSimulationShowcaseProps) {
  return (
    <div
      className="animate-toku-fade-up login-left-showcase flex-col justify-center"
      style={{ position: "relative" }}
    >
      {/* Eyebrow Micro Pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 99,
          backgroundColor: "rgba(234, 88, 12, 0.09)",
          border: "1px solid rgba(234, 88, 12, 0.22)",
          width: "fit-content",
          marginBottom: 20,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#10b981",
            boxShadow: "0 0 8px #10b981",
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-brand)",
          }}
        >
          POS KASIR UMKM MODERN • OFFLINE FIRST
        </span>
      </div>

      {/* Headline */}
      <h2
        style={{
          margin: 0,
          fontSize: "clamp(2rem, 3.2vw, 2.75rem)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          color: "var(--color-text)",
        }}
      >
        Kelola kasir, stok, dan penjualan{" "}
        <span
          style={{
            background: "linear-gradient(135deg, var(--color-brand) 0%, #f59e0b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          secepat kilat.
        </span>
      </h2>

      <p
        style={{
          margin: "16px 0 32px",
          fontSize: 15,
          lineHeight: 1.6,
          color: "var(--color-text-2)",
          maxWidth: 520,
        }}
      >
        Tetap layani transaksi tanpa henti walau sinyal terputus. Cetak nota thermal instan dan
        rekap omset otomatis untuk tokomu.
      </p>

      {/* LIVE POS MOCKUP CARD (Double-Bezel Hardware Archetype) */}
      <div
        className="animate-toku-float"
        style={{
          position: "relative",
          maxWidth: 560,
          width: "100%",
        }}
      >
        {/* Outer Shell (Doppelrand Outer Tray) */}
        <div
          style={{
            padding: 8,
            borderRadius: 28,
            backgroundColor: dark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)",
            border: "1px solid var(--color-border)",
            boxShadow: dark
              ? "0 20px 48px rgba(0, 0, 0, 0.45)"
              : "0 20px 48px rgba(234, 88, 12, 0.08)",
          }}
        >
          {/* Inner Core (Display Glass) */}
          <div
            style={{
              borderRadius: 22,
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border-subtle)",
              padding: "24px 22px",
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.12)",
            }}
          >
            {/* Mock Terminal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 16,
                borderBottom: "1px dashed var(--color-border)",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "rgba(234, 88, 12, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-brand)",
                  }}
                >
                  <StorefrontIcon size={20} weight="bold" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-text)" }}>
                    Warung Kopi & Sembako Toku
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>
                    Kasir #01 • Shift Pagi Aktif
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 99,
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#10b981",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                  }}
                />
                <span>Online Cloud</span>
              </div>
            </div>

            {/* Mock Order Line Items */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: "var(--color-surface-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-brand)",
                    }}
                  >
                    <CoffeeIcon size={16} weight="bold" />
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, color: "var(--color-text)" }}>
                      2x Kopi Susu Gula Aren
                    </span>
                    <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>@ Rp 18.000</div>
                  </div>
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    color: "var(--color-text)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Rp 36.000
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: "var(--color-surface-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-brand)",
                    }}
                  >
                    <SparkleIcon size={16} weight="bold" />
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, color: "var(--color-text)" }}>
                      1x Roti Bakar Cokelat Keju
                    </span>
                    <div style={{ fontSize: 11, color: "var(--color-text-3)" }}>@ Rp 18.000</div>
                  </div>
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    color: "var(--color-text)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Rp 18.000
                </span>
              </div>
            </div>

            {/* Calculated Totals Row */}
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 14,
                backgroundColor: "var(--color-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-3)",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  Total Tagihan
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "var(--color-brand)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Rp 54.000
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-3)",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  Kembalian (Uang Pas Rp 100k)
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#10b981",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Rp 46.000
                </div>
              </div>
            </div>

            {/* Payment Success Pill & Thermal Printer Ready */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#10b981",
                }}
              >
                <CheckCircleIcon size={16} weight="fill" />
                <span>Pembayaran Berhasil • QRIS Digital</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "var(--color-text-3)",
                }}
              >
                <PrinterIcon size={14} weight="bold" />
                <span>Nota 58mm Dicetak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Satellite Badge 1: Instant Speed */}
        <div
          className="animate-toku-float-alt"
          style={{
            position: "absolute",
            top: -16,
            right: -16,
            padding: "8px 14px",
            borderRadius: 99,
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 800,
            color: "var(--color-text)",
            zIndex: 2,
          }}
        >
          <LightningIcon size={16} weight="fill" color="var(--color-brand)" />
          <span>1.2s Transaksi Kilat</span>
        </div>

        {/* Floating Satellite Badge 2: Offline Ready */}
        <div
          className="animate-toku-float-alt"
          style={{
            position: "absolute",
            bottom: -18,
            left: -12,
            padding: "8px 14px",
            borderRadius: 99,
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 800,
            color: "var(--color-text)",
            zIndex: 2,
          }}
        >
          <WifiHighIcon size={16} weight="bold" color="#10b981" />
          <span>100% Offline-Ready</span>
        </div>
      </div>

      {/* Trust Metrics Ribbon below preview */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginTop: 40,
          paddingTop: 24,
          borderTop: "1px solid var(--color-border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ChartBarIcon size={18} weight="bold" color="var(--color-brand)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-2)" }}>
            Rekap Omset Otomatis
          </span>
        </div>
        <div
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "var(--color-border)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PrinterIcon size={18} weight="bold" color="var(--color-brand)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-2)" }}>
            Thermal Bluetooth & USB
          </span>
        </div>
      </div>
    </div>
  );
}
