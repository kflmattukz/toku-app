import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { authClient } from "#/lib/auth-client";
import { useAppStore } from "#/lib/store-context";
import { useEffect, useState, useRef } from "react";
import { isDarkMode, toggleTheme } from "#/lib/utils";
import { toast } from "sonner";
import { Modal } from "#/components/Modal";
import { CashierLockModal } from "#/components/CashierLockModal";
import {
  MoonIcon,
  SunIcon,
  SignOutIcon,
  UserIcon,
  CheckIcon,
  StorefrontIcon,
  PaletteIcon,
  UsersIcon,
  BuildingsIcon,
  PlusIcon,
  TrashIcon,
  PencilSimpleIcon,
  LockKeyIcon,
  CrownIcon,
  BellRingingIcon,
  CaretDownIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  WrenchIcon,
  ForkKnifeIcon,
  CoffeeIcon,
  ShoppingCartIcon,
  DropIcon,
  ScissorsIcon,
  TShirtIcon,
  DeviceMobileIcon,
  PillIcon,
  HammerIcon,
  PawPrintIcon,
  PrinterIcon,
  TagIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import type { Id } from "../../../convex/_generated/dataModel";

export const Route = createFileRoute("/_app/pengaturan")({ component: Pengaturan });

export const UMKM_CATEGORIES = [
  {
    value: "bengkel",
    label: "Bengkel Motor & Mobil / Otomotif",
    desc: "Bengkel servis, suku cadang & ganti oli",
    icon: WrenchIcon,
  },
  {
    value: "kuliner_resto",
    label: "Kuliner & Restoran",
    desc: "Rumah makan, resto, kedai & kuliner",
    icon: ForkKnifeIcon,
  },
  {
    value: "warung_kopi",
    label: "Warung Kopi / Cafe",
    desc: "Kopi, minuman kekinian & nongkrong",
    icon: CoffeeIcon,
  },
  {
    value: "sembako",
    label: "Warung Sembako",
    desc: "Beras, minyak, bumbu & kebutuhan dapur",
    icon: ShoppingCartIcon,
  },
  {
    value: "kelontong",
    label: "Toko Kelontong",
    desc: "Kebutuhan rumah tangga & sembako harian",
    icon: StorefrontIcon,
  },
  {
    value: "laundry",
    label: "Laundry Kiloan & Satuan",
    desc: "Cuci kiloan, satuan, setrika & dry clean",
    icon: DropIcon,
  },
  {
    value: "barbershop_salon",
    label: "Barbershop, Pangkas Rambut & Salon",
    desc: "Pangkas rambut, potong rambut & grooming",
    icon: ScissorsIcon,
  },
  {
    value: "fashion_butik",
    label: "Pakaian, Fashion & Butik",
    desc: "Pakaian, hijab, sepatu & aksesoris mode",
    icon: TShirtIcon,
  },
  {
    value: "konter_pulsa",
    label: "Konter Pulsa & HP",
    desc: "Pulsa, paket data, voucher & aksesoris",
    icon: DeviceMobileIcon,
  },
  {
    value: "apotek",
    label: "Apotek & Toko Obat",
    desc: "Obat-obatan, resep & alat kesehatan",
    icon: PillIcon,
  },
  {
    value: "toko_bangunan",
    label: "Toko Bangunan & Material",
    desc: "Material bangunan, cat, semen & perkakas",
    icon: HammerIcon,
  },
  {
    value: "petshop",
    label: "Petshop & Klinik Hewan",
    desc: "Pakan hewan, vitamin, grooming & aksesoris",
    icon: PawPrintIcon,
  },
  {
    value: "atk_fotokopi",
    label: "ATK & Fotokopi / Percetakan",
    desc: "Alat tulis, fotokopi, print & percetakan",
    icon: PrinterIcon,
  },
  {
    value: "lainnya",
    label: "Usaha Lainnya",
    desc: "Kategori bisnis & usaha UMKM lainnya",
    icon: TagIcon,
  },
];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  UMKM_CATEGORIES.map((c) => [c.value, c.label]),
);

function CategorySelectPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activeCategory =
    UMKM_CATEGORIES.find((c) => c.value === value) || UMKM_CATEGORIES[0];
  const ActiveIcon = activeCategory.icon;

  const filtered = UMKM_CATEGORIES.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isMobile && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isMobile]);

  const renderCategoryList = () => (
    <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-1">
      {filtered.length > 0 ? (
        filtered.map((cat) => {
          const Icon = cat.icon;
          const isSelected = cat.value === value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                onChange(cat.value);
                setIsOpen(false);
                setSearch("");
              }}
              className="press-tactile w-full text-left"
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                cursor: "pointer",
                background: isSelected
                  ? "var(--color-brand-light)"
                  : "transparent",
                border: isSelected
                  ? "1.5px solid var(--color-brand)"
                  : "1.5px solid transparent",
                transition: "all 120ms ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: isSelected
                      ? "var(--color-brand)"
                      : "var(--color-surface-2)",
                    color: isSelected ? "#ffffff" : "var(--color-text-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} weight={isSelected ? "bold" : "regular"} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isSelected ? 800 : 700,
                      color: isSelected ? "var(--color-brand)" : "var(--color-text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-3)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginTop: 2,
                    }}
                  >
                    {cat.desc}
                  </div>
                </div>
              </div>

              {isSelected && (
                <CheckCircleIcon
                  size={20}
                  weight="fill"
                  color="var(--color-brand)"
                  style={{ flexShrink: 0 }}
                />
              )}
            </button>
          );
        })
      ) : (
        <div
          style={{
            padding: "24px 16px",
            textAlign: "center",
            fontSize: 13,
            color: "var(--color-text-3)",
          }}
        >
          Kategori tidak ditemukan.
        </div>
      )}
    </div>
  );

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="press-tactile"
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "var(--radius-sm)",
          border: isOpen ? "1.5px solid var(--color-brand)" : "1.5px solid var(--color-border)",
          background: "var(--color-surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          cursor: "pointer",
          textAlign: "left",
          boxShadow: isOpen ? "0 0 0 3px rgba(234, 88, 12, 0.15)" : "none",
          transition: "all 180ms ease",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--color-brand-light)",
              color: "var(--color-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ActiveIcon size={20} weight="bold" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "var(--color-text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {activeCategory.label}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-3)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {activeCategory.desc}
            </div>
          </div>
        </div>

        <div
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms ease",
            color: "var(--color-text-3)",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <CaretDownIcon size={18} weight="bold" />
        </div>
      </button>

      {/* Floating Popover on Desktop / Tablet */}
      {isOpen && !isMobile && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 100,
            background: "var(--color-surface)",
            border: "1.5px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.16)",
            padding: 12,
            maxHeight: 380,
            display: "flex",
            flexDirection: "column",
            animation: "fadeIn 150ms ease",
          }}
        >
          {/* Search filter */}
          <div
            style={{
              position: "relative",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
            }}
          >
            <MagnifyingGlassIcon
              size={16}
              weight="bold"
              style={{
                position: "absolute",
                left: 12,
                color: "var(--color-text-3)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              autoFocus
              placeholder="Cari kategori UMKM (bengkel, sembako, laundry...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                background: "var(--color-surface-2)",
                fontSize: 13,
                color: "var(--color-text)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {renderCategoryList()}
        </div>
      )}

      {/* Responsive Modal on Mobile */}
      {isOpen && isMobile && (
        <Modal onClose={() => setIsOpen(false)} maxWidth={440}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <StorefrontIcon size={22} weight="bold" color="var(--color-brand)" />
              <h3 className="text-base font-extrabold text-[var(--color-text)] m-0">
                Pilih Kategori Usaha UMKM
              </h3>
            </div>

            <div className="relative mb-3 flex items-center">
              <MagnifyingGlassIcon
                size={16}
                weight="bold"
                className="absolute left-3 text-[var(--color-text-3)] pointer-events-none"
              />
              <input
                type="text"
                autoFocus
                placeholder="Cari jenis usaha..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 38px",
                  borderRadius: 10,
                  border: "1.5px solid var(--color-border)",
                  background: "var(--color-surface-2)",
                  fontSize: 13,
                  color: "var(--color-text)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {renderCategoryList()}
          </div>
        </Modal>
      )}
    </div>
  );
}

type SettingTab = "store" | "cashiers" | "branches";

