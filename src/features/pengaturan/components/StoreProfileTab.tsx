import {
  StorefrontIcon,
  BellRingingIcon,
  CheckIcon,
  PaletteIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  SignOutIcon,
  GlobeIcon,
  CopyIcon,
  ArrowSquareOutIcon,
  QrCodeIcon,
  XIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react";
import { Button } from "#/components/ui";
import { CategorySelectPicker } from "./CategorySelectPicker";
import { useThemeSwitchAnimation } from "#/lib/useThemeSwitchAnimation";
import { useState } from "react";
import { toast } from "sonner";

interface StoreProfileTabProps {
  name: string;
  setName: (val: string) => void;
  branchName: string;
  setBranchName: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  lowStockThreshold: number;
  setLowStockThreshold: (val: number) => void;
  slug?: string;
  setSlug?: (val: string) => void;
  onlineStoreEnabled?: boolean;
  setOnlineStoreEnabled?: (val: boolean) => void;
  storeId?: string;
  saving: boolean;
  saved: boolean;
  onSave: (e: React.FormEvent) => void;
  dark?: boolean;
  onToggleDark?: () => void;
  session: any;
  onLogout: () => void;
}

export function StoreProfileTab({
  name,
  setName,
  branchName,
  setBranchName,
  category,
  setCategory,
  address,
  setAddress,
  lowStockThreshold,
  setLowStockThreshold,
  slug,
  setSlug,
  onlineStoreEnabled = true,
  setOnlineStoreEnabled,
  storeId,
  saving,
  saved,
  onSave,
  dark: propDark,
  onToggleDark,
  session,
  onLogout,
}: StoreProfileTabProps) {
  const { ref: themeButtonRef, toggleSwitchTheme, dark: activeDark } = useThemeSwitchAnimation();
  const isDark = propDark ?? activeDark;
  const [showQrModal, setShowQrModal] = useState(false);

  const publicPath = slug?.trim() || storeId || "";
  const publicUrl =
    typeof window !== "undefined" && publicPath ? `${window.location.origin}/s/${publicPath}` : "";
  return (
    <div className="flex flex-col gap-5">
      {/* Store Information */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
        <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-[var(--color-text)]">
          <StorefrontIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Informasi Usaha</span>
        </h2>

        <form onSubmit={onSave}>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                Nama Toko / Bisnis
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                Nama Cabang Ini
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Contoh: Pusat, Cabang Kemang"
                className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
              Kategori Usaha UMKM
            </label>
            <CategorySelectPicker value={category} onChange={setCategory} />
            <span className="mt-1.5 block text-[11px] text-[var(--color-text-3)]">
              Kategori menentukan klasifikasi profil bisnis dan rekomendasi fitur untuk toko Anda.
            </span>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
              Alamat Toko (Dicetak pada Struk)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Merdeka No. 45, Jakarta"
              className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="low-stock-threshold"
              className="mb-2 block flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]"
            >
              <BellRingingIcon size={16} weight="bold" className="text-[var(--color-brand)]" />
              <span>Batas Peringatan Stok Menipis (Auto Restock Alert)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                id="low-stock-threshold"
                type="number"
                min="1"
                max="1000"
                value={lowStockThreshold}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setLowStockThreshold(Number.isNaN(val) ? 0 : val);
                }}
                className="focus:ring-primary-500/20 focus:border-primary-500 w-36 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-bold text-[var(--color-text)] focus:ring-2 focus:outline-none"
              />
              <span className="text-xs font-semibold text-[var(--color-text-2)]">Unit / Pcs</span>
            </div>
            <span className="mt-1.5 block text-[11px] text-[var(--color-text-3)]">
              Sistem kasir otomatis menandai produk berstatus merah jika sisa stok di bawah angka
              ini.
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            loadingText="Menyimpan..."
            leftIcon={saved ? <CheckIcon size={18} weight="bold" /> : undefined}
            className={`w-full sm:w-auto ${saved ? "!bg-[var(--color-success)] shadow-emerald-500/20" : ""}`}
          >
            {saved ? "Tersimpan!" : "Simpan Perubahan Toko"}
          </Button>
        </form>
      </section>

      {/* Toko Online & Pickup Catalog */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-[var(--color-text)]">
            <GlobeIcon size={20} weight="bold" className="text-emerald-500" />
            <span>Toko Online & Checkout Pickup</span>
          </h2>

          {setOnlineStoreEnabled && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-semibold text-[var(--color-text-2)]">
                {onlineStoreEnabled ? "Aktif" : "Nonaktif"}
              </span>
              <input
                type="checkbox"
                checked={onlineStoreEnabled}
                onChange={(e) => setOnlineStoreEnabled(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  onlineStoreEnabled ? "bg-emerald-600" : "bg-[var(--color-border)]"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-xs transition-transform ${
                    onlineStoreEnabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
          )}
        </div>

        <p className="text-xs text-[var(--color-text-2)] mb-4 leading-relaxed">
          Pelanggan dapat membuka link toko online Anda untuk melihat katalog produk, memesan secara mandiri dari smartphone, dan mengambil pesanan langsung di kasir (BOPIS).
        </p>

        <div className="space-y-4">
          {setSlug && (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
                Kustomisasi URL Toko (Slug)
              </label>
              <div className="flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
                <span className="px-3 py-2 text-xs text-[var(--color-text-3)] font-mono shrink-0 select-none">
                  {typeof window !== "undefined" ? window.location.origin : ""}/s/
                </span>
                <input
                  type="text"
                  value={slug || ""}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                        .replace(/-+/g, "-"),
                    )
                  }
                  placeholder={storeId || "nama-toko-anda"}
                  className="w-full bg-transparent px-2 py-2 text-xs font-bold text-[var(--color-text)] focus:outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-[var(--color-text-3)]">
                Klik tombol "Simpan Perubahan Toko" di atas setelah mengubah slug.
              </p>
            </div>
          )}

          {/* Share & Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<CopyIcon size={16} weight="bold" />}
              onClick={() => {
                if (!publicUrl) return;
                navigator.clipboard.writeText(publicUrl);
                toast.success("Link toko online berhasil disalin!");
              }}
            >
              Salin Link Toko
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<ArrowSquareOutIcon size={16} weight="bold" />}
              onClick={() => {
                if (!publicUrl) return;
                window.open(publicUrl, "_blank");
              }}
            >
              Buka Toko
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<QrCodeIcon size={16} weight="bold" />}
              onClick={() => setShowQrModal(true)}
            >
              QR Code Meja / Kasir
            </Button>
          </div>
        </div>
      </section>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <QrCodeIcon size={20} className="text-emerald-500" weight="bold" />
                <h3 className="font-extrabold text-sm text-[var(--color-text)]">QR Code Toko Online</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-2)] text-[var(--color-text-2)]"
              >
                <XIcon size={16} />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block border border-slate-200 shadow-xs mb-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(publicUrl)}`}
                alt="QR Code Toko"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-xs font-semibold text-[var(--color-text)]">{name}</p>
            <p className="text-[11px] text-[var(--color-text-3)] font-mono truncate mt-0.5">{publicUrl}</p>

            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                fullWidth
                leftIcon={<DownloadSimpleIcon size={16} weight="bold" />}
                onClick={() => {
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(publicUrl)}`;
                  const a = document.createElement("a");
                  a.href = qrUrl;
                  a.download = `qrcode-${slug || "toko"}.png`;
                  a.target = "_blank";
                  a.click();
                }}
              >
                Unduh Gambar QR
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Appearance */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
        <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-[var(--color-text)]">
          <PaletteIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Tampilan Aplikasi</span>
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]">
              {isDark ? (
                <MoonIcon size={22} weight="duotone" className="text-[var(--color-brand)]" />
              ) : (
                <SunIcon size={22} weight="duotone" className="text-amber-500" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[var(--color-text)]">
                Mode Tampilan Gelap (Dark Mode)
              </div>
              <div className="mt-0.5 text-xs text-[var(--color-text-2)]">
                Nuansa OLED gelap kontras tinggi, nyaman di mata saat shift malam
              </div>
            </div>
          </div>
          <button
            ref={themeButtonRef}
            type="button"
            onClick={onToggleDark ?? toggleSwitchTheme}
            aria-label="Toggle dark mode"
            className={`press-tactile relative h-8 w-14 shrink-0 cursor-pointer rounded-full border-none transition-all ${
              isDark
                ? "shadow-primary-500/40 bg-[var(--color-brand)] shadow-sm"
                : "bg-[var(--color-border)]"
            }`}
          >
            <div
              className={`absolute top-0.5 h-6.5 w-6.5 rounded-full bg-white shadow-xs transition-all ${
                isDark ? "left-7" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Account */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
        <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-[var(--color-text)]">
          <UserIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Akun Pengguna & Sesi</span>
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            {session?.user.image ? (
              <img
                src={session.user.image}
                className="h-12 w-12 shrink-0 rounded-2xl border-2 border-[var(--color-border)] object-cover"
                alt="avatar"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-light)] text-[var(--color-brand)]">
                <UserIcon size={24} weight="duotone" />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[var(--color-text)]">
                {session?.user.name || "Pemilik Toko"}
              </div>
              <div className="truncate text-xs text-[var(--color-text-2)]">
                {session?.user.email}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="danger-subtle"
            size="sm"
            leftIcon={<SignOutIcon size={16} weight="bold" />}
            onClick={onLogout}
          >
            Keluar dari Akun
          </Button>
        </div>
      </section>
    </div>
  );
}
