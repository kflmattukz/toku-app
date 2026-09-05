import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { PlusIcon, PackageIcon } from "@phosphor-icons/react";
import { SearchFilter } from "#/components/ui/SearchFilter";
import { Button } from "#/components/ui";
import {
  useProductManager,
  ProductTable,
  ProductFormModal,
  ProductDeleteModal,
  type Product,
} from "#/features/produk";

import { useEffect } from "react";

export const Route = createFileRoute("/_app/produk")({
  validateSearch: (search: Record<string, unknown>) => ({
    barcode: typeof search.barcode === "string" ? search.barcode : undefined,
  }),
  component: Produk,
});

function Produk() {
  const { barcode } = Route.useSearch();
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

  useEffect(() => {
    if (barcode) {
      openAdd(barcode);
    }
  }, [barcode]);

  if (!store || !rawProducts) return <ProdukLoader />;

  return (
    <div className="w-full pb-12">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="eyebrow-tag">KATALOG PRODUK</div>
          <h1 className="mt-0.5 text-2xl font-black tracking-tight text-[var(--color-text)]">
            Produk Toko
          </h1>
          <p className="mt-1 text-xs text-[var(--color-text-2)]">
            {products.length} jenis barang terdaftar dalam sistem
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          leftIcon={<PlusIcon size={16} weight="bold" />}
          onClick={() => openAdd()}
        >
          Tambah Produk
        </Button>
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
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <PackageIcon
        size={48}
        weight="duotone"
        className="animate-pulse text-[var(--color-brand)] opacity-50"
      />
      <p className="text-sm font-bold text-[var(--color-text-2)]">Memuat data produk...</p>
    </div>
  );
}
