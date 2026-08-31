import {
  BuildingsIcon,
  PlusIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import type { Id } from "../../../../convex/_generated/dataModel";

interface BranchesTabProps {
  currentStoreId: Id<"stores">;
  userStores: any[] | undefined;
  onSelectStore: (storeId: Id<"stores">) => void;
  newBranchName: string;
  setNewBranchName: (val: string) => void;
  newBranchAddress: string;
  setNewBranchAddress: (val: string) => void;
  isAddingBranch: boolean;
  onCreateBranch: (e: React.FormEvent) => void;
}

export function BranchesTab({
  currentStoreId,
  userStores,
  onSelectStore,
  newBranchName,
  setNewBranchName,
  newBranchAddress,
  setNewBranchAddress,
  isAddingBranch,
  onCreateBranch,
}: BranchesTabProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Add Branch Form */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs">
        <h2 className="text-base font-extrabold text-[var(--color-text)] flex items-center gap-2 mb-4">
          <BuildingsIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Tambah Cabang Baru</span>
        </h2>

        <form onSubmit={onCreateBranch}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
                Nama Cabang
              </label>
              <input
                type="text"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="Contoh: Cabang Boulevard"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
                Alamat Cabang (Opsional)
              </label>
              <input
                type="text"
                value={newBranchAddress}
                onChange={(e) => setNewBranchAddress(e.target.value)}
                placeholder="Jl. Boulevard Barat Blok A"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAddingBranch}
            className="press-tactile w-full sm:w-auto px-6 py-2.5 rounded-full bg-[var(--color-brand)] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-primary-500/20 disabled:opacity-60"
          >
            <PlusIcon size={16} weight="bold" />
            <span>{isAddingBranch ? "Menyimpan Cabang..." : "Buat Cabang Baru"}</span>
          </button>
        </form>
      </section>

      {/* Branches List */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-xs">
        <h2 className="text-base font-extrabold text-[var(--color-text)] flex items-center gap-2 mb-4">
          <BuildingsIcon size={20} weight="bold" className="text-[var(--color-brand)]" />
          <span>Daftar Cabang Aktif ({userStores?.length ?? 0})</span>
        </h2>

        <div className="flex flex-col gap-2.5">
          {userStores && userStores.length > 0 ? (
            userStores.map((st) => {
              const isCurrent = currentStoreId === st._id;
              return (
                <div
                  key={st._id}
                  className={`flex items-center justify-between p-3.5 rounded-xl gap-3 flex-wrap transition-all border ${
                    isCurrent
                      ? "bg-[var(--color-brand-light)] border-[var(--color-brand)]"
                      : "bg-[var(--color-surface-2)] border-[var(--color-border)]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isCurrent
                          ? "bg-[var(--color-brand)] text-white border-transparent"
                          : "bg-[var(--color-surface)] text-[var(--color-brand)] border-[var(--color-border)]"
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
                      <div className="text-xs text-[var(--color-text-3)] mt-0.5">
                        {st.address || "Alamat belum diatur"} {st.isMainBranch && "• (Cabang Utama)"}
                      </div>
                    </div>
                  </div>

                  {isCurrent ? (
                    <span className="text-[11px] font-extrabold text-[var(--color-brand)] bg-[var(--color-surface)] px-3 py-1 rounded-full border border-[var(--color-brand)] inline-flex items-center gap-1 ml-auto">
                      <CheckCircleIcon size={14} weight="fill" />
                      <span>Sedang Digunakan</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectStore(st._id)}
                      className="press-tactile py-1.5 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] text-xs font-bold cursor-pointer hover:bg-[var(--color-surface-2)] ml-auto"
                    >
                      Beralih ke Cabang Ini
                    </button>
                  )}
                </div>
              );
            })
          ) : null}
        </div>
      </section>
    </div>
  );
}
