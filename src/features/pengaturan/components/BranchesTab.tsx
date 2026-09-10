import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  BuildingsIcon,
  PlusIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button } from "#/components/ui";
import { Modal } from "#/components/Modal";
import { CashierLockModal } from "#/components/CashierLockModal";
import type { Id } from "../../../../convex/_generated/dataModel";

interface BranchesTabProps {
  currentStoreId: Id<"stores">;
  userStores: any[] | undefined;
  onSelectStore: (storeId: Id<"stores">) => void;
  isAddingBranch: boolean;
  onCreateBranch: (values: { name: string; address?: string }) => Promise<void> | void;
  isUpdatingBranch?: boolean;
  onUpdateBranch: (
    storeId: Id<"stores">,
    values: { branchName: string; address?: string },
  ) => Promise<void> | void;
  isDeletingBranch?: boolean;
  onDeleteBranch: (storeId: Id<"stores">) => Promise<void> | void;
}

export function BranchesTab({
  currentStoreId,
  userStores,
  onSelectStore,
  isAddingBranch,
  onCreateBranch,
  isUpdatingBranch = false,
  onUpdateBranch,
  isDeletingBranch = false,
  onDeleteBranch,
}: BranchesTabProps) {
  const [isShaking, setIsShaking] = useState(false);
  const [isEditShaking, setIsEditShaking] = useState(false);

  // Edit Branch State
  const [editingStore, setEditingStore] = useState<any | null>(null);

  // Delete Branch State
  const [deletingStore, setDeletingStore] = useState<any | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);

  // Add Branch Form
  const addForm = useForm({
    defaultValues: {
      name: "",
      address: "",
    },
    onSubmit: async ({ value }) => {
      const trimmedName = value.name.trim();
      if (!trimmedName || trimmedName.length < 2) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 350);
        return;
      }
      await onCreateBranch({
        name: trimmedName,
        address: value.address.trim() || undefined,
      });
      addForm.reset();
    },
  });

  // Edit Branch Form
  const editForm = useForm({
    defaultValues: {
      branchName: editingStore?.branchName || "",
      address: editingStore?.address || "",
    },
    onSubmit: async ({ value }) => {
      if (!editingStore) return;
      const trimmedBranch = value.branchName.trim();
      if (!trimmedBranch || trimmedBranch.length < 2) {
        setIsEditShaking(true);
        setTimeout(() => setIsEditShaking(false), 350);
        return;
      }
      await onUpdateBranch(editingStore._id, {
        branchName: trimmedBranch,
        address: value.address.trim() || undefined,
      });
      setEditingStore(null);
    },
  });

  const handleOpenEdit = (store: any) => {
    setEditingStore(store);
    editForm.reset({
      branchName: store.branchName || "",
      address: store.address || "",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Add Branch Form */}
      <section
        className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs transition-transform ${
          isShaking ? "animate-shake" : ""
        }`}
      >
        <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-[var(--color-text)]">
          <BuildingsIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Tambah Cabang Baru</span>
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
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <addForm.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  if (!value.trim()) return "Nama cabang wajib diisi";
                  if (value.trim().length < 2) return "Nama cabang minimal 2 karakter";
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
                      Nama Cabang
                    </label>
                    <input
                      type="text"
                      name="toku_new_branch_name"
                      autoComplete="off"
                      data-1p-ignore
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Contoh: Cabang Boulevard"
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

            <addForm.Field name="address">
              {(field) => (
                <div>
                  <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                    Alamat Cabang (Opsional)
                  </label>
                  <input
                    type="text"
                    name="toku_new_branch_address"
                    autoComplete="off"
                    data-1p-ignore
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Jl. Boulevard Barat Blok A"
                    className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
                  />
                </div>
              )}
            </addForm.Field>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isAddingBranch}
            loadingText="Menyimpan Cabang..."
            leftIcon={<PlusIcon size={16} weight="bold" />}
            className="w-full sm:w-auto"
          >
            Buat Cabang Baru
          </Button>
        </form>
      </section>

      {/* Branches List */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs">
        <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-[var(--color-text)]">
          <BuildingsIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Daftar Cabang Aktif ({userStores?.length ?? 0})</span>
        </h2>

        <div className="flex flex-col gap-2.5">
          {userStores && userStores.length > 0
            ? userStores.map((st) => {
                const isCurrent = currentStoreId === st._id;
                const isOnlyBranch = (userStores?.length ?? 0) <= 1;
                const canDelete = !st.isMainBranch && !isOnlyBranch;

                return (
                  <div
                    key={st._id}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                      isCurrent
                        ? "border-[var(--color-brand)] bg-[var(--color-brand-light)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface-2)]"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                          isCurrent
                            ? "border-transparent bg-[var(--color-brand)] text-white"
                            : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-brand)]"
                        }`}
                      >
                        <BuildingsIcon size={20} weight="bold" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-[var(--color-text)]">
                          {st.name} —{" "}
                          <span className="text-[var(--color-brand)]">
                            {st.branchName || "Pusat"}
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-[var(--color-text-3)]">
                          {st.address || "Alamat belum diatur"}{" "}
                          {st.isMainBranch && "• (Cabang Utama)"}
                        </div>
                      </div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-brand)] bg-[var(--color-surface)] px-3 py-1 text-[11px] font-extrabold text-[var(--color-brand)]">
                          <CheckCircleIcon size={14} weight="fill" />
                          <span>Sedang Digunakan</span>
                        </span>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          size="xs"
                          onClick={() => onSelectStore(st._id)}
                        >
                          Beralih ke Cabang Ini
                        </Button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(st)}
                        className="press-tactile flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                        title="Edit Cabang"
                      >
                        <PencilSimpleIcon size={14} weight="bold" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        disabled={!canDelete}
                        onClick={() => setDeletingStore(st)}
                        className="press-tactile flex cursor-pointer items-center justify-center rounded-[10px] border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-danger-text)] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                        title={
                          st.isMainBranch
                            ? "Cabang utama tidak dapat dihapus"
                            : isOnlyBranch
                              ? "Tidak dapat menghapus satu-satunya cabang toko"
                              : "Hapus Cabang"
                        }
                      >
                        <TrashIcon size={15} weight="bold" />
                      </button>
                    </div>
                  </div>
                );
              })
            : null}
        </div>
      </section>

      {/* Edit Branch Modal */}
      {editingStore && (
        <Modal onClose={() => !isUpdatingBranch && setEditingStore(null)} maxWidth={420}>
          <div>
            <div className="mb-4 flex items-center gap-2">
              <PencilSimpleIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
              <h3 className="m-0 text-lg font-extrabold text-[var(--color-text)]">
                Ubah Informasi Cabang
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
                  name="branchName"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value.trim()) return "Nama cabang wajib diisi";
                      if (value.trim().length < 2) return "Nama cabang minimal 2 karakter";
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
                          Nama Cabang
                        </label>
                        <input
                          type="text"
                          name="toku_edit_branch_name"
                          autoComplete="off"
                          data-1p-ignore
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Contoh: Cabang Boulevard"
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

              <div className="mb-5">
                <editForm.Field name="address">
                  {(field) => (
                    <div>
                      <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
                        Alamat Cabang (Opsional)
                      </label>
                      <input
                        type="text"
                        name="toku_edit_branch_address"
                        autoComplete="off"
                        data-1p-ignore
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Jl. Boulevard Barat Blok A"
                        className="focus:ring-primary-500/20 focus:border-primary-500 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-text)] focus:ring-2 focus:outline-none"
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
                  onClick={() => setEditingStore(null)}
                  disabled={isUpdatingBranch}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  loading={isUpdatingBranch}
                  loadingText="Menyimpan..."
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Delete Branch Warning Modal */}
      {deletingStore && !showPinModal && (
        <Modal onClose={() => !isDeletingBranch && setDeletingStore(null)} maxWidth={420}>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger-text)]">
              <WarningCircleIcon size={32} weight="bold" />
            </div>

            <h3 className="m-0 mb-2 text-lg font-black text-[var(--color-text)]">
              Hapus Cabang {deletingStore.branchName || deletingStore.name}?
            </h3>
            <p className="mb-4 text-xs leading-relaxed text-[var(--color-text-2)]">
              Tindakan ini permanen. Semua data produk, transaksi POS, staf kasir, shift, dan
              pengeluaran pada cabang ini akan dihapus secara permanen dari sistem.
            </p>

            <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-left text-xs font-semibold text-rose-600 dark:text-rose-400">
              ⚠️ Diperlukan verifikasi PIN Pemilik Toko (Owner) untuk menyelesaikan proses
              penghapusan cabang ini.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setDeletingStore(null)}
                disabled={isDeletingBranch}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                fullWidth
                onClick={() => setShowPinModal(true)}
                disabled={isDeletingBranch}
              >
                Lanjutkan Verifikasi
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Owner PIN Verification Modal */}
      {showPinModal && deletingStore && (
        <CashierLockModal
          isOpen={showPinModal}
          onClose={() => setShowPinModal(false)}
          storeId={currentStoreId}
          requiredRole="owner"
          title="Verifikasi PIN Owner untuk Hapus Cabang"
          onSuccess={async () => {
            setShowPinModal(false);
            if (deletingStore) {
              await onDeleteBranch(deletingStore._id);
              setDeletingStore(null);
            }
          }}
        />
      )}
    </div>
  );
}
