import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "#/lib/auth-client";
import { useAppStore } from "#/lib/store-context";
import { useEffect, useState } from "react";
import { isDarkMode, toggleTheme } from "#/lib/utils";
import { toast } from "sonner";
import {
  MoonIcon,
  SunIcon,
  SignOutIcon,
  UserIcon,
  CheckIcon,
  StorefrontIcon,
  PaletteIcon,
} from "@phosphor-icons/react";

export const Route = createFileRoute("/_app/pengaturan")({ component: Pengaturan });

const CATEGORY_LABELS: Record<string, string> = {
  sembako: "Warung Sembako",
  warung_kopi: "Warung Kopi",
  apotek: "Apotek",
  konter_pulsa: "Konter Pulsa",
  kelontong: "Toko Kelontong",
  lainnya: "Lainnya",
};

function Pengaturan() {
  const { store, session } = useAppStore();
  const updateStore = useMutation(api.stores.update);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dark, setDark] = useState(isDarkMode);

  useEffect(() => {
    if (store) {
      setName(store.name);
      setAddress(store.address ?? "");
    }
  }, [store]);

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<boolean>) => setDark(e.detail);
    window.addEventListener("toku_theme_change" as any, handleThemeChange);
    return () => window.removeEventListener("toku_theme_change" as any, handleThemeChange);
  }, []);

  const handleToggleDark = () => {
    const next = toggleTheme();
    setDark(next);
    toast.info(`Mode tampilan diubah ke ${next ? "Gelap" : "Terang"}`);
  };

  const handleSave = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    try {
      await updateStore({ id: store._id, name, address: address || undefined });
      setSaved(true);
      toast.success("Info toko berhasil diperbarui!");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Gagal memperbarui profil toko.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    toast.info("Keluar dari Toku POS...");
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  if (!store) return <Loader />;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 24px", color: "var(--color-text)" }}>
        Pengaturan Toko & Tampilan
      </h1>

      {/* Store settings */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <StorefrontIcon size={20} weight="bold" color="var(--color-brand)" />
          Info Toko
        </h2>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nama Toko</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Jenis Usaha (Kategori)</label>
            <div
              style={{
                padding: "12px 14px",
                background: "var(--color-surface-2)",
                border: "1.5px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                fontSize: 14,
                color: "var(--color-text)",
                fontWeight: 500,
              }}
            >
              {CATEGORY_LABELS[store.category] ?? store.category}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Alamat Toko (opsional)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Rajawali No. 12, Makassar"
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 24px",
              background: saved ? "var(--color-success)" : "var(--color-brand)",
              color: "#ffffff",
              border: "none",
              borderRadius: "var(--radius-sm)",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {saved ? (
              <>
                <CheckIcon size={18} weight="bold" /> Tersimpan!
              </>
            ) : saving ? (
              "Menyimpan..."
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </form>
      </section>

      {/* Appearance */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <PaletteIcon size={20} weight="bold" color="var(--color-brand)" />
          Tampilan Aplikasi
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 99,
                background: "var(--color-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {dark ? (
                <MoonIcon size={22} weight="duotone" color="var(--color-brand)" />
              ) : (
                <SunIcon size={22} weight="duotone" color="var(--color-warning)" />
              )}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>
                Mode Gelap (Dark Mode)
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-2)", marginTop: 2 }}>
                Mengubah tampilan ke warna gelap yang nyaman di mata
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleDark}
            type="button"
            aria-label="Toggle dark mode"
            style={{
              width: 54,
              height: 30,
              borderRadius: 99,
              background: dark ? "var(--color-brand)" : "var(--color-border)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "background 200ms",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 99,
                background: "#ffffff",
                position: "absolute",
                top: 3,
                transition: "left 200ms",
                left: dark ? 27 : 3,
                boxShadow: "0 1px 3px rgba(0,0,0,.3)",
              }}
            />
          </button>
        </div>
      </section>

      {/* Account */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>
          <UserIcon size={20} weight="bold" color="var(--color-brand)" />
          Akun Pengguna
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          {session?.user.image ? (
            <img
              src={session.user.image}
              style={{
                width: 48,
                height: 48,
                borderRadius: 99,
                border: "2px solid var(--color-border)",
                objectFit: "cover",
              }}
              alt="avatar"
            />
          ) : (
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 99,
                background: "var(--color-brand-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserIcon size={24} weight="duotone" color="var(--color-brand-dark)" />
            </div>
          )}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>
              {session?.user.name}
            </div>
            <div style={{ fontSize: 13, color: "var(--color-text-2)" }}>{session?.user.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "12px 20px",
            border: "1px solid var(--color-danger)",
            background: "none",
            color: "var(--color-danger)",
            borderRadius: "var(--radius-sm)",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <SignOutIcon size={18} /> Keluar dari Akun
        </button>
      </section>
    </div>
  );
}

function Loader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <UserIcon size={40} color="var(--color-brand)" weight="duotone" style={{ opacity: 0.5 }} />
      <p style={{ color: "var(--color-text-2)", fontSize: 14, margin: 0 }}>Memuat pengaturan...</p>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
  marginBottom: 20,
  boxShadow: "var(--shadow-sm)",
};
const sectionTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  margin: "0 0 20px",
  color: "var(--color-text)",
  display: "flex",
  alignItems: "center",
  gap: 8,
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--color-text)",
  marginBottom: 8,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  fontSize: 15,
  background: "var(--color-surface)",
  color: "var(--color-text)",
  outline: "none",
};
