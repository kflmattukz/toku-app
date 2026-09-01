import React from "react";
import {
  StorefrontIcon,
  BellRingingIcon,
  CheckIcon,
  PaletteIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { Button } from "#/components/ui";
import { CategorySelectPicker } from "./CategorySelectPicker";

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
  saving: boolean;
  saved: boolean;
  onSave: (e: React.FormEvent) => void;
  dark: boolean;
  onToggleDark: () => void;
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
  saving,
  saved,
  onSave,
  dark,
  onToggleDark,
  session,
  onLogout,
}: StoreProfileTabProps) {
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
            <label className="mb-2 block flex items-center gap-1.5 text-xs font-bold text-[var(--color-text)]">
              <BellRingingIcon size={16} weight="bold" className="text-[var(--color-brand)]" />
              <span>Batas Peringatan Stok Menipis (Auto Restock Alert)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="1000"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
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

      {/* Appearance */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
        <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-[var(--color-text)]">
          <PaletteIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Tampilan Aplikasi</span>
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]">
              {dark ? (
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
            type="button"
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            className={`press-tactile relative h-8 w-14 shrink-0 cursor-pointer rounded-full border-none transition-all ${
              dark
                ? "shadow-primary-500/40 bg-[var(--color-brand)] shadow-sm"
                : "bg-[var(--color-border)]"
            }`}
          >
            <div
              className={`absolute top-0.5 h-6.5 w-6.5 rounded-full bg-white shadow-xs transition-all ${
                dark ? "left-7" : "left-0.5"
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
