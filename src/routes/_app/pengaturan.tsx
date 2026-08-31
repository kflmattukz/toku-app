import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "#/lib/auth-client";
import { useAppStore } from "#/lib/store-context";
import { useEffect, useState } from "react";
import { isDarkMode, toggleTheme } from "#/lib/utils";
import { toast } from "sonner";
import { CashierLockModal } from "#/components/CashierLockModal";
import { Tabs } from "#/components/ui/Tabs";
import { StorefrontIcon, UsersIcon, BuildingsIcon, UserIcon } from "@phosphor-icons/react";
import { StoreProfileTab, CashierManagementTab, BranchesTab } from "#/features/pengaturan";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/_app/pengaturan")({ component: Pengaturan });

function Pengaturan() {
  const { store, currentCashier, setSelectedStoreId } = useAppStore();
  const { data: session } = authClient.useSession();
  const updateStore = useMutation(api.stores.update);
  const createBranchMutation = useMutation(api.stores.createBranch);
  const userStores = useQuery(
    api.stores.listUserStores,
    session?.user
      ? { userId: session.user.id, userEmail: session.user.email || undefined }
      : "skip",
  );

  const cashiers = useQuery(api.cashiers.listByStore, store ? { storeId: store._id } : "skip");
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
  const [dark, setDark] = useState(false);

  // Tab 2 (Cashiers) State
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState(false);
  const [showOwnerAuthModal, setShowOwnerAuthModal] = useState(false);
  const [newCashierName, setNewCashierName] = useState("");
  const [newCashierPin, setNewCashierPin] = useState("");
  const [newCashierRole, setNewCashierRole] = useState<"cashier" | "manager" | "owner">("cashier");
  const [isAddingCashier, setIsAddingCashier] = useState(false);

  // Edit / Delete Cashier State
  const [editingCashier, setEditingCashier] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editPin, setEditPin] = useState("");
  const [editRole, setEditRole] = useState<"cashier" | "manager" | "owner">("cashier");
  const [isUpdatingCashier, setIsUpdatingCashier] = useState(false);
  const [deletingCashier, setDeletingCashier] = useState<{
    id: Id<"cashiers">;
    name: string;
  } | null>(null);
  const [isDeletingCashier, setIsDeletingCashier] = useState(false);

  // Tab 3 (Branches) State
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchAddress, setNewBranchAddress] = useState("");
  const [isAddingBranch, setIsAddingBranch] = useState(false);

  useEffect(() => {
    setDark(isDarkMode());
    const onTheme = (e: any) => setDark(e.detail);
    window.addEventListener("toku_theme_change", onTheme);
    return () => window.removeEventListener("toku_theme_change", onTheme);
  }, []);

  useEffect(() => {
    if (store) {
      setName(store.name || "");
      setBranchName(store.branchName || "");
      setCategory(store.category || "kuliner_resto");
      setAddress(store.address || "");
      setLowStockThreshold(store.lowStockThreshold ?? 5);
    }
  }, [store]);

  const isOwner =
    currentCashier?.role === "owner" || isOwnerUnlocked || (cashiers && cashiers.length === 0);

  const activeOwners = (cashiers || []).filter((c: any) => c.role === "owner");

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    try {
      await updateStore({
        id: store._id,
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

  const handleToggleDark = () => {
    const next = toggleTheme();
    setDark(next);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    localStorage.removeItem("toku_active_cashier");
    localStorage.removeItem("toku_pos_unlocked");
    window.location.href = "/";
  };

  const handleCreateCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !newCashierName.trim() || newCashierPin.length !== 4) {
      toast.error("Nama kasir dan PIN 4-digit wajib diisi.");
      return;
    }
    setIsAddingCashier(true);
    try {
      await createCashier({
        storeId: store._id,
        name: newCashierName.trim(),
        pin: newCashierPin,
        role: newCashierRole,
      });
      toast.success(`Staf ${newCashierName} (${newCashierRole}) berhasil ditambahkan!`);
      setNewCashierName("");
      setNewCashierPin("");
      setNewCashierRole("cashier");
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan staf.");
    } finally {
      setIsAddingCashier(false);
    }
  };

  const handleOpenEditCashier = (c: any) => {
    setEditingCashier(c);
    setEditName(c.name);
    setEditPin(c.pin);
    setEditRole(c.role || "cashier");
  };

  const handleUpdateCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCashier || !editName.trim() || editPin.length !== 4) {
      toast.error("Nama kasir dan PIN 4 digit wajib diisi.");
      return;
    }
    setIsUpdatingCashier(true);
    try {
      await updateCashier({
        id: editingCashier._id,
        name: editName.trim(),
        pin: editPin,
        role: editRole,
      });
      toast.success(`Data staf ${editName} berhasil diperbarui!`);
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

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !newBranchName.trim()) {
      toast.error("Nama cabang wajib diisi.");
      return;
    }
    setIsAddingBranch(true);
    try {
      const newStoreId = await createBranchMutation({
        userId: session.user.id,
        userEmail: session.user.email || undefined,
        name: store?.name || "Toko Baru",
        branchName: newBranchName.trim(),
        category: (store?.category as any) || "kuliner_resto",
        address: newBranchAddress.trim() || undefined,
      });
      toast.success(`Cabang "${newBranchName}" berhasil dibuat!`);
      setNewBranchName("");
      setNewBranchAddress("");
      setSelectedStoreId(newStoreId);
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat cabang baru.");
    } finally {
      setIsAddingBranch(false);
    }
  };

  if (!store) return <PengaturanLoader />;

  return (
    <div className="mx-auto w-full max-w-4xl pb-12">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="eyebrow-tag">KONTROL SISTEM</div>
          <h1 className="mt-0.5 text-2xl font-black tracking-tight text-[var(--color-text)]">
            Pengaturan Toko
          </h1>
          <p className="mt-1 text-xs text-[var(--color-text-3)]">
            Konfigurasi profil usaha, staf kasir PIN, dan multi-cabang outlet
          </p>
        </div>
      </div>

      {/* Compound Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="mb-6">
          <Tabs.Trigger value="store" icon={StorefrontIcon}>
            Profil Toko
          </Tabs.Trigger>
          <Tabs.Trigger value="cashiers" icon={UsersIcon}>
            Staf & Kasir PIN
          </Tabs.Trigger>
          <Tabs.Trigger value="branches" icon={BuildingsIcon}>
            Cabang / Outlet
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
            onToggleDark={handleToggleDark}
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
            newCashierName={newCashierName}
            setNewCashierName={setNewCashierName}
            newCashierPin={newCashierPin}
            setNewCashierPin={setNewCashierPin}
            newCashierRole={newCashierRole}
            setNewCashierRole={setNewCashierRole}
            isAddingCashier={isAddingCashier}
            onCreateCashier={handleCreateCashier}
            editingCashier={editingCashier}
            setEditingCashier={setEditingCashier}
            editName={editName}
            setEditName={setEditName}
            editPin={editPin}
            setEditPin={setEditPin}
            editRole={editRole}
            setEditRole={setEditRole}
            isUpdatingCashier={isUpdatingCashier}
            onUpdateCashier={handleUpdateCashier}
            onOpenEditCashier={handleOpenEditCashier}
            deletingCashier={deletingCashier}
            setDeletingCashier={setDeletingCashier}
            isDeletingCashier={isDeletingCashier}
            onConfirmDeleteCashier={handleConfirmDeleteCashier}
          />
        </Tabs.Content>

        <Tabs.Content value="branches">
          <BranchesTab
            currentStoreId={store._id}
            userStores={userStores}
            onSelectStore={(stId) => {
              setSelectedStoreId(stId);
              toast.success("Beralih ke cabang yang dipilih");
            }}
            newBranchName={newBranchName}
            setNewBranchName={setNewBranchName}
            newBranchAddress={newBranchAddress}
            setNewBranchAddress={setNewBranchAddress}
            isAddingBranch={isAddingBranch}
            onCreateBranch={handleCreateBranch}
          />
        </Tabs.Content>
      </Tabs>

      {/* Owner Access Unlock PIN Modal */}
      {showOwnerAuthModal && store && (
        <CashierLockModal
          isOpen={showOwnerAuthModal}
          onClose={() => setShowOwnerAuthModal(false)}
          storeId={store._id}
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

function PengaturanLoader() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <UserIcon
        size={40}
        weight="duotone"
        className="animate-pulse text-[var(--color-brand)] opacity-50"
      />
      <p className="text-sm font-bold text-[var(--color-text-2)]">Memuat pengaturan...</p>
    </div>
  );
}
