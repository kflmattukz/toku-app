import { useState } from "react";
import { useForm } from "@tanstack/react-form";
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
  isAddingCashier: boolean;
  onCreateCashier: (data: {
    name: string;
    pin: string;
    role: "cashier" | "manager" | "owner";
  }) => Promise<void> | void;
  editingCashier: any;
  setEditingCashier: (c: any) => void;
  isUpdatingCashier: boolean;
  onUpdateCashier: (
    id: Id<"cashiers">,
    data: { name: string; pin: string; role: "cashier" | "manager" | "owner" },
  ) => Promise<void> | void;
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
  isAddingCashier,
  onCreateCashier,
  editingCashier,
  setEditingCashier,
  isUpdatingCashier,
  onUpdateCashier,
  deletingCashier,
  setDeletingCashier,
  isDeletingCashier,
  onConfirmDeleteCashier,
}: CashierManagementTabProps) {
  const [showNewCashierPin, setShowNewCashierPin] = useState(false);
  const [showEditPin, setShowEditPin] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isEditShaking, setIsEditShaking] = useState(false);

  const addForm = useForm({
    defaultValues: {
      name: "",
      pin: "",
      role: "cashier" as "cashier" | "manager" | "owner",
    },
    onSubmit: async ({ value }) => {
      const trimmedName = value.name.trim();
      if (!trimmedName || trimmedName.length < 2 || !/^\d{4}$/.test(value.pin) || !value.role) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 350);
        return;
      }
      await onCreateCashier({
        name: trimmedName,
        pin: value.pin,
        role: value.role,
      });
      addForm.reset();
    },
  });

  const editForm = useForm({
    defaultValues: {
      name: editingCashier?.name || "",
      pin: editingCashier?.pin || "",
      role: (editingCashier?.role || "cashier") as "cashier" | "manager" | "owner",
    },
    onSubmit: async ({ value }) => {
      if (!editingCashier) return;
      const trimmedName = value.name.trim();
      if (!trimmedName || trimmedName.length < 2 || !/^\d{4}$/.test(value.pin) || !value.role) {
        setIsEditShaking(true);
        setTimeout(() => setIsEditShaking(false), 350);
        return;
      }
      await onUpdateCashier(editingCashier._id, {
        name: trimmedName,
        pin: value.pin,
        role: value.role,
      });
    },
  });

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
      <section
        className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs transition-transform ${
          isShaking ? "animate-shake" : ""
        }`}
      >
        <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-[var(--color-text)]">
          <UsersIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Tambah Staf / Kasir Baru</span>
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addForm.handleSubmit();
          }}
          noValidate
          autoComplete="off"
        >
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <addForm.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  if (!value.trim()) return "Nama staf wajib diisi";
                  if (value.trim().length < 2) return "Nama staf minimal 2 karakter";
                  return undefined;
                },
              }}
            >
              {(field) => {
                const errorMsg = field.state.meta.errors[0];
                const isInvalid = Boolean(field.state.meta.isTouched && errorMsg);
                return (
                  <div>
                    <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                      Nama Staf / Kasir
                    </label>
                    <input
                      type="text"
                      name="toku_new_cashier_name"
                      autoComplete="off"
                      data-1p-ignore
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Contoh: Siti Rahma"
                      className={`w-full rounded-xl border bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-text)] transition-colors focus:ring-2 focus:outline-none ${
                        isInvalid
                          ? "border-rose-500 bg-rose-500/5 focus:border-rose-500 focus:ring-rose-500/20"
                          : "border-[var(--color-border)] focus:border-primary-500 focus:ring-primary-500/20"
                      }`}
                    />
                    {isInvalid && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                        <WarningCircleIcon size={13} weight="fill" />
                        <span>{errorMsg}</span>
                      </p>
                    )}
                  </div>
                );
              }}
            </addForm.Field>

            <addForm.Field
              name="pin"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return "PIN 4 digit wajib diisi";
                  if (!/^\d{4}$/.test(value)) return "PIN harus tepat 4 digit angka";
                  return undefined;
                },
              }}
            >
              {(field) => {
                const errorMsg = field.state.meta.errors[0];
                const isInvalid = Boolean(field.state.meta.isTouched && errorMsg);
                return (
                  <div>
                    <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                      PIN Masuk (4 Digit)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showNewCashierPin ? "text" : "password"}
                        name="toku_new_cashier_pin"
                        autoComplete="new-password"
                        data-1p-ignore
                        maxLength={4}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••"
                        className={`w-full rounded-xl border bg-[var(--color-surface)] py-2.5 pr-10 pl-3.5 text-sm font-medium text-[var(--color-text)] transition-colors focus:ring-2 focus:outline-none ${
                          isInvalid
                            ? "border-rose-500 bg-rose-500/5 focus:border-rose-500 focus:ring-rose-500/20"
                            : "border-[var(--color-border)] focus:border-primary-500 focus:ring-primary-500/20"
                        }`}
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
                    {isInvalid && (
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                        <WarningCircleIcon size={13} weight="fill" />
                        <span>{errorMsg}</span>
                      </p>
                    )}
                  </div>
                );
              }}
            </addForm.Field>

            <addForm.Field name="role">
              {(field) => (
                <div>
                  <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                    Peran (Role)
                  </label>
                  <Select<"cashier" | "manager" | "owner">
                    value={field.state.value}
                    onChange={(val) => field.handleChange(val)}
                    options={ROLE_OPTIONS}
                    variant="form"
                    size="md"
                  />
                </div>
              )}
            </addForm.Field>
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
          <span>Daftar Staf Aktif ({cashiers?.length ?? 0})</span>
        </h2>

        <div className="flex flex-col gap-2.5">
          {cashiers && cashiers.length > 0 ? (
            cashiers.map((c) => {
              const badge = getRoleBadge(c.role || "cashier");
              const isLastOwner = c.role === "owner" && activeOwners.length <= 1;

              return (
                <div
                  key={c._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-[var(--color-brand)]"
                      style={{
                        background: badge.bg,
                        borderColor: badge.border,
                        color: badge.color,
                      }}
                    >
                      <badge.icon size={20} weight="duotone" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-[var(--color-text)]">
                        {c.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-3)]">
                        <span style={{ color: badge.color }} className="font-bold">
                          {badge.label}
                        </span>
                        {c.role === "owner" && (
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
                      onClick={() => {
                        setEditingCashier(c);
                        editForm.reset({
                          name: c.name || "",
                          pin: c.pin || "",
                          role: c.role || "cashier",
                        });
                      }}
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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                editForm.handleSubmit();
              }}
              noValidate
              autoComplete="off"
              className={isEditShaking ? "animate-shake" : ""}
            >
              <div className="mb-3.5">
                <editForm.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value.trim()) return "Nama staf wajib diisi";
                      if (value.trim().length < 2) return "Nama staf minimal 2 karakter";
                      return undefined;
                    },
                  }}
                >
                  {(field) => {
                    const errorMsg = field.state.meta.errors[0];
                    const isInvalid = Boolean(field.state.meta.isTouched && errorMsg);
                    return (
                      <div>
                        <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                          Nama Staf / Kasir
                        </label>
                        <input
                          type="text"
                          name="toku_edit_cashier_name"
                          autoComplete="off"
                          data-1p-ignore
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={`w-full rounded-xl border bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-text)] transition-colors focus:ring-2 focus:outline-none ${
                            isInvalid
                              ? "border-rose-500 bg-rose-500/5 focus:border-rose-500 focus:ring-rose-500/20"
                              : "border-[var(--color-border)] focus:border-primary-500 focus:ring-primary-500/20"
                          }`}
                        />
                        {isInvalid && (
                          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                            <WarningCircleIcon size={13} weight="fill" />
                            <span>{errorMsg}</span>
                          </p>
                        )}
                      </div>
                    );
                  }}
                </editForm.Field>
              </div>

              <div className="mb-3.5">
                <editForm.Field
                  name="pin"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) return "PIN 4 digit wajib diisi";
                      if (!/^\d{4}$/.test(value)) return "PIN harus tepat 4 digit angka";
                      return undefined;
                    },
                  }}
                >
                  {(field) => {
                    const errorMsg = field.state.meta.errors[0];
                    const isInvalid = Boolean(field.state.meta.isTouched && errorMsg);
                    return (
                      <div>
                        <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                          PIN Masuk (4 Digit Angka Unik)
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showEditPin ? "text" : "password"}
                            name="toku_edit_cashier_pin"
                            autoComplete="new-password"
                            data-1p-ignore
                            maxLength={4}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ""))}
                            className={`w-full rounded-xl border bg-[var(--color-surface)] py-2.5 pr-10 pl-3.5 text-sm font-medium text-[var(--color-text)] transition-colors focus:ring-2 focus:outline-none ${
                              isInvalid
                                ? "border-rose-500 bg-rose-500/5 focus:border-rose-500 focus:ring-rose-500/20"
                                : "border-[var(--color-border)] focus:border-primary-500 focus:ring-primary-500/20"
                            }`}
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
                        {isInvalid ? (
                          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                            <WarningCircleIcon size={13} weight="fill" />
                            <span>{errorMsg}</span>
                          </p>
                        ) : (
                          <span className="mt-1 block text-[11px] text-[var(--color-text-3)]">
                            Pastikan PIN tidak sama dengan staf lain agar akun tidak tertukar.
                          </span>
                        )}
                      </div>
                    );
                  }}
                </editForm.Field>
              </div>

              <div className="mb-5">
                <editForm.Field name="role">
                  {(field) => (
                    <div>
                      <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                        Peran (Role)
                      </label>
                      <Select<"cashier" | "manager" | "owner">
                        value={field.state.value}
                        onChange={(val) => field.handleChange(val)}
                        options={ROLE_OPTIONS}
                        variant="form"
                        size="md"
                      />
                    </div>
                  )}
                </editForm.Field>
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
