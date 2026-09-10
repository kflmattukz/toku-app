export function LandingFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        padding: "36px 20px",
        textAlign: "center",
        fontSize: 13,
        color: "var(--color-text-3)",
        fontWeight: 600,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
        <span>
          © {new Date().getFullYear()} Toku POS · Dibuat untuk kemajuan UMKM Makassar & Indonesia
        </span>
        <span style={{ fontSize: 12, color: "var(--color-text-3)", opacity: 0.8 }}>
          Offline-First · Thermal Printing · Tanpa Biaya Berlangganan
        </span>
      </div>
    </footer>
  );
}
