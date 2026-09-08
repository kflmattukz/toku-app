import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { BuildingsIcon, PlusIcon, CheckCircleIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { Button } from "#/components/ui";
import type { Id } from "../../../../convex/_generated/dataModel";

interface BranchesTabProps {
  currentStoreId: Id<"stores">;
  userStores: any[] | undefined;
  onSelectStore: (storeId: Id<"stores">) => void;
  isAddingBranch: boolean;
  onCreateBranch: (values: { name: string; address?: string }) => Promise<void> | void;
}

export function BranchesTab({
  currentStoreId,
  userStores,
  onSelectStore,
  isAddingBranch,
  onCreateBranch,
}: BranchesTabProps) {
  const [isShaking, setIsShaking] = useState(false);

  const form = useForm({
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
      form.reset();
    },
  });

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
            form.handleSubmit();
          }}
          noValidate
          autoComplete="off"
        >
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.Field
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
            </form.Field>

            <form.Field name="address">
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
            </form.Field>
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

                    {isCurrent ? (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-[var(--color-brand)] bg-[var(--color-surface)] px-3 py-1 text-[11px] font-extrabold text-[var(--color-brand)]">
                        <CheckCircleIcon size={14} weight="fill" />
                        <span>Sedang Digunakan</span>
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        size="xs"
                        onClick={() => onSelectStore(st._id)}
                        className="ml-auto"
                      >
                        Beralih ke Cabang Ini
                      </Button>
                    )}
                  </div>
                );
              })
            : null}
        </div>
      </section>
    </div>
  );
}
