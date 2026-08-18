import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { useState } from "react";
import { formatIDR, formatIDRInput, parseIDRInput, compressImage } from "#/lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  TrashIcon,
  PackageIcon,
  WarningIcon,
  XIcon,
  FadersIcon,
  CameraIcon,
  ImageIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";

export const Route = createFileRoute("/_app/produk")({ component: Produk });

type Form = {
  name: string;
  category: string;
  price: string;
  stock: string;
  barcode: string;
  imageId: string;
};
const emptyForm: Form = { name: "", category: "", price: "", stock: "", barcode: "", imageId: "" };

function Produk() {
  const { store } = useAppStore();
  const products = useQuery(api.products.list, store ? { storeId: store._id } : "skip");
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<Id<"products"> | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };
  const openEdit = (p: any) => {
    setEditId(p._id);
    setForm({
      name: p.name,
      category: p.category,
      price: formatIDRInput(p.price),
      stock: String(p.stock),
      barcode: p.barcode ?? "",
      imageId: p.imageId ?? "",
    });
    setShowModal(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      setForm((prev) => ({ ...prev, imageId: dataUrl }));
      toast.success("Foto produk berhasil diupload!");
    } catch {
      toast.error("Gagal memuat gambar. Silakan coba file lain.");
    }
  };

  const handleSave = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!store) return;
    const priceNum = parseIDRInput(form.price);
    const stockNum = parseInt(form.stock) || 0;
    if (!form.name.trim() || !form.category.trim() || priceNum <= 0) {
      toast.error("Mohon lengkapi nama, kategori, dan harga yang valid");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await updateProduct({
          id: editId,
          name: form.name.trim(),
          category: form.category.trim(),
          price: priceNum,
          stock: stockNum,
          barcode: form.barcode.trim() || undefined,
          imageId: form.imageId.trim() || undefined,
        });
        toast.success(`Produk "${form.name}" berhasil diperbarui`);
      } else {
        await createProduct({
          storeId: store._id,
          name: form.name.trim(),
          category: form.category.trim(),
          price: priceNum,
          stock: stockNum,
          barcode: form.barcode.trim() || undefined,
          imageId: form.imageId.trim() || undefined,
        });
        toast.success(`Produk "${form.name}" berhasil ditambahkan`);
      }
      setShowModal(false);
    } catch {
      toast.error("Gagal menyimpan produk. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (p: any) => {
    setDeleteTarget(p);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeProduct({ id: deleteTarget._id });
      toast.success(`Produk "${deleteTarget.name}" berhasil dihapus`);
      setDeleteTarget(null);
    } catch {
      toast.error(`Gagal menghapus produk "${deleteTarget.name}"`);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = (products ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const pagedProducts = filtered.slice(startIndex, endIndex);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <div>
      {/* Header aligned cleanly with eyebrow tag and dark capsule pill button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <div className="eyebrow-tag">KATALOG PRODUK</div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              margin: "2px 0 0",
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
            }}
          >
            Produk Toko
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-2)" }}>
            {(products ?? []).length} jenis barang terdaftar dalam sistem
          </p>
        </div>
        <button onClick={openAdd} className="press-tactile" style={darkPillBtn}>
          <span>Tambah Produk</span>
          <div style={nestedIconCircle}>
            <PlusIcon size={14} weight="bold" />
          </div>
        </button>
      </div>

      {/* Pill Search Input Bar */}
      <div style={{ position: "relative", marginBottom: 24, width: "100%", maxWidth: 440 }}>
        <MagnifyingGlassIcon
          size={18}
          weight="bold"
          style={{
            position: "absolute",
            left: 18,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-text-3)",
          }}
        />
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau kategori..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pill-search-input"
          style={{ width: "100%", paddingRight: 48 }}
        />
        <div
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 32,
            height: 32,
            borderRadius: 99,
            background: "#18181b",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FadersIcon size={16} weight="bold" />
        </div>
      </div>

      {/* Content Container — Squircle Card Container */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--color-text-3)" }}>
            <PackageIcon size={52} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Belum ada produk terdaftar</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="desktop-only" style={{ width: "100%" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: "var(--color-surface-2)",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    {["Foto", "Nama Produk", "Kategori", "Harga Jual", "Stok Barang", "Aksi"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            padding: "16px 20px",
                            textAlign: "left",
                            fontSize: 11,
                            fontWeight: 800,
                            color: "var(--color-text-3)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {pagedProducts.map((p) => (
                    <tr key={p._id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={tdStyle}>
                        {p.imageId ? (
                          <img
                            src={p.imageId}
                            alt={p.name}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "var(--radius-sm)",
                              objectFit: "cover",
                              border: "1px solid var(--color-border)",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "var(--radius-sm)",
                              background: "var(--color-surface-2)",
                              border: "1px solid var(--color-border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--color-text-3)",
                            }}
                          >
                            <ImageIcon size={20} weight="duotone" />
                          </div>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "var(--color-text)" }}>
                          {p.name}
                        </div>
                        {p.barcode && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-3)",
                              marginTop: 2,
                              fontFamily: "monospace",
                            }}
                          >
                            SKU: {p.barcode}
                          </div>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            background: "var(--color-surface-2)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 99,
                            padding: "4px 14px",
                            fontSize: 12,
                            color: "var(--color-text-2)",
                            fontWeight: 700,
                          }}
                        >
                          {p.category}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span
                          className="price"
                          style={{ fontWeight: 800, fontSize: 15, color: "var(--color-text)" }}
                        >
                          {formatIDR(p.price)}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 14,
                            color: p.stock <= 5 ? "var(--color-danger)" : "var(--color-text)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          {p.stock <= 5 && (
                            <WarningIcon size={15} weight="fill" color="var(--color-danger)" />
                          )}
                          {p.stock} pcs
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => openEdit(p)}
                            className="press-tactile"
                            style={ghostPillBtn}
                          >
                            <PencilSimpleIcon size={14} weight="bold" /> Edit
                          </button>
                          <button
                            onClick={() => handleRemove(p)}
                            className="press-tactile"
                            style={{
                              ...ghostPillBtn,
                              color: "var(--color-danger)",
                              borderColor: "var(--color-danger-light)",
                              background: "var(--color-danger-light)",
                            }}
                          >
                            <TrashIcon size={14} weight="bold" /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Card List View */}
            <div className="mobile-topbar" style={{ flexDirection: "column" }}>
              {pagedProducts.map((p) => (
                <div
                  key={p._id}
                  style={{
                    padding: "18px 16px",
                    borderBottom: "1px solid var(--color-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    {p.imageId ? (
                      <img
                        src={p.imageId}
                        alt={p.name}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: "var(--radius-md)",
                          objectFit: "cover",
                          border: "1px solid var(--color-border)",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: "var(--radius-md)",
                          background: "var(--color-surface-2)",
                          border: "1px solid var(--color-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-text-3)",
                          flexShrink: 0,
                        }}
                      >
                        <ImageIcon size={24} weight="duotone" />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: "var(--color-text)",
                          marginBottom: 4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.name}
                      </div>
                      <span
                        style={{
                          background: "var(--color-surface-2)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 99,
                          padding: "3px 12px",
                          fontSize: 11,
                          color: "var(--color-text-2)",
                          fontWeight: 700,
                        }}
                      >
                        {p.category}
                      </span>
                    </div>
                    <div
                      className="price"
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        color: "var(--color-text)",
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {formatIDR(p.price)}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        color: p.stock <= 5 ? "var(--color-danger-text)" : "var(--color-text-2)",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      {p.stock <= 5 && <WarningIcon size={15} weight="fill" />}
                      Stok: {p.stock} pcs
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => openEdit(p)}
                        className="press-tactile"
                        style={ghostPillBtn}
                      >
                        <PencilSimpleIcon size={14} weight="bold" /> Edit
                      </button>
                      <button
                        onClick={() => handleRemove(p)}
                        className="press-tactile"
                        style={{
                          ...ghostPillBtn,
                          color: "var(--color-danger)",
                          borderColor: "var(--color-danger-light)",
                          background: "var(--color-danger-light)",
                        }}
                      >
                        <TrashIcon size={14} weight="bold" /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination Controls Bar */}
      {totalCount > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginTop: 20,
            padding: "14px 18px",
            background: "var(--color-surface)",
            border: "1.5px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {/* Left: Summary & Page Size Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "var(--color-text-2)", fontWeight: 600 }}>
              Menampilkan{" "}
              <strong style={{ color: "var(--color-text)" }}>
                {totalCount > 0 ? startIndex + 1 : 0}-{endIndex}
              </strong>{" "}
              dari <strong style={{ color: "var(--color-text)" }}>{totalCount}</strong> produk
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--color-text-3)", fontWeight: 700 }}>
                Per halaman:
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {[5, 10, 20, 50].map((size) => {
                  const active = pageSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handlePageSizeChange(size)}
                      className="press-tactile"
                      style={{
                        padding: "4px 10px",
                        borderRadius: 99,
                        fontSize: 12,
                        fontWeight: active ? 800 : 600,
                        background: active ? "var(--color-brand)" : "var(--color-surface-2)",
                        color: active ? "#ffffff" : "var(--color-text-2)",
                        border: `1px solid ${active ? "var(--color-brand)" : "var(--color-border)"}`,
                        cursor: "pointer",
                        transition: "all 150ms ease",
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Page Navigation Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="press-tactile"
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                border: "1px solid var(--color-border)",
                background: currentPage <= 1 ? "var(--color-surface-2)" : "var(--color-surface)",
                color: currentPage <= 1 ? "var(--color-text-3)" : "var(--color-text)",
                fontSize: 13,
                fontWeight: 700,
                cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                opacity: currentPage <= 1 ? 0.6 : 1,
              }}
              title="Halaman Sebelumnya"
            >
              <CaretLeftIcon size={14} weight="bold" />
              <span>Sebelumnya</span>
            </button>

            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "var(--color-text)",
                padding: "0 6px",
              }}
            >
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="press-tactile"
              style={{
                padding: "6px 14px",
                borderRadius: 99,
                border: "1px solid var(--color-border)",
                background:
                  currentPage >= totalPages ? "var(--color-surface-2)" : "var(--color-surface)",
                color: currentPage >= totalPages ? "var(--color-text-3)" : "var(--color-text)",
                fontSize: 13,
                fontWeight: 700,
                cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                opacity: currentPage >= totalPages ? 0.6 : 1,
              }}
              title="Halaman Berikutnya"
            >
              <span>Berikutnya</span>
              <CaretRightIcon size={14} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Form with Image Upload & Instant Live Preview */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div style={{ marginBottom: 20 }}>
            <div className="eyebrow-tag">{editId ? "UBAH DATA" : "TAMBAH BARANG"}</div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                margin: "2px 0 0",
                color: "var(--color-text)",
                letterSpacing: "-0.02em",
              }}
            >
              {editId ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>
          </div>

          <form onSubmit={handleSave}>
            {/* Image Upload & Live Preview Component */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Foto Produk (opsional)</label>
              {form.imageId ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 160,
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <img
                    src={form.imageId}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, imageId: "" }))}
                    className="press-tactile"
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      background: "#18181b",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 99,
                      padding: 6,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    }}
                    title="Hapus foto"
                  >
                    <XIcon size={16} weight="bold" />
                  </button>
                </div>
              ) : (
                <label
                  className="press-tactile"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "24px 16px",
                    border: "2px dashed var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-surface-2)",
                    cursor: "pointer",
                    color: "var(--color-text-2)",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 99,
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CameraIcon size={22} weight="duotone" color="var(--color-text)" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}>
                    Unggah Foto Produk
                  </span>
                  <span style={{ fontSize: 11, color: "var(--color-text-3)" }}>
                    Klik untuk memilih gambar dari galeri/perangkat
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nama Produk</label>
              <input
                type="text"
                placeholder="Contoh: Nike Kobe 5 Protro..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{ ...inputStyle, borderRadius: 99, padding: "12px 20px" }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Kategori Produk</label>
              <input
                type="text"
                placeholder="Contoh: Apparel, Sembako, Minuman..."
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                style={{ ...inputStyle, borderRadius: 99, padding: "12px 20px" }}
              />
            </div>

            {/* Formatted Price Input */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Harga Jual (IDR)</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 16,
                    fontSize: 15,
                    fontWeight: 800,
                    color: "var(--color-text-2)",
                  }}
                >
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="120.000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: formatIDRInput(e.target.value) })}
                  required
                  className="price"
                  style={{
                    ...inputStyle,
                    paddingLeft: 48,
                    fontWeight: 800,
                    fontSize: 16,
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Jumlah Stok Awal</label>
              <input
                type="number"
                placeholder="50"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                required
                style={{ ...inputStyle, borderRadius: 99, padding: "12px 20px" }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Barcode / SKU (opsional)</label>
              <input
                type="text"
                placeholder="Kode Barcode / SKUs"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                style={{ ...inputStyle, borderRadius: 99, padding: "12px 20px" }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="press-tactile"
                style={{ ...ghostPillBtn, flex: 1, padding: "12px", justifyContent: "center" }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="press-tactile"
                style={{ ...darkPillBtn, flex: 1, padding: "12px", justifyContent: "center" }}
              >
                {saving ? "Menyimpan..." : "Simpan Produk"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal onClose={() => !deleting && setDeleteTarget(null)}>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 99,
                background: "rgba(239, 68, 68, 0.12)",
                color: "var(--color-danger)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <TrashIcon size={28} weight="duotone" />
            </div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 800,
                margin: "0 0 8px",
                color: "var(--color-text)",
              }}
            >
              Hapus Produk?
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "var(--color-text-2)",
                margin: "0 0 24px",
                lineHeight: 1.5,
              }}
            >
              Apakah Anda yakin ingin menghapus{" "}
              <strong style={{ color: "var(--color-text)" }}>"{deleteTarget.name}"</strong>?
              Tindakan ini tidak dapat diurungkan.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="press-tactile"
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  borderRadius: 99,
                  border: "1.5px solid var(--color-border)",
                  background: "var(--color-surface-2)",
                  color: "var(--color-text)",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="press-tactile"
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  borderRadius: 99,
                  border: "none",
                  background: "var(--color-danger)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: deleting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(239, 68, 68, 0.35)",
                }}
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="animate-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        backdropFilter: "blur(8px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-modal"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: 28,
          width: "100%",
          maxWidth: 480,
          boxShadow: "var(--shadow-lg)",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          className="press-tactile"
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: 99,
            cursor: "pointer",
            color: "var(--color-text-2)",
            display: "flex",
            padding: 6,
          }}
        >
          <XIcon size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "12px 16px",
  border: "1.5px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  fontSize: 15,
  background: "var(--color-surface)",
  color: "var(--color-text)",
  outline: "none",
  width: "100%",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--color-text)",
  marginBottom: 8,
};
const tdStyle: React.CSSProperties = {
  padding: "16px 20px",
  fontSize: 14,
  color: "var(--color-text)",
};
const darkPillBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  background: "#18181b",
  color: "#ffffff",
  border: "none",
  borderRadius: 99,
  padding: "8px 8px 8px 20px",
  fontWeight: 800,
  fontSize: 14,
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
};
const ghostPillBtn: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border)",
  borderRadius: 99,
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  color: "var(--color-text-2)",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const nestedIconCircle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 99,
  background: "rgba(255,255,255,0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
