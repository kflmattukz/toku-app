import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "#/lib/auth-client";
import { useAppStore } from "#/lib/store-context";
import { useEffect, useState } from "react";
import { useThemeSwitchAnimation } from "#/lib/useThemeSwitchAnimation";
import { toast } from "sonner";
import { CashierLockModal } from "#/components/CashierLockModal";
import { Tabs } from "#/components/ui/Tabs";
import {
  StoreProfileTab,
  CashierManagementTab,
  BranchesTab,
  PengaturanSkeleton,
} from "#/features/pengaturan";
import { StorefrontIcon, UsersIcon, BuildingsIcon, SunIcon, MoonIcon } from "@phosphor-icons/react";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/_app/pengaturan")({ component: Pengaturan });

function Pengaturan() {
  const { store, currentCashier, setSelectedStoreId } = useAppStore();
  const [cachedStore, setCachedStore] = useState(store);

  useEffect(() => {
    if (store) {
      setCachedStore(store);
    }
  }, [store]);

  const currentStore = store ?? cachedStore;
  const { data: session } = authClient.useSession();
  const updateStore = useMutation<typeof api.stores.update>(api.stores.update);
  const createBranchMutation = useMutation(api.stores.createBranch);
  const deleteBranchMutation = useMutation(api.stores.deleteBranch);
  const userStores = useQuery(
    api.stores.listUserStores,
    session?.user
      ? { userId: session.user.id, userEmail: session.user.email || undefined }
      : "skip",
  );

  const cashiers = useQuery(
    api.cashiers.listByStore,
    currentStore ? { storeId: currentStore._id } : "skip",
  );
  const createCashier = useMutation(api.cashiers.create);
  const updateCashier = useMutation(api.cashiers.update);
  const removeCashier = useMutation(api.cashiers.remove);

  // Tab state
  const [activeTab, setActiveTab] = useState("store");

  // Tab 1 (Store Profile) State
  const [name, setName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [category, setCategory] = useState<any>("kuliner_resto");
  const [address, setAddress] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { ref: themeButtonRef, toggleSwitchTheme, dark } = useThemeSwitchAnimation();

  // Tab 2 (Cashiers) State
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState(false);
  const [showOwnerAuthModal, setShowOwnerAuthModal] = useState(false);
  const [isAddingCashier, setIsAddingCashier] = useState(false);

  // Edit / Delete Cashier State
  const [editingCashier, setEditingCashier] = useState<any | null>(null);
  const [isUpdatingCashier, setIsUpdatingCashier] = useState(false);
  const [deletingCashier, setDeletingCashier] = useState<{
    id: Id<"cashiers">;
    name: string;
  } | null>(null);
  const [isDeletingCashier, setIsDeletingCashier] = useState(false);

  // Tab 3 (Branches) State
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [isUpdatingBranch, setIsUpdatingBranch] = useState(false);
  const [isDeletingBranch, setIsDeletingBranch] = useState(false);

  useEffect(() => {
    if (currentStore) {
      setName(currentStore.name || "");
      setBranchName(currentStore.branchName || "");
      setCategory(currentStore.category || "kuliner_resto");
      setAddress(currentStore.address || "");
      setLowStockThreshold(currentStore.lowStockThreshold ?? 5);
    }
  }, [currentStore]);

  const isOwner =
    currentCashier?.role === "owner" || isOwnerUnlocked || (cashiers && cashiers.length === 0);

  const activeOwners = (cashiers || []).filter((c: any) => c.role === "owner");

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;
    setSaving(true);
    try {
      await updateStore({
        id: currentStore._id,
        name,
        branchName: branchName.trim() || undefined,
        category,
        address: address.trim() || undefined,
        lowStockThreshold,
      });
      setSaved(true);
      toast.success("Profil toko berhasil diperbarui!");
      setTimeout(() => setSaved(false), 2500);
    } catch {
      toast.error("Gagal menyimpan profil toko.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    localStorage.removeItem("toku_active_cashier");
    localStorage.removeItem("toku_pos_unlocked");
    window.location.href = "/";
  };

  const handleCreateCashier = async (data: {
    name: string;
    pin: string;
    role: "cashier" | "manager" | "owner";
  }) => {
    if (!currentStore || !data.name.trim() || data.pin.length !== 4) {
      toast.error("Nama kasir dan PIN 4-digit wajib diisi.");
      return;
    }
    setIsAddingCashier(true);
    try {
      await createCashier({
        storeId: currentStore._id,
        name: data.name.trim(),
        pin: data.pin,
        role: data.role,
      });
      toast.success(`Staf ${data.name} (${data.role}) berhasil ditambahkan!`);
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan staf.");
    } finally {
      setIsAddingCashier(false);
    }
  };

  const handleUpdateCashier = async (
    id: Id<"cashiers">,
    data: { name: string; pin: string; role: "cashier" | "manager" | "owner" },
  ) => {
    if (!data.name.trim() || data.pin.length !== 4) {
      toast.error("Nama kasir dan PIN 4 digit wajib diisi.");
      return;
    }
    setIsUpdatingCashier(true);
    try {
      await updateCashier({
        id,
        name: data.name.trim(),
        pin: data.pin,
        role: data.role,
      });
      toast.success(`Data staf ${data.name} berhasil diperbarui!`);
      setEditingCashier(null);
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui staf.");
    } finally {
      setIsUpdatingCashier(false);
    }
  };

  const handleConfirmDeleteCashier = async () => {
    if (!deletingCashier) return;
    setIsDeletingCashier(true);
    try {
      await removeCashier({ id: deletingCashier.id });
      toast.success(`Staf "${deletingCashier.name}" berhasil dihapus.`);
      setDeletingCashier(null);
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus staf.");
    } finally {
      setIsDeletingCashier(false);
    }
  };

  const handleCreateBranch = async (values: { name: string; address?: string }) => {
    if (!session?.user || !values.name.trim()) {
      toast.error("Nama cabang wajib diisi.");
      return;
    }
    setIsAddingBranch(true);
    try {
      const newStoreId = await createBranchMutation({
        userId: session.user.id,
        userEmail: session.user.email || undefined,
        name: currentStore?.name || "Toko Baru",
        branchName: values.name.trim(),
        category: (currentStore?.category as any) || "kuliner_resto",
        address: values.address?.trim() || undefined,
      });
      toast.success(`Cabang "${values.name}" berhasil dibuat!`);
      setSelectedStoreId(newStoreId);
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat cabang baru.");
    } finally {
      setIsAddingBranch(false);
    }
  };

  const handleUpdateBranch = async (
    storeId: Id<"stores">,
    values: { branchName: string; address?: string },
  ) => {
    setIsUpdatingBranch(true);
    try {
      await updateStore({
        id: storeId,
        branchName: values.branchName.trim(),
        address: values.address?.trim() || undefined,
      });
      toast.success(`Cabang "${values.branchName}" berhasil diperbarui!`);
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui cabang.");
    } finally {
      setIsUpdatingBranch(false);
    }
  };

  const handleDeleteBranch = async (storeId: Id<"stores">) => {
    setIsDeletingBranch(true);
    try {
      await deleteBranchMutation({ id: storeId });
      toast.success("Cabang berhasil dihapus.");

      // If active branch was deleted, switch to the main branch or first available
      if (currentStore?._id === storeId) {
        const remaining = (userStores || []).filter((s: any) => s._id !== storeId);
        const main = remaining.find((s: any) => s.isMainBranch) || remaining[0];
        if (main) {
          setSelectedStoreId(main._id);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus cabang.");
    } finally {
      setIsDeletingBranch(false);
    }
  };

  if (!currentStore) return <PengaturanSkeleton />;

  return (
    <div className="mx-auto w-full max-w-4xl pb-12">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="eyebrow-tag">KONTROL SISTEM</div>
          <h1 className="mt-0.5 text-2xl font-black tracking-tight text-(--color-text)">
            Pengaturan Toko
          </h1>
          <p className="mt-1 text-xs text-(--color-text-3)">
            Konfigurasi profil usaha, staf kasir PIN, dan multi-cabang outlet
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            ref={themeButtonRef}
            type="button"
            onClick={toggleSwitchTheme}
            className="press-tactile flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs font-bold text-(--color-text) shadow-xs transition-colors hover:bg-surface-2"
            title={dark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
          >
            {dark ? (
              <>
                <SunIcon size={16} weight="bold" className="text-amber-400" />
                <span>Terang</span>
              </>
            ) : (
              <>
                <MoonIcon size={16} weight="bold" className="text-brand" />
                <span>Gelap</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="mb-6">
          <Tabs.Trigger value="store" icon={StorefrontIcon}>
            Profil Toko
          </Tabs.Trigger>
          <Tabs.Trigger value="cashiers" icon={UsersIcon}>
            Staf & PIN Kasir
          </Tabs.Trigger>
          <Tabs.Trigger value="branches" icon={BuildingsIcon}>
            Cabang ({userStores?.length ?? 1})
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="store">
          <StoreProfileTab
            name={name}
            setName={setName}
            branchName={branchName}
            setBranchName={setBranchName}
            category={category}
            setCategory={setCategory}
            address={address}
            setAddress={setAddress}
            lowStockThreshold={lowStockThreshold}
            setLowStockThreshold={setLowStockThreshold}
            saving={saving}
            saved={saved}
            onSave={handleSaveStore}
            dark={dark}
            session={session}
            onLogout={handleLogout}
          />
        </Tabs.Content>

        <Tabs.Content value="cashiers">
          <CashierManagementTab
            isOwner={Boolean(isOwner)}
            onOpenOwnerAuth={() => setShowOwnerAuthModal(true)}
            cashiers={cashiers}
            activeOwners={activeOwners}
            isAddingCashier={isAddingCashier}
            onCreateCashier={handleCreateCashier}
            editingCashier={editingCashier}
            setEditingCashier={setEditingCashier}
            isUpdatingCashier={isUpdatingCashier}
            onUpdateCashier={handleUpdateCashier}
            deletingCashier={deletingCashier}
            setDeletingCashier={setDeletingCashier}
            isDeletingCashier={isDeletingCashier}
            onConfirmDeleteCashier={handleConfirmDeleteCashier}
          />
        </Tabs.Content>

        <Tabs.Content value="branches">
          <BranchesTab
            currentStoreId={currentStore._id}
            userStores={userStores}
            onSelectStore={(stId) => {
              setSelectedStoreId(stId);
              toast.success("Beralih ke cabang yang dipilih");
            }}
            isAddingBranch={isAddingBranch}
            onCreateBranch={handleCreateBranch}
            isUpdatingBranch={isUpdatingBranch}
            onUpdateBranch={handleUpdateBranch}
            isDeletingBranch={isDeletingBranch}
            onDeleteBranch={handleDeleteBranch}
          />
        </Tabs.Content>
      </Tabs>

      {/* Owner Access Unlock PIN Modal */}
      {showOwnerAuthModal && currentStore && (
        <CashierLockModal
          isOpen={showOwnerAuthModal}
          onClose={() => setShowOwnerAuthModal(false)}
          storeId={currentStore._id}
          requiredRole="owner"
          title="Buka Kunci Akses Pemilik (Owner)"
          onSuccess={() => {
            setIsOwnerUnlocked(true);
            setShowOwnerAuthModal(false);
            toast.success("Akses Pemilik Toko (Owner) berhasil dibuka!");
          }}
        />
      )}
    </div>
  );
}
