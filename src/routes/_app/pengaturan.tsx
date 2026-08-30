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
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCategory =
    UMKM_CATEGORIES.find((c) => c.value === value) || UMKM_CATEGORIES[0];
  const ActiveIcon = activeCategory.icon;

  const filtered = UMKM_CATEGORIES.filter((c) => {
    const q = search.toLowerCase();
    return c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
  }, [isOpen]);

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

      {/* Floating Popover Options Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 100,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.16)",
            padding: 10,
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

          {/* Options Grid / List */}
          <div
            style={{
              overflowY: "auto",
              maxHeight: 290,
              display: "flex",
              flexDirection: "column",
              gap: 4,
              paddingRight: 4,
            }}
          >
            {filtered.length > 0 ? (
              filtered.map((cat) => {
                const Icon = cat.icon;
                const isSelected = cat.value === value;
                return (
                  <div
                    key={cat.value}
                    onClick={() => {
                      onChange(cat.value);
                      setIsOpen(false);
                    }}
                    className="press-tactile"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      cursor: "pointer",
                      background: isSelected
                        ? "var(--color-brand-light)"
                        : "transparent",
                      border: isSelected
                        ? "1px solid var(--color-brand)"
                        : "1px solid transparent",
                      transition: "all 120ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "var(--color-surface-2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: isSelected
                            ? "var(--color-brand)"
                            : "var(--color-surface-2)",
                          color: isSelected ? "#ffffff" : "var(--color-text)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} weight={isSelected ? "bold" : "regular"} />
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
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  fontSize: 13,
                  color: "var(--color-text-3)",
                }}
              >
                Kategori tidak ditemukan.
              </div>
            )}
          </div>
        </div>
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
  const [newCashierRole, setNewCashierRole] = useState<"owner" | "manager" | "cashier">("cashier");
  const [isAddingCashier, setIsAddingCashier] = useState(false);

  // Edit Cashier modal state
  const [editingCashier, setEditingCashier] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editPin, setEditPin] = useState("");
  const [editRole, setEditRole] = useState<"owner" | "manager" | "cashier">("cashier");
  const [isUpdatingCashier, setIsUpdatingCashier] = useState(false);

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

  const handleDeleteCashier = async (id: Id<"cashiers">) => {
    try {
      await deleteCashier({ id });
      toast.success("Kasir berhasil dihapus");
    } catch {
      toast.error("Gagal menghapus kasir");
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
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  if (!store) return <Loader />;

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header & Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "var(--color-text)" }}>
            Pengaturan & Kelola Toko
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-text-3)", margin: "4px 0 0" }}>
            Konfigurasi profil usaha, staf kasir, dan multi-cabang
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          borderBottom: "1px solid var(--color-border)",
          paddingBottom: 8,
          overflowX: "auto",
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
              onClick={() => setActiveTab(tab.id as SettingTab)}
              className="press-tactile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 99,
                border: "none",
                background: active ? "var(--color-brand)" : "transparent",
                color: active ? "#ffffff" : "var(--color-text-2)",
                fontSize: 13,
                fontWeight: active ? 800 : 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 180ms ease",
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
        <>
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <StorefrontIcon size={20} weight="bold" color="var(--color-brand)" />
              Informasi Usaha
            </h2>
            <form onSubmit={handleSaveStore}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
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
                <label style={labelStyle}>Kategori Usaha</label>
                <CategorySelectPicker value={category} onChange={setCategory} />
                <span style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 6, display: "block" }}>
                  Kategori menentukan klasifikasi profil bisnis UMKM Anda.
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

              <div style={{ marginBottom: 20 }}>
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
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  style={inputStyle}
                />
                <span style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 4, display: "block" }}>
                  Sistem akan otomatis memberi tanda merah jika stok barang kurang dari jumlah ini.
                </span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="press-tactile"
                style={{
                  padding: "12px 24px",
                  background: saved ? "var(--color-success)" : "var(--color-brand)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontSize: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {saved ? (
                  <>
                    <CheckIcon size={18} weight="bold" /> Tersimpan!
                  </>
                ) : saving ? (
                  "Menyimpan..."
                ) : (
                  "Simpan Perubahan"
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
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 99,
                    background: "var(--color-surface-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {dark ? (
                    <MoonIcon size={22} weight="duotone" color="var(--color-brand)" />
                  ) : (
                    <SunIcon size={22} weight="duotone" color="var(--color-warning)" />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>
                    Mode Gelap (Dark Mode)
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-2)", marginTop: 2 }}>
                    Mengubah warna aplikasi ke nuansa gelap yang nyaman di mata
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleDark}
                type="button"
                aria-label="Toggle dark mode"
                style={{
                  width: 54,
                  height: 30,
                  borderRadius: 99,
                  background: dark ? "var(--color-brand)" : "var(--color-border)",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 200ms",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 99,
                    background: "#ffffff",
                    position: "absolute",
                    top: 3,
                    transition: "left 200ms",
                    left: dark ? 27 : 3,
                    boxShadow: "0 1px 3px rgba(0,0,0,.3)",
                  }}
                />
              </button>
            </div>
          </section>

          {/* Account */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <UserIcon size={20} weight="bold" color="var(--color-brand)" />
              Akun Pengguna
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              {session?.user.image ? (
                <img
                  src={session.user.image}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 99,
                    border: "2px solid var(--color-border)",
                    objectFit: "cover",
                  }}
                  alt="avatar"
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 99,
                    background: "var(--color-brand-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserIcon size={24} weight="duotone" color="var(--color-brand)" />
                </div>
              )}
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>
                  {session?.user.name}
                </div>
                <div style={{ fontSize: 13, color: "var(--color-text-2)" }}>{session?.user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="press-tactile"
              style={{
                padding: "10px 18px",
                border: "1px solid var(--color-danger)",
                background: "none",
                color: "var(--color-danger)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 13,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <SignOutIcon size={16} /> Keluar dari Akun
            </button>
          </section>
        </>
      )}

      {/* TAB 2: STAF & KASIR PIN */}
      {activeTab === "cashiers" && (
        <div>
          {!isOwner ? (
            <section
              style={{
                ...sectionStyle,
                background: "linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-2) 100%)",
                border: "1.5px dashed var(--color-border)",
                borderRadius: "var(--radius-xl)",
                padding: "56px 24px",
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
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
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
                      <input
                        type="password"
                        maxLength={4}
                        value={newCashierPin}
                        onChange={(e) => setNewCashierPin(e.target.value)}
                        placeholder="Contoh: 1234"
                        required
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Peran (Role)</label>
                      <select
                        value={newCashierRole}
                        onChange={(e) => setNewCashierRole(e.target.value as any)}
                        style={inputStyle}
                      >
                        <option value="cashier">Kasir</option>
                        <option value="manager">Manager</option>
                        <option value="owner">Owner</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAddingCashier}
                    className="press-tactile"
                    style={{
                      padding: "10px 18px",
                      background: "var(--color-brand)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: isAddingCashier ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <PlusIcon size={16} weight="bold" />
                    {isAddingCashier ? "Menyimpan..." : "Tambahkan Staf"}
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
                      return (
                        <div
                          key={c._id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 16px",
                            background: "var(--color-surface-2)",
                            borderRadius: 14,
                            border: "1px solid var(--color-border)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 99,
                                background: "var(--color-brand-light)",
                                color: "var(--color-brand)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                              }}
                            >
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 800,
                                  color: "var(--color-text)",
                                }}
                              >
                                {c.name}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "var(--color-text-3)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <span>
                                  Role:{" "}
                                  <strong style={{ textTransform: "capitalize" }}>{c.role}</strong>
                                </span>
                                <span>•</span>
                                <span>PIN: ••••</span>
                                {isLastOwner && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 800,
                                      color: "var(--color-brand)",
                                      background: "var(--color-brand-light)",
                                      padding: "1px 6px",
                                      borderRadius: 6,
                                    }}
                                  >
                                    Owner Utama
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button
                              onClick={() => handleOpenEditCashier(c)}
                              className="press-tactile"
                              title="Edit Staf / Ubah PIN"
                              style={{
                                background: "var(--color-surface)",
                                border: "1px solid var(--color-border)",
                                borderRadius: 8,
                                color: "var(--color-text)",
                                cursor: "pointer",
                                padding: "6px 10px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              <PencilSimpleIcon size={14} />
                              <span>Edit</span>
                            </button>

                            <button
                              disabled={isLastOwner}
                              onClick={() => handleDeleteCashier(c._id)}
                              className="press-tactile"
                              title={
                                isLastOwner
                                  ? "Tidak dapat menghapus satu-satunya akun Owner toko"
                                  : "Hapus Kasir"
                              }
                              style={{
                                background: "transparent",
                                border: "none",
                                color: isLastOwner ? "var(--color-text-3)" : "var(--color-danger)",
                                cursor: isLastOwner ? "not-allowed" : "pointer",
                                opacity: isLastOwner ? 0.4 : 1,
                                padding: 6,
                              }}
                            >
                              <TrashIcon size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "20px 0",
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
            <Modal onClose={() => !isUpdatingCashier && setEditingCashier(null)}>
              <div style={{ maxWidth: 400 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px", color: "var(--color-text)" }}>
                  Ubah Data Staf / Kasir
                </h3>

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
                    <input
                      type="password"
                      maxLength={4}
                      value={editPin}
                      onChange={(e) => setEditPin(e.target.value)}
                      required
                      style={inputStyle}
                    />
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
                      <option value="cashier">Kasir</option>
                      <option value="manager">Manager</option>
                      <option value="owner">Owner</option>
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
                      }}
                    >
                      {isUpdatingCashier ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* TAB 3: CABANG / OUTLET */}
      {activeTab === "branches" && (
        <div>
          {/* Add Branch Form */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              <BuildingsIcon size={20} weight="bold" color="var(--color-brand)" />
              Tambah Cabang Baru
            </h2>

            <form onSubmit={handleCreateBranch}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
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
                className="press-tactile"
                style={{
                  padding: "10px 18px",
                  background: "var(--color-brand)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: isAddingBranch ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
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
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: isCurrent ? "var(--color-brand)" : "var(--color-surface)",
                            color: isCurrent ? "#ffffff" : "var(--color-brand)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <BuildingsIcon size={20} weight="bold" />
                        </div>
                        <div>
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
                            background: "#ffffff",
                            padding: "4px 10px",
                            borderRadius: 99,
                            border: "1px solid var(--color-brand)",
                          }}
                        >
                          Sedang Aktif
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedStoreId(st._id);
                            toast.success(`Beralih ke cabang ${st.branchName || st.name}`);
                          }}
                          className="press-tactile"
                          style={{
                            padding: "6px 12px",
                            borderRadius: 8,
                            border: "1px solid var(--color-border)",
                            background: "var(--color-surface)",
                            color: "var(--color-text)",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
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
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  padding: "24px",
  marginBottom: 20,
  boxShadow: "var(--shadow-sm)",
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
  fontWeight: 600,
  color: "var(--color-text)",
  marginBottom: 8,
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  fontSize: 14,
  background: "var(--color-surface)",
  color: "var(--color-text)",
  outline: "none",
  boxSizing: "border-box",
};
