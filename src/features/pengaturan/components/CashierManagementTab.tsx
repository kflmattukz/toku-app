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
import { Select, Button, type SelectOption } from "#/components/ui";
import type { Id } from "../../../../convex/_generated/dataModel";

const ROLE_OPTIONS: SelectOption<"cashier" | "manager" | "owner">[] = [
  {
    value: "cashier",
    label: "Kasir",
    description: "Buka/Tutup Kasir & Transaksi POS",
    icon: <UserIcon size={16} weight="duotone" className="text-emerald-600" />,
    badge: (
      <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-600">
        Kasir
      </span>
    ),
  },
  {
    value: "manager",
    label: "Manager",
    description: "Kelola Produk, Stok & Laporan",
    icon: <ShieldCheckIcon size={16} weight="duotone" className="text-blue-600" />,
    badge: (
      <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-extrabold text-blue-600">
        Manager
      </span>
    ),
  },
  {
    value: "owner",
    label: "Owner",
    description: "Hak Akses Penuh & Pengaturan Toko",
    icon: <CrownIcon size={16} weight="duotone" className="text-amber-600" />,
    badge: (
      <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-600">
        Owner
      </span>
    ),
  },
];

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
      <section className="border-1.5 rounded-3xl border-dashed border-[var(--color-border)] bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-2)] p-12 text-center">
        <div className="mx-auto max-w-md">
          <div className="bg-primary-500/10 border-primary-500/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border text-[var(--color-brand)] shadow-md">
            <LockKeyIcon size={34} weight="bold" />
          </div>

          <div className="mb-2 inline-block rounded-full bg-[var(--color-brand-light)] px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-[var(--color-brand)] uppercase">
            FITUR TERPROTEKSI
          </div>

          <h2 className="mb-2 text-xl font-black tracking-tight text-[var(--color-text)]">
            Akses Khusus Pemilik Toko
          </h2>
          <p className="mb-6 text-xs leading-relaxed text-[var(--color-text-2)]">
            Halaman penambahan, pengubahan peran, dan pengelolaan staf kasir diproteksi demi
            keamanan operasional toko Anda. Masukkan PIN Owner untuk membuka hak akses.
          </p>

          <button
            type="button"
            onClick={onOpenOwnerAuth}
            className="press-tactile shadow-primary-500/30 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[var(--color-brand)] px-7 py-3.5 text-sm font-extrabold text-white shadow-lg"
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
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
        <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-[var(--color-text)]">
          <UsersIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Tambah Staf / Kasir Baru</span>
        </h2>

        <form onSubmit={onCreateCashier}>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                Nama Staf / Kasir
              </label>
              <input
                type="text"
                value={newCashierName}
                onChange={(e) => setNewCashierName(e.target.value)}
                placeholder="Contoh: Siti Rahma"
                required
                className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
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
                  className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pr-10 pl-3.5 text-sm font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
                  style={{ letterSpacing: showNewCashierPin ? "normal" : "0.2em" }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewCashierPin(!showNewCashierPin)}
                  className="absolute right-3 cursor-pointer text-[var(--color-text-3)] hover:text-[var(--color-text)]"
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
              <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                Peran (Role)
              </label>
              <Select<"cashier" | "manager" | "owner">
                value={newCashierRole}
                onChange={(val) => setNewCashierRole(val)}
                options={ROLE_OPTIONS}
                variant="form"
                size="md"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isAddingCashier}
            loadingText="Menyimpan Staf..."
            leftIcon={<PlusIcon size={16} weight="bold" />}
            className="w-full sm:w-auto"
          >
            Tambahkan Staf
          </Button>
        </form>
      </section>

      {/* Cashiers List */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
        <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-[var(--color-text)]">
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
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-extrabold"
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        border: badge.border,
                      }}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-[var(--color-text)]">
                        <span>{c.name}</span>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold"
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
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-text-3)]">
                        <span>PIN: ••••</span>
                        {isLastOwner && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-[var(--color-brand)]">Owner Utama</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenEditCashier(c)}
                      className="press-tactile flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                      title="Edit Staf / Ubah PIN"
                    >
                      <PencilSimpleIcon size={14} weight="bold" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLastOwner}
                      onClick={() => setDeletingCashier({ id: c._id, name: c.name })}
                      className="press-tactile flex cursor-pointer items-center justify-center rounded-[10px] border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-danger-text)] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
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
            <div className="py-6 text-center text-xs text-[var(--color-text-3)]">
              Belum ada kasir tersimpan. Kasir utama default: PIN 1234 (Pemilik).
            </div>
          )}
        </div>
      </section>

      {/* Edit Cashier Modal */}
      {editingCashier && (
        <Modal onClose={() => !isUpdatingCashier && setEditingCashier(null)} maxWidth={420}>
          <div>
            <div className="mb-4 flex items-center gap-2">
              <PencilSimpleIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
              <h3 className="m-0 text-lg font-extrabold text-[var(--color-text)]">
                Ubah Data Staf / Kasir
              </h3>
            </div>

            <form onSubmit={onUpdateCashier}>
              <div className="mb-3.5">
                <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                  Nama Staf / Kasir
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
                />
              </div>

              <div className="mb-3.5">
                <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                  PIN Masuk (4 Digit Angka Unik)
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showEditPin ? "text" : "password"}
                    maxLength={4}
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ""))}
                    required
                    className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pr-10 pl-3.5 text-sm font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
                    style={{ letterSpacing: showEditPin ? "normal" : "0.2em" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPin(!showEditPin)}
                    className="absolute right-3 cursor-pointer text-[var(--color-text-3)] hover:text-[var(--color-text)]"
                    aria-label={showEditPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                  >
                    {showEditPin ? (
                      <EyeSlashIcon size={18} weight="bold" />
                    ) : (
                      <EyeIcon size={18} weight="bold" />
                    )}
                  </button>
                </div>
                <span className="mt-1 block text-[11px] text-[var(--color-text-3)]">
                  Pastikan PIN tidak sama dengan staf lain agar akun tidak tertukar.
                </span>
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                  Peran (Role)
                </label>
                <Select<"cashier" | "manager" | "owner">
                  value={editRole}
                  onChange={(val) => setEditRole(val)}
                  options={ROLE_OPTIONS}
                  variant="form"
                  size="md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setEditingCashier(null)}
                  disabled={isUpdatingCashier}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  loading={isUpdatingCashier}
                  loadingText="Menyimpan..."
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Delete Cashier Confirmation Modal */}
      {deletingCashier && (
        <Modal onClose={() => !isDeletingCashier && setDeletingCashier(null)} maxWidth={400}>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger-text)]">
              <WarningCircleIcon size={32} weight="bold" />
            </div>

            <h3 className="m-0 mb-2 text-lg font-black text-[var(--color-text)]">
              Hapus Staf Kasir?
            </h3>
            <p className="mb-5 text-xs leading-relaxed text-[var(--color-text-2)]">
              Apakah Anda yakin ingin menghapus staf{" "}
              <strong className="font-extrabold text-[var(--color-text)]">
                "{deletingCashier.name}"
              </strong>
              ? Staf ini tidak akan dapat login lagi menggunakan PIN sebelumnya.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setDeletingCashier(null)}
                disabled={isDeletingCashier}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                fullWidth
                onClick={onConfirmDeleteCashier}
                loading={isDeletingCashier}
                loadingText="Menghapus..."
              >
                Ya, Hapus Staf
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
