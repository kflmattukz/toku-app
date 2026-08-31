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
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs">
        <h2 className="text-base font-extrabold text-[var(--color-text)] flex items-center gap-2 mb-4">
          <StorefrontIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Informasi Usaha</span>
        </h2>

        <form onSubmit={onSave}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
                Nama Toko / Bisnis
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
                Nama Cabang Ini
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Contoh: Pusat, Cabang Kemang"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
              Kategori Usaha UMKM
            </label>
            <CategorySelectPicker value={category} onChange={setCategory} />
            <span className="text-[11px] text-[var(--color-text-3)] mt-1.5 block">
              Kategori menentukan klasifikasi profil bisnis dan rekomendasi fitur untuk toko Anda.
            </span>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
              Alamat Toko (Dicetak pada Struk)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Merdeka No. 45, Jakarta"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-[var(--color-text)] mb-2 flex items-center gap-1.5">
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
                className="w-36 px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              <span className="text-xs text-[var(--color-text-2)] font-semibold">Unit / Pcs</span>
            </div>
            <span className="text-[11px] text-[var(--color-text-3)] mt-1.5 block">
              Sistem kasir otomatis menandai produk berstatus merah jika sisa stok di bawah angka ini.
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`press-tactile w-full sm:w-auto px-7 py-3 rounded-full text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
              saved
                ? "bg-[var(--color-success)] shadow-emerald-500/20"
                : "bg-[var(--color-brand)] shadow-primary-500/30"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {saved ? (
              <>
                <CheckIcon size={18} weight="bold" />
                <span>Tersimpan!</span>
              </>
            ) : saving ? (
              "Menyimpan..."
            ) : (
              "Simpan Perubahan Toko"
            )}
          </button>
        </form>
      </section>

      {/* Appearance */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs">
        <h2 className="text-base font-extrabold text-[var(--color-text)] flex items-center gap-2 mb-4">
          <PaletteIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Tampilan Aplikasi</span>
        </h2>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
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
              <div className="text-xs text-[var(--color-text-2)] mt-0.5">
                Nuansa OLED gelap kontras tinggi, nyaman di mata saat shift malam
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            className={`press-tactile w-14 h-8 rounded-full border-none cursor-pointer relative transition-all shrink-0 ${
              dark ? "bg-[var(--color-brand)] shadow-sm shadow-primary-500/40" : "bg-[var(--color-border)]"
            }`}
          >
            <div
              className={`w-6.5 h-6.5 rounded-full bg-white absolute top-0.5 transition-all shadow-xs ${
                dark ? "left-7" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Account */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs">
        <h2 className="text-base font-extrabold text-[var(--color-text)] flex items-center gap-2 mb-4">
          <UserIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Akun Pengguna & Sesi</span>
        </h2>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5 min-w-0">
            {session?.user.image ? (
              <img
                src={session.user.image}
                className="w-12 h-12 rounded-2xl border-2 border-[var(--color-border)] object-cover shrink-0"
                alt="avatar"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-light)] text-[var(--color-brand)] flex items-center justify-center shrink-0">
                <UserIcon size={24} weight="duotone" />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[var(--color-text)]">
                {session?.user.name || "Pemilik Toko"}
              </div>
              <div className="text-xs text-[var(--color-text-2)] truncate">
                {session?.user.email}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="press-tactile py-2.5 px-4.5 border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger-text)] rounded-full font-extrabold text-xs cursor-pointer inline-flex items-center gap-2"
          >
            <SignOutIcon size={16} weight="bold" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </section>
    </div>
  );
}
