import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "#/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import {
  ShoppingCartIcon,
  CoffeeIcon,
  PillIcon,
  DeviceMobileIcon,
  StorefrontIcon,
  PlusIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  WrenchIcon,
  ScissorsIcon,
  ForkKnifeIcon,
  TShirtIcon,
  HammerIcon,
  PawPrintIcon,
  PrinterIcon,
  DropIcon,
} from "@phosphor-icons/react";

export const Route = createFileRoute("/_app/onboarding")({ component: Onboarding });

const CATEGORIES = [
  {
    value: "bengkel",
    icon: WrenchIcon,
    label: "Bengkel & Otomotif",
    desc: "Bengkel motor, mobil, suku cadang & servis",
  },
  {
    value: "kuliner_resto",
    icon: ForkKnifeIcon,
    label: "Kuliner & Restoran",
    desc: "Rumah makan, resto, kedai & kuliner",
  },
  {
    value: "warung_kopi",
    icon: CoffeeIcon,
    label: "Warung Kopi / Cafe",
    desc: "Kopi, minuman kekinian & nongkrong",
  },
  {
    value: "sembako",
    icon: ShoppingCartIcon,
    label: "Warung Sembako",
    desc: "Beras, minyak, bumbu & kebutuhan dapur",
  },
  {
    value: "kelontong",
    icon: StorefrontIcon,
    label: "Toko Kelontong",
    desc: "Kebutuhan rumah tangga & sembako harian",
  },
  {
    value: "laundry",
    icon: DropIcon,
    label: "Laundry Kiloan",
    desc: "Cuci kiloan, satuan, setrika & dry clean",
  },
  {
    value: "barbershop_salon",
    icon: ScissorsIcon,
    label: "Barbershop & Salon",
    desc: "Pangkas rambut, potong rambut & perawatan",
  },
  {
    value: "fashion_butik",
    icon: TShirtIcon,
    label: "Fashion & Butik",
    desc: "Pakaian, hijab, sepatu & aksesoris mode",
  },
  {
    value: "konter_pulsa",
    icon: DeviceMobileIcon,
    label: "Konter Pulsa & HP",
    desc: "Pulsa, paket data, voucher & aksesoris",
  },
  {
    value: "apotek",
    icon: PillIcon,
    label: "Apotek & Toko Obat",
    desc: "Obat-obatan, resep & alat kesehatan",
  },
  {
    value: "toko_bangunan",
    icon: HammerIcon,
    label: "Toko Bangunan",
    desc: "Material bangunan, cat, semen & perkakas",
  },
  {
    value: "petshop",
    icon: PawPrintIcon,
    label: "Petshop & Klinik",
    desc: "Pakan hewan, vitamin, grooming & aksesoris",
  },
  {
    value: "atk_fotokopi",
    icon: PrinterIcon,
    label: "ATK & Fotokopi",
    desc: "Alat tulis, fotokopi, print & percetakan",
  },
  {
    value: "lainnya",
    icon: PlusIcon,
    label: "Usaha Lainnya",
    desc: "Kategori bisnis & usaha UMKM lainnya",
  },
] as const;

type Category = (typeof CATEGORIES)[number]["value"];

function Onboarding() {
  const { data: session } = authClient.useSession();
  const navigate = useNavigate();
  const createStore = useMutation(api.stores.create);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!name.trim() || !category || !session) return;
    setSaving(true);
    setError("");
    try {
      const newStoreId = await createStore({
        userId: session.user.id,
        userEmail: session.user.email,
        name: name.trim(),
        category,
      });
      if (newStoreId) {
        const userKey = `toku_active_store_id_${session.user.email || session.user.id}`;
        localStorage.setItem(userKey, newStoreId as string);
        localStorage.setItem("toku_active_store_id", newStoreId as string);
      }
      toast.success(`Toko "${name.trim()}" berhasil dibuat!`, {
        description: "Selamat datang di Toku POS",
      });
      navigate({ to: "/kasir" });
    } catch {
      setError("Gagal menyimpan toko. Silakan coba lagi.");
      toast.error("Gagal membuat toko. Silakan periksa koneksi.");
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        background: "var(--color-surface-2)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 580,
          background: "var(--color-surface)",
          borderRadius: "var(--radius-xl)",
          padding: "36px 28px",
          boxShadow: "var(--shadow-lg)",
          border: "1.5px solid var(--color-border)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src="/logo.png"
            alt="Toku POS"
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              objectFit: "contain",
              display: "block",
              margin: "0 auto 16px",
            }}
          />
          <div className="eyebrow-tag" style={{ justifyContent: "center", marginBottom: 4 }}>
            ATUR TOKO KASIR
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              margin: "0 0 6px",
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
            }}
          >
            Buat Profil Tokomu
          </h1>
          <p style={{ color: "var(--color-text-2)", fontSize: 14, margin: 0, fontWeight: 500 }}>
            Hanya butuh 1 menit. Dapat diubah kapan saja di Pengaturan.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Nama Toko / Usaha</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Warung Bu Ani, Toko Berkah..."
              required
              style={{
                ...inputStyle,
                fontSize: 16,
                height: 48,
                fontWeight: 600,
                borderRadius: 99,
                padding: "12px 20px",
              }}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={labelStyle}>Pilih Jenis Usaha / Toko</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 12,
              }}
            >
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const selected = category === c.value;
                return (
                  <div
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className="press-tactile"
                    style={{
                      border: `2px solid ${selected ? "var(--color-brand)" : "var(--color-border)"}`,
                      borderRadius: "var(--radius-md)",
                      padding: "16px 14px",
                      background: selected ? "var(--color-brand-light)" : "var(--color-surface)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 150ms ease",
                      position: "relative",
                      boxShadow: selected ? "0 4px 14px rgba(234,88,12,0.2)" : "var(--shadow-sm)",
                    }}
                  >
                    {selected && (
                      <div style={{ position: "absolute", top: 10, right: 10 }}>
                        <CheckCircleIcon size={20} weight="fill" color="var(--color-brand)" />
                      </div>
                    )}
                    <div
                      style={{
                        marginBottom: 10,
                        width: 36,
                        height: 36,
                        borderRadius: 99,
                        background: selected ? "var(--color-surface)" : "var(--color-surface-2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon
                        size={22}
                        weight="duotone"
                        color={selected ? "var(--color-brand)" : "var(--color-text-2)"}
                      />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)" }}>
                      {c.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-3)",
                        marginTop: 4,
                        lineHeight: 1.3,
                        fontWeight: 500,
                      }}
                    >
                      {c.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <p
              style={{
                color: "var(--color-danger)",
                fontSize: 13,
                marginBottom: 20,
                fontWeight: 700,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || !category || saving}
            className="press-tactile"
            style={{
              width: "100%",
              padding: "10px 10px 10px 24px",
              background: !name.trim() || !category ? "var(--color-border)" : "var(--color-brand)",
              color: "#ffffff",
              border: "none",
              borderRadius: 99,
              fontSize: 16,
              fontWeight: 800,
              cursor: !name.trim() || !category ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              boxShadow: !name.trim() || !category ? "none" : "0 8px 24px rgba(234,88,12,0.4)",
            }}
          >
            <span>{saving ? "Menyimpan Toko..." : "Simpan & Mulai Jualan"}</span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 99,
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowRightIcon size={18} weight="bold" />
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--color-text)",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  border: "1.5px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  fontSize: 15,
  background: "var(--color-surface)",
  color: "var(--color-text)",
  outline: "none",
};
