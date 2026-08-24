import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { useState } from "react";
import {
  formatIDR,
  formatIDRInput,
  parseIDRInput,
  compressImageToBlob,
  calculateItemDiscount,
} from "#/lib/utils";
import { Modal } from "#/components/Modal";
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
  CircleNotchIcon,
  TagIcon,
} from "@phosphor-icons/react";

export const Route = createFileRoute("/_app/produk")({ component: Produk });

type Form = {
  name: string;
  category: string;
  price: string;
  stock: string;
  barcode: string;
  imageId: string;
  discountType: "none" | "percentage" | "nominal";
  discountValue: string;
};
const emptyForm: Form = {
  name: "",
  category: "",
  price: "",
  stock: "",
  barcode: "",
  imageId: "",
  discountType: "none",
  discountValue: "",
};

function Produk() {
  const { store, isPro, openUpgradeModal } = useAppStore();
  const products = useQuery(api.products.list, store ? { storeId: store._id } : "skip");
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<Id<"products"> | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageUploading, setImageUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const openAdd = () => {
    if (!isPro && products && products.length >= 100) {
      toast.error("Batas 100 produk tercapai pada Free Tier", {
        description: "Upgrade ke Toku Pro untuk input produk tanpa batas.",
      });
      openUpgradeModal("yearly");
      return;
    }
    setEditId(null);
    setForm(emptyForm);
    setImagePreview("");
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
      discountType: p.discountType ?? "none",
      discountValue:
        p.discountType === "percentage"
          ? String(p.discountValue ?? "")
          : p.discountType === "nominal"
            ? formatIDRInput(p.discountValue ?? "")
            : "",
    });
    setImagePreview(p.imageUrl ?? p.imageId ?? "");
    setShowModal(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      // 1. Compress image to clean JPEG Blob (~50-100KB)
      const blob = await compressImageToBlob(file);
      const localPreview = URL.createObjectURL(blob);
      setImagePreview(localPreview);

      // 2. Request short-lived upload URL from Convex
      const postUrl = await generateUploadUrl();

      // 3. POST the file directly to Convex Storage
      const res = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();

      setForm((prev) => ({ ...prev, imageId: storageId }));
      toast.success("Foto produk berhasil diunggah!");
    } catch {
      toast.error("Gagal mengunggah foto. Silakan coba lagi.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!store) return;
    if (imageUploading) {
      toast.error("Mohon tunggu proses upload foto selesai");
      return;
    }
    const priceNum = parseIDRInput(form.price);
    const stockNum = parseInt(form.stock) || 0;
    if (!form.name.trim() || !form.category.trim() || priceNum <= 0) {
      toast.error("Mohon lengkapi nama, kategori, dan harga yang valid");
      return;
    }

    let discountTypeVal: "percentage" | "nominal" | undefined = undefined;
    let discountNum: number | undefined = undefined;

    if (form.discountType === "percentage") {
      const pct = Math.min(100, Math.max(0, parseInt(form.discountValue, 10) || 0));
      if (pct > 0) {
        discountTypeVal = "percentage";
        discountNum = pct;
      }
    } else if (form.discountType === "nominal") {
      const nom = parseIDRInput(form.discountValue);
      if (nom > 0) {
        discountTypeVal = "nominal";
        discountNum = Math.min(priceNum, nom);
      }
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
          discountType: discountTypeVal,
          discountValue: discountNum,
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
          discountType: discountTypeVal,
          discountValue: discountNum,
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
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-2)", display: "flex", alignItems: "center", gap: 8 }}>
            <span>{(products ?? []).length} / {isPro ? "∞" : "100"} produk terdaftar</span>
            {!isPro && (
              <span
                onClick={() => openUpgradeModal("yearly")}
                style={{
                  color: "var(--color-brand)",
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                (Upgrade Pro untuk Unlimited)
              </span>
            )}
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
                        {(p.imageUrl || p.imageId) ? (
                          <img
                            src={p.imageUrl || p.imageId}
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
                        {p.discountType && p.discountValue ? (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span
                                className="price"
                                style={{ fontWeight: 800, fontSize: 15, color: "var(--color-brand)" }}
                              >
                                {formatIDR(
                                  calculateItemDiscount(p.price, p.discountType, p.discountValue)
                                    .unitPrice,
                                )}
                              </span>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  background: "var(--color-brand-light)",
                                  color: "var(--color-brand)",
                                  border: "1px solid var(--color-brand)",
                                  padding: "1px 6px",
                                  borderRadius: 99,
                                }}
                              >
                                {p.discountType === "percentage"
                                  ? `${p.discountValue}% OFF`
                                  : `-${formatIDR(p.discountValue)}`}
                              </span>
                            </div>
                            <div
                              className="price"
                              style={{
                                fontSize: 11,
                                color: "var(--color-text-3)",
                                textDecoration: "line-through",
                                marginTop: 1,
                              }}
                            >
                              {formatIDR(p.price)}
                            </div>
                          </div>
                        ) : (
                          <span
                            className="price"
                            style={{ fontWeight: 800, fontSize: 15, color: "var(--color-text)" }}
                          >
                            {formatIDR(p.price)}
                          </span>
                        )}
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
              {pagedProducts.map((p) => {
                const disc = calculateItemDiscount(p.price, p.discountType, p.discountValue);
                return (
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
                      {p.imageUrl || p.imageId ? (
                        <img
                          src={p.imageUrl || p.imageId}
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
                            lineHeight: 1.2,
                          }}
                        >
                          {p.name}
                        </div>
                        {p.barcode && (
                          <div
                            style={{
                              fontSize: 10,
                              fontFamily: "monospace",
                              color: "var(--color-text-3)",
                              marginTop: 2,
                            }}
                          >
                            #{p.barcode}
                          </div>
                        )}
                        <div
                          style={{
                            display: "inline-block",
                            marginTop: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--color-brand)",
                            background: "var(--color-surface-2)",
                            padding: "2px 8px",
                            borderRadius: 99,
                          }}
                        >
                          {p.category}
                        </div>
                      </div>
                    </div>

                    {/* Stock & Price Row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "var(--color-surface-2)",
                        padding: "10px 12px",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--color-text-3)",
                            textTransform: "uppercase",
                          }}
                        >
                          Harga Jual
                        </div>
                        {disc.hasDiscount ? (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div
                                className="price"
                                style={{
                                  fontWeight: 800,
                                  fontSize: 15,
                                  color: "var(--color-brand)",
                                }}
                              >
                                {formatIDR(disc.unitPrice)}
                              </div>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  background: "var(--color-brand-light)",
                                  color: "var(--color-brand)",
                                  padding: "1px 6px",
                                  borderRadius: 99,
                                }}
                              >
                                {p.discountType === "percentage"
                                  ? `${p.discountValue}% OFF`
                                  : `-${formatIDR(p.discountValue ?? 0)}`}
                              </span>
                            </div>
                            <div
                              className="price"
                              style={{
                                fontSize: 11,
                                color: "var(--color-text-3)",
                                textDecoration: "line-through",
                              }}
                            >
                              {formatIDR(p.price)}
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: 15,
                              color: "var(--color-brand)",
                              fontFamily: "monospace",
                            }}
                          >
                            {formatIDR(p.price)}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--color-text-3)",
                            textTransform: "uppercase",
                          }}
                        >
                          Stok
                        </div>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 700,
                            color: p.stock === 0 ? "var(--color-danger)" : "var(--color-text)",
                          }}
                        >
                          {p.stock === 0 && <WarningIcon size={12} weight="fill" />}
                          {p.stock} pcs
                        </span>
                      </div>
                    </div>

                    {/* Mobile Actions */}
                    <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                      <button
                        onClick={() => openEdit(p)}
                        className="press-tactile"
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          padding: "8px 0",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--color-text)",
                          cursor: "pointer",
                        }}
                      >
                        <PencilSimpleIcon size={14} weight="bold" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleRemove(p)}
                        className="press-tactile"
                        style={{
                          padding: "8px 14px",
                          borderRadius: "var(--radius-sm)",
                          background: "var(--color-danger-light)",
                          border: "1px solid var(--color-danger-light)",
                          color: "var(--color-danger)",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <TrashIcon size={14} weight="bold" />
                      </button>
                    </div>
                  </div>
                );
              })}
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

      {/* Add / Edit Product Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} maxWidth={540}>
          <div style={{ marginBottom: 20 }}>
            <div className="eyebrow-tag" style={{ marginBottom: 6 }}>
              {editId ? "UBAH DATA" : "TAMBAH BARANG"}
            </div>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                margin: 0,
                color: "var(--color-text)",
                letterSpacing: "-0.02em",
              }}
            >
              {editId ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>
            <p style={{ fontSize: 13, color: "var(--color-text-3)", margin: "4px 0 0" }}>
              {editId
                ? "Perbarui rincian produk, harga, stok, dan barcode"
                : "Lengkapi data produk untuk mulai menjual di kasir"}
            </p>
          </div>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column" }}>
            {/* 1:1 Box Style Image Upload & Live Preview */}
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                background: "var(--color-surface-2)",
                padding: 14,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                marginBottom: 16,
              }}
            >
              {/* Square Image Box (1:1 Aspect Ratio) */}
              <div
                style={{
                  position: "relative",
                  width: 104,
                  height: 104,
                  minWidth: 104,
                  borderRadius: 16,
                  overflow: "hidden",
                  border: (imagePreview || form.imageId)
                    ? "1.5px solid var(--color-border)"
                    : "2px dashed var(--color-border)",
                  background: "var(--color-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--shadow-sm)",
                  flexShrink: 0,
                }}
              >
                {imageUploading ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      color: "var(--color-brand)",
                    }}
                  >
                    <CircleNotchIcon size={24} className="animate-spin" />
                    <span style={{ fontSize: 10, fontWeight: 700 }}>Mengunggah...</span>
                  </div>
                ) : (imagePreview || form.imageId) ? (
                  <>
                    <img
                      src={imagePreview || form.imageId}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, imageId: "" }));
                        setImagePreview("");
                      }}
                      className="press-tactile"
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        background: "rgba(0, 0, 0, 0.75)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 99,
                        width: 24,
                        height: 24,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                      title="Hapus foto"
                    >
                      <XIcon size={13} weight="bold" />
                    </button>
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      color: "var(--color-text-3)",
                    }}
                  >
                    <CameraIcon size={28} weight="duotone" color="var(--color-brand)" />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-3)" }}>
                      1:1 Kotak
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Action / Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--color-text)",
                    marginBottom: 2,
                  }}
                >
                  Foto Produk
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-3)",
                    lineHeight: 1.4,
                    marginBottom: 10,
                  }}
                >
                  Format JPG, PNG atau WebP. Gambar dikompres dan disimpan di Convex Cloud Storage.
                </div>
                <label
                  className="press-tactile"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 99,
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: imageUploading ? "not-allowed" : "pointer",
                    boxShadow: "var(--shadow-sm)",
                    opacity: imageUploading ? 0.6 : 1,
                  }}
                >
                  {imageUploading ? (
                    <CircleNotchIcon size={15} className="animate-spin" color="var(--color-brand)" />
                  ) : (
                    <CameraIcon size={15} weight="bold" color="var(--color-brand)" />
                  )}
                  <span>
                    {imageUploading
                      ? "Mengunggah..."
                      : (imagePreview || form.imageId)
                        ? "Ganti Foto"
                        : "Pilih Foto"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={imageUploading}
                    onChange={handleImageFileChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nama Produk</label>
              <input
                type="text"
                placeholder="Contoh: Kopi Susu Aren..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                style={{ ...inputStyle, borderRadius: "var(--radius-md)" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Kategori Produk</label>
                <input
                  type="text"
                  placeholder="Contoh: Minuman"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                  style={{ ...inputStyle, borderRadius: "var(--radius-md)" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Jumlah Stok Awal</label>
                <input
                  type="number"
                  placeholder="50"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                  style={{ ...inputStyle, borderRadius: "var(--radius-md)" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              {/* Formatted Price Input */}
              <div>
                <label style={labelStyle}>Harga Jual (IDR)</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 14,
                      fontSize: 14,
                      fontWeight: 800,
                      color: "var(--color-brand)",
                    }}
                  >
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="15.000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: formatIDRInput(e.target.value) })}
                    required
                    className="price"
                    style={{
                      ...inputStyle,
                      paddingLeft: 42,
                      fontWeight: 800,
                      fontSize: 15,
                      borderRadius: "var(--radius-md)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Barcode / SKU (opsional)</label>
                <input
                  type="text"
                  placeholder="Kode Barcode / SKU"
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                  style={{ ...inputStyle, borderRadius: "var(--radius-md)" }}
                />
              </div>
            </div>

            {/* PRODUCT DISCOUNT SECTION */}
            <div
              style={{
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 800,
                    color: "var(--color-text)",
                  }}
                >
                  <TagIcon size={16} weight="bold" color="var(--color-brand)" />
                  <span>Diskon Produk (Opsional)</span>
                </div>
                {form.discountType !== "none" && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, discountType: "none", discountValue: "" })}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--color-text-3)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Hapus Diskon
                  </button>
                )}
              </div>

              {/* Type Switcher */}
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {[
                  { key: "none", label: "Tanpa Diskon" },
                  { key: "percentage", label: "Persen (%)" },
                  { key: "nominal", label: "Nominal (Rp)" },
                ].map((t) => {
                  const active = form.discountType === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          discountType: t.key as any,
                          discountValue: t.key === form.discountType ? form.discountValue : "",
                        })
                      }
                      className="press-tactile"
                      style={{
                        flex: 1,
                        padding: "7px 4px",
                        borderRadius: 99,
                        border: `1.5px solid ${active ? "var(--color-brand)" : "var(--color-border)"}`,
                        background: active ? "var(--color-brand-light)" : "var(--color-surface)",
                        color: active ? "var(--color-brand)" : "var(--color-text-2)",
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        transition: "all 150ms ease",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {form.discountType === "percentage" && (
                <div>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Contoh: 10"
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      style={{
                        ...inputStyle,
                        paddingRight: 36,
                        fontWeight: 800,
                        fontSize: 15,
                        borderRadius: "var(--radius-md)",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: 14,
                        fontSize: 15,
                        fontWeight: 800,
                        color: "var(--color-brand)",
                      }}
                    >
                      %
                    </span>
                  </div>
                  {/* Quick percentage pills */}
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {[5, 10, 15, 20, 25, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setForm({ ...form, discountValue: String(pct) })}
                        className="press-tactile"
                        style={{
                          padding: "3px 10px",
                          borderRadius: 99,
                          border: "1px solid var(--color-border)",
                          background:
                            form.discountValue === String(pct)
                              ? "var(--color-brand)"
                              : "var(--color-surface)",
                          color:
                            form.discountValue === String(pct)
                              ? "#ffffff"
                              : "var(--color-text)",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {form.discountType === "nominal" && (
                <div>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        fontSize: 14,
                        fontWeight: 800,
                        color: "var(--color-brand)",
                      }}
                    >
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Contoh: 5.000"
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm({ ...form, discountValue: formatIDRInput(e.target.value) })
                      }
                      style={{
                        ...inputStyle,
                        paddingLeft: 42,
                        fontWeight: 800,
                        fontSize: 15,
                        borderRadius: "var(--radius-md)",
                      }}
                    />
                  </div>
                  {/* Quick nominal pills */}
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {[2000, 5000, 10000, 20000, 50000].map((nom) => (
                      <button
                        key={nom}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, discountValue: formatIDRInput(nom) })
                        }
                        className="press-tactile"
                        style={{
                          padding: "3px 10px",
                          borderRadius: 99,
                          border: "1px solid var(--color-border)",
                          background:
                            parseIDRInput(form.discountValue) === nom
                              ? "var(--color-brand)"
                              : "var(--color-surface)",
                          color:
                            parseIDRInput(form.discountValue) === nom
                              ? "#ffffff"
                              : "var(--color-text)",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {nom >= 1000 ? `${nom / 1000}rb` : formatIDR(nom)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Preview Summary */}
              {form.discountType !== "none" &&
                (parseIDRInput(form.price) > 0) &&
                ((form.discountType === "percentage" && parseInt(form.discountValue) > 0) ||
                  (form.discountType === "nominal" && parseIDRInput(form.discountValue) > 0)) && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--color-brand-light)",
                      border: "1px solid var(--color-brand)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--color-text-2)",
                        }}
                      >
                        Harga setelah diskon:
                      </div>
                      <div
                        className="price"
                        style={{ fontSize: 16, fontWeight: 800, color: "var(--color-brand)" }}
                      >
                        {formatIDR(
                          calculateItemDiscount(
                            parseIDRInput(form.price),
                            form.discountType,
                            form.discountType === "percentage"
                              ? parseInt(form.discountValue) || 0
                              : parseIDRInput(form.discountValue),
                          ).unitPrice,
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "var(--color-brand)",
                        background: "var(--color-surface)",
                        padding: "4px 10px",
                        borderRadius: 99,
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      Hemat{" "}
                      {formatIDR(
                        calculateItemDiscount(
                          parseIDRInput(form.price),
                          form.discountType,
                          form.discountType === "percentage"
                            ? parseInt(form.discountValue) || 0
                            : parseIDRInput(form.discountValue),
                        ).discountAmount,
                      )}
                    </span>
                  </div>
                )}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="press-tactile"
                style={{ ...ghostPillBtn, flex: 1, padding: "12px", justifyContent: "center", borderRadius: 99 }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="press-tactile"
                style={{
                  flex: 1,
                  padding: "12px",
                  justifyContent: "center",
                  borderRadius: 99,
                  background: "var(--color-brand)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: 14,
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(234, 88, 12, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {saving ? "Menyimpan..." : "Simpan Produk"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal onClose={() => !deleting && setDeleteTarget(null)} maxWidth={440}>
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