function Pengaturan() {
  const { store, session, setSelectedStoreId, currentCashier } = useAppStore();
  const updateStore = useMutation(api.stores.update);
  const createCashier = useMutation(api.cashiers.create);
  const updateCashier = useMutation(api.cashiers.update);
  const deleteCashier = useMutation(api.cashiers.remove);
  const createBranch = useMutation(api.stores.createBranch);

  const [activeTab, setActiveTab] = useState<SettingTab>("store");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("sembako");
  const [address, setAddress] = useState("");
  const [branchName, setBranchName] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dark, setDark] = useState(isDarkMode);

  // Owner security gate state
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState(false);
  const [showOwnerAuthModal, setShowOwnerAuthModal] = useState(false);

  // Cashier form state
  const [newCashierName, setNewCashierName] = useState("");
  const [newCashierPin, setNewCashierPin] = useState("");
  const [showNewCashierPin, setShowNewCashierPin] = useState(false);
  const [newCashierRole, setNewCashierRole] = useState<"owner" | "manager" | "cashier">("cashier");
  const [isAddingCashier, setIsAddingCashier] = useState(false);

  // Edit Cashier modal state
  const [editingCashier, setEditingCashier] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editPin, setEditPin] = useState("");
  const [showEditPin, setShowEditPin] = useState(false);
  const [editRole, setEditRole] = useState<"owner" | "manager" | "cashier">("cashier");
  const [isUpdatingCashier, setIsUpdatingCashier] = useState(false);

  // Delete Cashier confirmation modal state
  const [deletingCashier, setDeletingCashier] = useState<{ id: Id<"cashiers">; name: string } | null>(null);
  const [isDeletingCashier, setIsDeletingCashier] = useState(false);

  // Branch form state
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchAddress, setNewBranchAddress] = useState("");
  const [isAddingBranch, setIsAddingBranch] = useState(false);

  const cashiers = useQuery(
    api.cashiers.listByStore,
    store ? { storeId: store._id } : "skip",
  );

  const isOwner = !currentCashier || currentCashier.role === "owner" || isOwnerUnlocked;
  const activeOwners = (cashiers ?? []).filter((c) => c.role === "owner" && c.active !== false);

  const userStores = useQuery(
    api.stores.listUserStores,
    session ? { userId: session.user.id, userEmail: session.user.email } : "skip",
  );

  useEffect(() => {
    if (store) {
      setName(store.name);
      setCategory(store.category ?? "sembako");
      setAddress(store.address ?? "");
      setBranchName(store.branchName ?? "Pusat");
      setLowStockThreshold(store.lowStockThreshold ?? 5);
    }
  }, [store]);

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<boolean>) => setDark(e.detail);
    window.addEventListener("toku_theme_change" as any, handleThemeChange);
    return () => window.removeEventListener("toku_theme_change" as any, handleThemeChange);
  }, []);

  const handleToggleDark = () => {
    const next = toggleTheme();
    setDark(next);
    toast.info(`Mode tampilan diubah ke ${next ? "Gelap" : "Terang"}`);
  };

  const handleSaveStore = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!store) return;
    setSaving(true);
    try {
      await updateStore({
        id: store._id,
        name,
        category: (category as any) || undefined,
        address: address || undefined,
        branchName: branchName || undefined,
        lowStockThreshold: Number(lowStockThreshold) || 5,
      });
      setSaved(true);
      toast.success("Pengaturan toko berhasil disimpan!");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Gagal memperbarui profil toko.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    if (newCashierPin.length !== 4 || !/^\d+$/.test(newCashierPin)) {
      toast.error("PIN harus berupa 4 digit angka");
      return;
    }

    // Check duplicate PIN locally first for immediate feedback
    const duplicate = (cashiers ?? []).find(
      (c) => c.pin === newCashierPin && c.active !== false,
    );
    if (duplicate) {
      toast.error(
        `PIN ${newCashierPin} sudah digunakan oleh staf "${duplicate.name}". Harap gunakan 4 digit PIN yang berbeda.`,
      );
      return;
    }

    try {
      setIsAddingCashier(true);
      await createCashier({
        storeId: store._id,
        name: newCashierName,
        pin: newCashierPin,
        role: newCashierRole,
      });
      toast.success(`Staf kasir "${newCashierName}" berhasil ditambahkan!`);
      setNewCashierName("");
      setNewCashierPin("");
      setIsAddingCashier(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal menambah kasir");
      setIsAddingCashier(false);
    }
  };

  const handleOpenEditCashier = (c: any) => {
    setEditingCashier(c);
    setEditName(c.name);
    setEditPin(c.pin || "");
    setShowEditPin(false);
    setEditRole(c.role || "cashier");
  };

  const handleUpdateCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCashier) return;
    if (editPin.length !== 4 || !/^\d+$/.test(editPin)) {
      toast.error("PIN harus berupa 4 digit angka");
      return;
    }

    // Check duplicate PIN with other cashiers
    const duplicate = (cashiers ?? []).find(
      (c) => c._id !== editingCashier._id && c.pin === editPin && c.active !== false,
    );
    if (duplicate) {
      toast.error(
        `PIN ${editPin} sudah digunakan oleh staf "${duplicate.name}". Harap gunakan PIN berbeda.`,
      );
      return;
    }

    try {
      setIsUpdatingCashier(true);
      await updateCashier({
        id: editingCashier._id,
        name: editName,
        pin: editPin,
        role: editRole,
      });
      toast.success(`Data staf "${editName}" berhasil diperbarui!`);
      setEditingCashier(null);
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui staf");
    } finally {
      setIsUpdatingCashier(false);
    }
  };

  const handleConfirmDeleteCashier = async () => {
    if (!deletingCashier) return;
    try {
      setIsDeletingCashier(true);
      await deleteCashier({ id: deletingCashier.id });
      toast.success(`Staf "${deletingCashier.name}" berhasil dihapus.`);
      setDeletingCashier(null);
    } catch {
      toast.error("Gagal menghapus kasir");
    } finally {
      setIsDeletingCashier(false);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !session) return;
    try {
      setIsAddingBranch(true);
      await createBranch({
        userId: session.user.id,
        userEmail: session.user.email,
        name: store.name,
        branchName: newBranchName,
        category: store.category,
        address: newBranchAddress || undefined,
      });
      toast.success(`Cabang "${newBranchName}" berhasil dibuat!`);
      setNewBranchName("");
      setNewBranchAddress("");
      setIsAddingBranch(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal menambah cabang");
      setIsAddingBranch(false);
    }
  };

  const handleLogout = () => {
    toast.info("Keluar dari Toku POS...");
    if (session?.user) {
      const userKey = `toku_active_store_id_${session.user.email || session.user.id}`;
      localStorage.removeItem(userKey);
    }
    localStorage.removeItem("toku_active_store_id");
    localStorage.removeItem("toku_active_cashier");
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return {
          bg: "rgba(234, 88, 12, 0.12)",
          color: "var(--color-brand)",
          border: "1px solid rgba(234, 88, 12, 0.25)",
          icon: CrownIcon,
          label: "Owner",
        };
      case "manager":
        return {
          bg: "rgba(99, 102, 241, 0.12)",
          color: "#6366f1",
          border: "1px solid rgba(99, 102, 241, 0.25)",
          icon: ShieldCheckIcon,
          label: "Manager",
        };
      default:
        return {
          bg: "rgba(16, 185, 129, 0.12)",
          color: "var(--color-success)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          icon: UserIcon,
          label: "Kasir",
        };
    }
  };

  if (!store) return <Loader />;

  return (
    <div style={{ width: "100%", maxWidth: "100%", minWidth: 0, paddingBottom: 40, boxSizing: "border-box" }}>
      {/* Header & Title with Eyebrow Tag */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div className="eyebrow-tag" style={{ marginBottom: 6 }}>
            PENGATURAN TOKU POS
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: "var(--color-text)", letterSpacing: "-0.02em" }}>
            Pengaturan & Kelola Toko
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-text-3)", margin: "4px 0 0" }}>
            Konfigurasi profil usaha, staf kasir PIN, dan multi-cabang outlet
          </p>
        </div>
      </div>

      {/* Responsive Horizontal Tabs */}
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          borderBottom: "1.5px solid var(--color-border)",
          paddingBottom: 8,
          overflowX: "auto",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {[
          { id: "store", label: "Profil Toko", icon: StorefrontIcon },
          { id: "cashiers", label: "Staf & Kasir PIN", icon: UsersIcon },
          { id: "branches", label: "Cabang / Outlet", icon: BuildingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingTab)}
              className="press-tactile"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 18px",
                borderRadius: 99,
                border: active ? "1.5px solid var(--color-brand)" : "1.5px solid transparent",
                background: active ? "var(--color-brand)" : "var(--color-surface)",
                color: active ? "#ffffff" : "var(--color-text-2)",
                fontSize: 13,
                fontWeight: active ? 800 : 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: active ? "0 4px 12px rgba(234, 88, 12, 0.25)" : "none",
                transition: "all 180ms ease",
                flexShrink: 0,
              }}
            >
              <Icon size={16} weight={active ? "fill" : "bold"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFIL TOKO & TAMPILAN */}
      {activeTab === "store" && (
        <div className="flex flex-col gap-5">
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <StorefrontIcon size={20} weight="bold" color="var(--color-brand)" />
              Informasi Usaha
            </h2>
            <form onSubmit={handleSaveStore}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label style={labelStyle}>Nama Toko / Bisnis</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nama Cabang Ini</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Contoh: Pusat, Cabang Kemang"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Kategori Usaha UMKM</label>
                <CategorySelectPicker value={category} onChange={setCategory} />
                <span style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 6, display: "block" }}>
                  Kategori menentukan klasifikasi profil bisnis dan rekomendasi fitur untuk toko Anda.
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Alamat Toko (Dicetak pada Struk)</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Merdeka No. 45, Jakarta"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    ...labelStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <BellRingingIcon size={16} weight="bold" color="var(--color-brand)" />
                  <span>Batas Peringatan Stok Menipis (Auto Restock Alert)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    style={{ ...inputStyle, maxWidth: 160 }}
                  />
                  <span className="text-xs text-[var(--color-text-2)] font-semibold">
                    Unit / Pcs
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 6, display: "block" }}>
                  Sistem kasir otomatis menandai produk berstatus merah jika sisa stok di bawah angka ini.
                </span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="press-tactile w-full sm:w-auto"
                style={{
                  padding: "12px 28px",
                  background: saved ? "var(--color-success)" : "var(--color-brand)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 800,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(234, 88, 12, 0.25)",
                }}
              >
                {saved ? (
                  <>
                    <CheckIcon size={18} weight="bold" /> Tersimpan!
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
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <PaletteIcon size={20} weight="bold" color="var(--color-brand)" />
              Tampilan Aplikasi
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {dark ? (
                    <MoonIcon size={22} weight="duotone" color="var(--color-brand)" />
                  ) : (
                    <SunIcon size={22} weight="duotone" color="var(--color-warning)" />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text)" }}>
                    Mode Tampilan Gelap (Dark Mode)
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-2)", marginTop: 2 }}>
                    Nuansa OLED gelap kontras tinggi, nyaman di mata saat shift malam
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleDark}
                type="button"
                aria-label="Toggle dark mode"
                className="press-tactile"
                style={{
                  width: 56,
                  height: 32,
                  borderRadius: 99,
                  background: dark ? "var(--color-brand)" : "var(--color-border)",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 200ms ease",
                  flexShrink: 0,
                  boxShadow: dark ? "0 0 12px rgba(234, 88, 12, 0.35)" : "none",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 99,
                    background: "#ffffff",
                    position: "absolute",
                    top: 3,
                    transition: "left 200ms ease",
                    left: dark ? 27 : 3,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
                  }}
                />
              </button>
            </div>
          </section>

          {/* Account */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <UserIcon size={20} weight="bold" color="var(--color-brand)" />
              Akun Pengguna & Sesi
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                {session?.user.image ? (
                  <img
                    src={session.user.image}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      border: "2px solid var(--color-border)",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                    alt="avatar"
                  />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "var(--color-brand-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <UserIcon size={24} weight="duotone" color="var(--color-brand)" />
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text)" }}>
                    {session?.user.name || "Pemilik Toko"}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-2)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {session?.user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                type="button"
                className="press-tactile"
                style={{
                  padding: "10px 18px",
                  border: "1.5px solid var(--color-danger)",
                  background: "var(--color-danger-light)",
                  color: "var(--color-danger-text)",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontSize: 13,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <SignOutIcon size={16} weight="bold" /> Keluar dari Akun
              </button>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: STAF & KASIR PIN */}
      {activeTab === "cashiers" && (
        <div className="flex flex-col gap-5">
          {!isOwner ? (
            <section
              style={{
                ...sectionStyle,
                background: "linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-2) 100%)",
                border: "1.5px dashed var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding: "48px 24px",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  maxWidth: 440,
                  margin: "0 auto",
                }}
              >
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 99,
                    background: "rgba(234, 88, 12, 0.12)",
                    color: "var(--color-brand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                    boxShadow: "0 8px 20px rgba(234, 88, 12, 0.18)",
                    border: "1px solid rgba(234, 88, 12, 0.25)",
                  }}
                >
                  <LockKeyIcon size={34} weight="bold" />
                </div>

                <div
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    fontWeight: 800,
                    color: "var(--color-brand)",
                    background: "var(--color-brand-light)",
                    padding: "3px 10px",
                    borderRadius: 99,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 10,
                  }}
                >
                  FITUR TERPROTEKSI
                </div>

                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    margin: "0 0 10px",
                    color: "var(--color-text)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Akses Khusus Pemilik Toko
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-2)",
                    margin: "0 0 24px",
                    lineHeight: 1.6,
                  }}
                >
                  Halaman penambahan, pengubahan peran, dan pengelolaan staf kasir diproteksi demi
                  keamanan operasional toko Anda. Masukkan PIN Owner untuk membuka hak akses.
                </p>

                <button
                  type="button"
                  onClick={() => setShowOwnerAuthModal(true)}
                  className="press-tactile"
                  style={{
                    padding: "14px 28px",
                    borderRadius: 99,
                    background: "var(--color-brand)",
                    color: "#ffffff",
                    border: "none",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 8px 24px rgba(234, 88, 12, 0.35)",
                    transition: "all 150ms ease",
                  }}
                >
                  <CrownIcon size={18} weight="bold" />
                  <span>Buka Kunci Akses Owner</span>
                </button>
              </div>
            </section>
          ) : (
            <>
              {/* Add Cashier Form */}
              <section style={sectionStyle}>
                <h2 style={sectionTitleStyle}>
                  <UsersIcon size={20} weight="bold" color="var(--color-brand)" />
                  Tambah Staf / Kasir Baru
                </h2>

                <form onSubmit={handleCreateCashier}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div>
                      <label style={labelStyle}>Nama Staf / Kasir</label>
                      <input
                        type="text"
                        value={newCashierName}
                        onChange={(e) => setNewCashierName(e.target.value)}
                        placeholder="Contoh: Siti Rahma"
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>PIN Masuk (4 Digit)</label>
                      <div className="relative flex items-center">
                        <input
                          type={showNewCashierPin ? "text" : "password"}
                          maxLength={4}
                          value={newCashierPin}
                          onChange={(e) => setNewCashierPin(e.target.value.replace(/\D/g, ""))}
                          placeholder="••••"
                          required
                          style={{
                            ...inputStyle,
                            paddingRight: 40,
                            letterSpacing: showNewCashierPin ? "normal" : "0.2em",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewCashierPin(!showNewCashierPin)}
                          className="absolute right-3 text-[var(--color-text-3)] hover:text-[var(--color-text)] cursor-pointer"
                          aria-label={showNewCashierPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                        >
                          {showNewCashierPin ? <EyeSlashIcon size={18} weight="bold" /> : <EyeIcon size={18} weight="bold" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Peran (Role)</label>
                      <select
                        value={newCashierRole}
                        onChange={(e) => setNewCashierRole(e.target.value as any)}
                        style={inputStyle}
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
                    className="press-tactile w-full sm:w-auto"
                    style={{
                      padding: "11px 22px",
                      background: "var(--color-brand)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: isAddingCashier ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      boxShadow: "0 4px 14px rgba(234, 88, 12, 0.25)",
                    }}
                  >
                    <PlusIcon size={16} weight="bold" />
                    {isAddingCashier ? "Menyimpan Staf..." : "Tambahkan Staf"}
                  </button>
                </form>
              </section>

              {/* Cashiers List */}
              <section style={sectionStyle}>
                <h2 style={sectionTitleStyle}>
                  <UsersIcon size={20} weight="bold" color="var(--color-brand)" />
                  Daftar Staf Kasir ({cashiers?.length ?? 0})
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {cashiers && cashiers.length > 0 ? (
                    cashiers.map((c) => {
                      const isLastOwner = c.role === "owner" && activeOwners.length <= 1;
                      const badge = getRoleBadge(c.role || "cashier");
                      const BadgeIcon = badge.icon;
                      return (
                        <div
                          key={c._id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "14px 16px",
                            background: "var(--color-surface-2)",
                            borderRadius: 14,
                            border: "1px solid var(--color-border)",
                            gap: 12,
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                background: badge.bg,
                                color: badge.color,
                                border: badge.border,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: 16,
                                flexShrink: 0,
                              }}
                            >
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 800,
                                  color: "var(--color-text)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  flexWrap: "wrap",
                                }}
                              >
                                <span>{c.name}</span>
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    color: badge.color,
                                    background: badge.bg,
                                    border: badge.border,
                                    padding: "2px 8px",
                                    borderRadius: 99,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <BadgeIcon size={12} weight="bold" />
                                  {badge.label}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "var(--color-text-3)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  marginTop: 3,
                                }}
                              >
                                <span>PIN: ••••</span>
                                {isLastOwner && (
                                  <>
                                    <span>•</span>
                                    <span style={{ color: "var(--color-brand)", fontWeight: 700 }}>
                                      Owner Utama
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                            <button
                              onClick={() => handleOpenEditCashier(c)}
                              type="button"
                              className="press-tactile"
                              title="Edit Staf / Ubah PIN"
                              style={{
                                background: "var(--color-surface)",
                                border: "1px solid var(--color-border)",
                                borderRadius: 8,
                                color: "var(--color-text)",
                                cursor: "pointer",
                                padding: "7px 12px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              <PencilSimpleIcon size={14} weight="bold" />
                              <span>Edit</span>
                            </button>

                            <button
                              disabled={isLastOwner}
                              onClick={() => setDeletingCashier({ id: c._id, name: c.name })}
                              type="button"
                              className="press-tactile"
                              title={
                                isLastOwner
                                  ? "Tidak dapat menghapus satu-satunya akun Owner toko"
                                  : "Hapus Staf"
                              }
                              style={{
                                background: isLastOwner ? "transparent" : "var(--color-danger-light)",
                                border: isLastOwner ? "1px solid transparent" : "1px solid rgba(239, 68, 68, 0.2)",
                                borderRadius: 8,
                                color: isLastOwner ? "var(--color-text-3)" : "var(--color-danger-text)",
                                cursor: isLastOwner ? "not-allowed" : "pointer",
                                opacity: isLastOwner ? 0.4 : 1,
                                padding: "7px 10px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <TrashIcon size={16} weight="bold" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "24px 0",
                        color: "var(--color-text-3)",
                        fontSize: 13,
                      }}
                    >
                      Belum ada kasir tersimpan. Kasir utama default: PIN 1234 (Pemilik).
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Edit Cashier Modal */}
          {editingCashier && (
            <Modal onClose={() => !isUpdatingCashier && setEditingCashier(null)} maxWidth={420}>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <PencilSimpleIcon size={20} weight="bold" color="var(--color-brand)" />
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "var(--color-text)" }}>
                    Ubah Data Staf / Kasir
                  </h3>
                </div>

                <form onSubmit={handleUpdateCashier}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Nama Staf / Kasir</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>PIN Masuk (4 Digit Angka Unik)</label>
                    <div className="relative flex items-center">
                      <input
                        type={showEditPin ? "text" : "password"}
                        maxLength={4}
                        value={editPin}
                        onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ""))}
                        required
                        style={{
                          ...inputStyle,
                          paddingRight: 40,
                          letterSpacing: showEditPin ? "normal" : "0.2em",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPin(!showEditPin)}
                        className="absolute right-3 text-[var(--color-text-3)] hover:text-[var(--color-text)] cursor-pointer"
                        aria-label={showEditPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                      >
                        {showEditPin ? <EyeSlashIcon size={18} weight="bold" /> : <EyeIcon size={18} weight="bold" />}
                      </button>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 4, display: "block" }}>
                      Pastikan PIN tidak sama dengan staf lain agar akun tidak tertukar.
                    </span>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Peran (Role)</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as any)}
                      style={inputStyle}
                    >
                      <option value="cashier">Kasir (Buka/Tutup Kasir)</option>
                      <option value="manager">Manager (Kelola Produk/Stok)</option>
                      <option value="owner">Owner (Hak Akses Penuh)</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setEditingCashier(null)}
                      disabled={isUpdatingCashier}
                      className="press-tactile"
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--color-border)",
                        background: "var(--color-surface-2)",
                        color: "var(--color-text)",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingCashier}
                      className="press-tactile"
                      style={{
                        flex: 1.5,
                        padding: "12px",
                        borderRadius: "var(--radius-sm)",
                        border: "none",
                        background: "var(--color-brand)",
                        color: "#ffffff",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: isUpdatingCashier ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 14px rgba(234, 88, 12, 0.25)",
                      }}
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
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 99,
                    background: "var(--color-danger-light)",
                    color: "var(--color-danger)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <WarningCircleIcon size={32} weight="bold" />
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 900, margin: "0 0 8px", color: "var(--color-text)" }}>
                  Hapus Staf Kasir?
                </h3>
                <p style={{ fontSize: 13, color: "var(--color-text-2)", margin: "0 0 20px", lineHeight: 1.5 }}>
                  Apakah Anda yakin ingin menghapus staf{" "}
                  <strong className="text-[var(--color-text)] font-extrabold">"{deletingCashier.name}"</strong>?
                  Staf ini tidak akan dapat login lagi menggunakan PIN sebelumnya.
                </p>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setDeletingCashier(null)}
                    disabled={isDeletingCashier}
                    className="press-tactile"
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface-2)",
                      color: "var(--color-text)",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteCashier}
                    disabled={isDeletingCashier}
                    className="press-tactile"
                    style={{
                      flex: 1.2,
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      background: "var(--color-danger)",
                      color: "#ffffff",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: isDeletingCashier ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    {isDeletingCashier ? "Menghapus..." : "Ya, Hapus Staf"}
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* TAB 3: CABANG / OUTLET */}
      {activeTab === "branches" && (
        <div className="flex flex-col gap-5">
          {/* Add Branch Form */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <BuildingsIcon size={20} weight="bold" color="var(--color-brand)" />
              Tambah Cabang Baru
            </h2>

            <form onSubmit={handleCreateBranch}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label style={labelStyle}>Nama Cabang</label>
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="Contoh: Cabang Boulevard"
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Alamat Cabang (Opsional)</label>
                  <input
                    type="text"
                    value={newBranchAddress}
                    onChange={(e) => setNewBranchAddress(e.target.value)}
                    placeholder="Jl. Boulevard Barat Blok A"
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAddingBranch}
                className="press-tactile w-full sm:w-auto"
                style={{
                  padding: "11px 22px",
                  background: "var(--color-brand)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: isAddingBranch ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  boxShadow: "0 4px 14px rgba(234, 88, 12, 0.25)",
                }}
              >
                <PlusIcon size={16} weight="bold" />
                {isAddingBranch ? "Menyimpan Cabang..." : "Buat Cabang Baru"}
              </button>
            </form>
          </section>

          {/* Branches List */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <BuildingsIcon size={20} weight="bold" color="var(--color-brand)" />
              Daftar Cabang Aktif ({userStores?.length ?? 0})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {userStores && userStores.length > 0 ? (
                userStores.map((st) => {
                  const isCurrent = store._id === st._id;
                  return (
                    <div
                      key={st._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 18px",
                        background: isCurrent ? "var(--color-brand-light)" : "var(--color-surface-2)",
                        borderRadius: 14,
                        border: isCurrent ? "1.5px solid var(--color-brand)" : "1px solid var(--color-border)",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: isCurrent ? "var(--color-brand)" : "var(--color-surface)",
                            color: isCurrent ? "#ffffff" : "var(--color-brand)",
                            border: isCurrent ? "none" : "1px solid var(--color-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <BuildingsIcon size={20} weight="bold" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-text)" }}>
                            {st.name} — <span style={{ color: "var(--color-brand)" }}>{st.branchName || "Pusat"}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--color-text-3)", marginTop: 2 }}>
                            {st.address || "Alamat belum diatur"} {st.isMainBranch && "• (Cabang Utama)"}
                          </div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: "var(--color-brand)",
                            background: "var(--color-surface)",
                            padding: "5px 12px",
                            borderRadius: 99,
                            border: "1.5px solid var(--color-brand)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            marginLeft: "auto",
                          }}
                        >
                          <CheckCircleIcon size={14} weight="fill" />
                          Sedang Digunakan
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStoreId(st._id);
                            toast.success(`Beralih ke cabang ${st.branchName || st.name}`);
                          }}
                          className="press-tactile"
                          style={{
                            padding: "7px 14px",
                            borderRadius: 8,
                            border: "1px solid var(--color-border)",
                            background: "var(--color-surface)",
                            color: "var(--color-text)",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            marginLeft: "auto",
                          }}
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
      )}

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

function Loader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <UserIcon size={40} color="var(--color-brand)" weight="duotone" style={{ opacity: 0.5 }} />
      <p style={{ color: "var(--color-text-2)", fontSize: 14, margin: 0 }}>Memuat pengaturan...</p>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1.5px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
  boxShadow: "var(--shadow-sm)",
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  margin: "0 0 20px",
  color: "var(--color-text)",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--color-text)",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  border: "1.5px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  fontSize: 14,
  background: "var(--color-surface)",
  color: "var(--color-text)",
  outline: "none",
  boxSizing: "border-box",
};
