import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { PlusIcon, PackageIcon } from "@phosphor-icons/react";
import { SearchFilter } from "#/components/ui/SearchFilter";
import {
  useProductManager,
  ProductTable,
  ProductFormModal,
  ProductDeleteModal,
  type Product,
} from "#/features/produk";

export const Route = createFileRoute("/_app/produk")({ component: Produk });

function Produk() {
  const { store } = useAppStore();
  const rawProducts = useQuery(api.products.list, store ? { storeId: store._id } : "skip");
  const products = (rawProducts as Product[] | undefined) ?? [];

  const {
    showModal,
    setShowModal,
    editId,
    form,
    setForm,
    imagePreview,
    imageUploading,
    saving,
    deleteTarget,
    setDeleteTarget,
    deleting,
    search,
    setSearch,
    pageSize,
    setPageSize,
    page,
    setPage,
    openAdd,
    openEdit,
    handleImageFileChange,
    handleSave,
    handleConfirmDelete,
  } = useProductManager({ storeId: store?._id });

  if (!store || !rawProducts) return <ProdukLoader />;

  return (
    <div className="w-full pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
        <div>
          <div className="eyebrow-tag">KATALOG PRODUK</div>
          <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight mt-0.5">
            Produk Toko
          </h1>
          <p className="text-xs text-[var(--color-text-2)] mt-1">
            {products.length} jenis barang terdaftar dalam sistem
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="press-tactile py-2.5 px-5 rounded-full bg-[var(--color-brand)] text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer shadow-md shadow-primary-500/25"
        >
          <PlusIcon size={16} weight="bold" />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="mb-5 max-w-md">
        <SearchFilter
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Cari berdasarkan nama, kategori, atau barcode..."
        />
      </div>

      {/* Product Table */}
      <ProductTable
        products={products}
        search={search}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      {/* Add / Edit Form Modal */}
      <ProductFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        editId={editId}
        form={form}
        onChangeForm={setForm}
        imagePreview={imagePreview}
        imageUploading={imageUploading}
        onImageFileChange={handleImageFileChange}
        saving={saving}
        onSave={handleSave}
      />

      {/* Delete Confirmation Modal */}
      <ProductDeleteModal
        product={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleting={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function ProdukLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
      <PackageIcon
        size={48}
        weight="duotone"
        className="text-[var(--color-brand)] opacity-50 animate-pulse"
      />
      <p className="text-[var(--color-text-2)] text-sm font-bold">Memuat data produk...</p>
    </div>
  );
}
