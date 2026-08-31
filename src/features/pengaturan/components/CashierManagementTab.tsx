import { useState } from "react";
import { Modal } from "#/components/Modal";
import {
  LockKeyIcon,
  CrownIcon,
  UsersIcon,
  PlusIcon,
  PencilSimpleIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  UserIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import type { Id } from "../../../../convex/_generated/dataModel";

interface CashierManagementTabProps {
  isOwner: boolean;
  onOpenOwnerAuth: () => void;
  cashiers: any[] | undefined;
  activeOwners: any[];
  newCashierName: string;
  setNewCashierName: (val: string) => void;
  newCashierPin: string;
  setNewCashierPin: (val: string) => void;
  newCashierRole: "cashier" | "manager" | "owner";
  setNewCashierRole: (val: "cashier" | "manager" | "owner") => void;
  isAddingCashier: boolean;
  onCreateCashier: (e: React.FormEvent) => void;
  editingCashier: any;
  setEditingCashier: (c: any) => void;
  editName: string;
  setEditName: (val: string) => void;
  editPin: string;
  setEditPin: (val: string) => void;
  editRole: "cashier" | "manager" | "owner";
  setEditRole: (val: "cashier" | "manager" | "owner") => void;
  isUpdatingCashier: boolean;
  onUpdateCashier: (e: React.FormEvent) => void;
  onOpenEditCashier: (cashier: any) => void;
  deletingCashier: { id: Id<"cashiers">; name: string } | null;
  setDeletingCashier: (target: { id: Id<"cashiers">; name: string } | null) => void;
  isDeletingCashier: boolean;
  onConfirmDeleteCashier: () => void;
}

export function CashierManagementTab({
  isOwner,
  onOpenOwnerAuth,
  cashiers,
  activeOwners,
  newCashierName,
  setNewCashierName,
  newCashierPin,
  setNewCashierPin,
  newCashierRole,
  setNewCashierRole,
  isAddingCashier,
  onCreateCashier,
  editingCashier,
  setEditingCashier,
  editName,
  setEditName,
  editPin,
  setEditPin,
  editRole,
  setEditRole,
  isUpdatingCashier,
  onUpdateCashier,
  onOpenEditCashier,
  deletingCashier,
  setDeletingCashier,
  isDeletingCashier,
  onConfirmDeleteCashier,
}: CashierManagementTabProps) {
  const [showNewCashierPin, setShowNewCashierPin] = useState(false);
  const [showEditPin, setShowEditPin] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return {
          label: "Pemilik (Owner)",
          bg: "rgba(234, 88, 12, 0.12)",
          color: "var(--color-brand)",
          border: "1px solid rgba(234, 88, 12, 0.25)",
          icon: CrownIcon,
        };
      case "manager":
        return {
          label: "Manajer Toko",
          bg: "rgba(14, 165, 233, 0.12)",
          color: "#0284c7",
          border: "1px solid rgba(14, 165, 233, 0.25)",
          icon: ShieldCheckIcon,
        };
      default:
        return {
          label: "Staf Kasir",
          bg: "var(--color-surface)",
          color: "var(--color-text-2)",
          border: "1px solid var(--color-border)",
          icon: UserIcon,
        };
    }
  };

  if (!isOwner) {
    return (
      <section className="bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-2)] border-1.5 border-dashed border-[var(--color-border)] rounded-3xl p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary-500/10 text-[var(--color-brand)] flex items-center justify-center mx-auto mb-4 border border-primary-500/20 shadow-md">
            <LockKeyIcon size={34} weight="bold" />
          </div>

          <div className="inline-block text-[11px] font-extrabold text-[var(--color-brand)] bg-[var(--color-brand-light)] px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
            FITUR TERPROTEKSI
          </div>

          <h2 className="text-xl font-black text-[var(--color-text)] tracking-tight mb-2">
            Akses Khusus Pemilik Toko
          </h2>
          <p className="text-xs text-[var(--color-text-2)] mb-6 leading-relaxed">
            Halaman penambahan, pengubahan peran, dan pengelolaan staf kasir diproteksi demi
            keamanan operasional toko Anda. Masukkan PIN Owner untuk membuka hak akses.
          </p>

          <button
            type="button"
            onClick={onOpenOwnerAuth}
            className="press-tactile py-3.5 px-7 rounded-full bg-[var(--color-brand)] text-white text-sm font-extrabold cursor-pointer inline-flex items-center gap-2 shadow-lg shadow-primary-500/30"
          >
            <CrownIcon size={18} weight="bold" />
            <span>Buka Kunci Akses Owner</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Add Cashier Form */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs">
        <h2 className="text-base font-extrabold text-[var(--color-text)] flex items-center gap-2 mb-4">
          <UsersIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Tambah Staf / Kasir Baru</span>
        </h2>

        <form onSubmit={onCreateCashier}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
                Nama Staf / Kasir
              </label>
              <input
                type="text"
                value={newCashierName}
                onChange={(e) => setNewCashierName(e.target.value)}
                placeholder="Contoh: Siti Rahma"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
                PIN Masuk (4 Digit)
              </label>
              <div className="relative flex items-center">
                <input
                  type={showNewCashierPin ? "text" : "password"}
                  maxLength={4}
                  value={newCashierPin}
                  onChange={(e) => setNewCashierPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  style={{ letterSpacing: showNewCashierPin ? "normal" : "0.2em" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewCashierPin(!showNewCashierPin)}
                  className="absolute right-3 text-[var(--color-text-3)] hover:text-[var(--color-text)] cursor-pointer"
                  aria-label={showNewCashierPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                >
                  {showNewCashierPin ? (
                    <EyeSlashIcon size={18} weight="bold" />
                  ) : (
                    <EyeIcon size={18} weight="bold" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
                Peran (Role)
              </label>
              <select
                value={newCashierRole}
                onChange={(e) => setNewCashierRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
              >
                <option value="cashier">Kasir (Buka/Tutup Kasir)</option>
                <option value="manager">Manager (Kelola Produk/Stok)</option>
                <option value="owner">Owner (Hak Akses Penuh)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAddingCashier}
            className="press-tactile w-full sm:w-auto px-6 py-2.5 rounded-full bg-[var(--color-brand)] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-primary-500/20 disabled:opacity-60"
          >
            <PlusIcon size={16} weight="bold" />
            <span>{isAddingCashier ? "Menyimpan Staf..." : "Tambahkan Staf"}</span>
          </button>
        </form>
      </section>

      {/* Cashiers List */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs">
        <h2 className="text-base font-extrabold text-[var(--color-text)] flex items-center gap-2 mb-4">
          <UsersIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Daftar Staf Kasir ({cashiers?.length ?? 0})</span>
        </h2>

        <div className="flex flex-col gap-2.5">
          {cashiers && cashiers.length > 0 ? (
            cashiers.map((c) => {
              const isLastOwner = c.role === "owner" && activeOwners.length <= 1;
              const badge = getRoleBadge(c.role || "cashier");
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={c._id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] gap-3 flex-wrap"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-base shrink-0"
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        border: badge.border,
                      }}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-[var(--color-text)] flex items-center gap-2 flex-wrap">
                        <span>{c.name}</span>
                        <span
                          className="text-[11px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                          style={{
                            color: badge.color,
                            background: badge.bg,
                            border: badge.border,
                          }}
                        >
                          <BadgeIcon size={12} weight="bold" />
                          <span>{badge.label}</span>
                        </span>
                      </div>
                      <div className="text-xs text-[var(--color-text-3)] flex items-center gap-2 mt-0.5">
                        <span>PIN: ••••</span>
                        {isLastOwner && (
                          <>
                            <span>•</span>
                            <span className="text-[var(--color-brand)] font-bold">
                              Owner Utama
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => onOpenEditCashier(c)}
                      className="press-tactile py-1.5 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[var(--color-surface-2)]"
                      title="Edit Staf / Ubah PIN"
                    >
                      <PencilSimpleIcon size={14} weight="bold" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLastOwner}
                      onClick={() => setDeletingCashier({ id: c._id, name: c.name })}
                      className="press-tactile py-1.5 px-2.5 rounded-[10px] border border-[var(--color-danger)]/30 text-xs font-bold flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--color-danger-light)] text-[var(--color-danger-text)]"
                      title={
                        isLastOwner
                          ? "Tidak dapat menghapus satu-satunya akun Owner toko"
                          : "Hapus Staf"
                      }
                    >
                      <TrashIcon size={16} weight="bold" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-xs text-[var(--color-text-3)]">
              Belum ada kasir tersimpan. Kasir utama default: PIN 1234 (Pemilik).
            </div>
          )}
        </div>
      </section>

      {/* Edit Cashier Modal */}
      {editingCashier && (
        <Modal onClose={() => !isUpdatingCashier && setEditingCashier(null)} maxWidth={420}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PencilSimpleIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
              <h3 className="text-lg font-extrabold text-[var(--color-text)] m-0">
                Ubah Data Staf / Kasir
              </h3>
            </div>

            <form onSubmit={onUpdateCashier}>
              <div className="mb-3.5">
                <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
                  Nama Staf / Kasir
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="mb-3.5">
                <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
                  PIN Masuk (4 Digit Angka Unik)
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showEditPin ? "text" : "password"}
                    maxLength={4}
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ""))}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    style={{ letterSpacing: showEditPin ? "normal" : "0.2em" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPin(!showEditPin)}
                    className="absolute right-3 text-[var(--color-text-3)] hover:text-[var(--color-text)] cursor-pointer"
                    aria-label={showEditPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                  >
                    {showEditPin ? (
                      <EyeSlashIcon size={18} weight="bold" />
                    ) : (
                      <EyeIcon size={18} weight="bold" />
                    )}
                  </button>
                </div>
                <span className="text-[11px] text-[var(--color-text-3)] mt-1 block">
                  Pastikan PIN tidak sama dengan staf lain agar akun tidak tertukar.
                </span>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
                  Peran (Role)
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
                >
                  <option value="cashier">Kasir (Buka/Tutup Kasir)</option>
                  <option value="manager">Manager (Kelola Produk/Stok)</option>
                  <option value="owner">Owner (Hak Akses Penuh)</option>
                </select>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingCashier(null)}
                  disabled={isUpdatingCashier}
                  className="press-tactile flex-1 py-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] text-xs font-extrabold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingCashier}
                  className="press-tactile flex-1.5 py-3 rounded-full bg-[var(--color-brand)] text-white text-xs font-extrabold cursor-pointer shadow-md shadow-primary-500/20 disabled:opacity-60"
                >
                  {isUpdatingCashier ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Delete Cashier Confirmation Modal */}
      {deletingCashier && (
        <Modal onClose={() => !isDeletingCashier && setDeletingCashier(null)} maxWidth={400}>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--color-danger-light)] border border-[var(--color-danger)]/30 text-[var(--color-danger-text)] flex items-center justify-center mx-auto mb-4">
              <WarningCircleIcon size={32} weight="bold" />
            </div>

            <h3 className="text-lg font-black text-[var(--color-text)] m-0 mb-2">
              Hapus Staf Kasir?
            </h3>
            <p className="text-xs text-[var(--color-text-2)] mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus staf{" "}
              <strong className="text-[var(--color-text)] font-extrabold">
                "{deletingCashier.name}"
              </strong>
              ? Staf ini tidak akan dapat login lagi menggunakan PIN sebelumnya.
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingCashier(null)}
                disabled={isDeletingCashier}
                className="press-tactile flex-1 py-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] text-xs font-extrabold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirmDeleteCashier}
                disabled={isDeletingCashier}
                className="press-tactile flex-1.2 py-3 rounded-full bg-[var(--color-danger)] text-white text-xs font-extrabold cursor-pointer shadow-md shadow-danger-500/30 disabled:opacity-60"
              >
                {isDeletingCashier ? "Menghapus..." : "Ya, Hapus Staf"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
