import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { useState } from "react";
import { toast } from "sonner";
import { ChartBarIcon } from "@phosphor-icons/react";
import { StockOverviewCards, StockTable, RestockModal } from "#/features/stok";
import type { Product } from "#/features/produk";

export const Route = createFileRoute("/_app/stok")({ component: Stok });

function Stok() {
  const { store } = useAppStore();
  const rawProducts = useQuery(api.products.list, store ? { storeId: store._id } : "skip");
  const products = (rawProducts as Product[] | undefined) ?? [];
  const adjustStock = useMutation(api.products.adjustStock);

  const threshold = store?.lowStockThreshold ?? 5;
  const [activeRestockProduct, setActiveRestockProduct] = useState<Product | null>(null);
  const [restockAmt, setRestockAmt] = useState("10");
  const [saving, setSaving] = useState(false);

  const lowStock = products.filter((p) => p.stock <= threshold);
  const okStock = products.filter((p) => p.stock > threshold);

  const openRestock = (p: Product) => {
    setActiveRestockProduct(p);
    setRestockAmt("10");
  };

  const handleRestock = async () => {
    if (!activeRestockProduct) return;
    const amt = parseInt(restockAmt, 10) || 0;
    if (amt <= 0) {
      toast.error("Jumlah restok harus minimal 1 pcs");
      return;
    }
    setSaving(true);
    try {
      await adjustStock({ id: activeRestockProduct._id, delta: amt });
      toast.success(`Stok ${activeRestockProduct.name} bertambah ${amt} pcs!`, {
        description: `Stok sekarang: ${(activeRestockProduct.stock ?? 0) + amt} pcs`,
      });
      setActiveRestockProduct(null);
      setRestockAmt("10");
    } catch {
      toast.error("Gagal memperbarui stok. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (!store || !rawProducts) return <StokLoader />;

  return (
    <div className="w-full pb-12">
      {/* Header */}
      <div className="mb-6">
        <div className="eyebrow-tag">MANAJEMEN PERSEDIAAN</div>
        <h1 className="mt-0.5 text-2xl font-black tracking-tight text-[var(--color-text)]">
          Kontrol Stok Barang
        </h1>
        <p className="mt-1 text-xs text-[var(--color-text-2)]">
          Pantau dan lakukan restock cepat untuk barang yang hampir habis
        </p>
      </div>

      {/* Overview Metric Cards */}
      <StockOverviewCards lowStockCount={lowStock.length} healthyStockCount={okStock.length} />

      {/* Stock Table & Urgent Alert List */}
      <StockTable
        products={products}
        lowStockProducts={lowStock}
        threshold={threshold}
        onOpenRestock={openRestock}
      />

      {/* Quick Restock Modal */}
      <RestockModal
        product={activeRestockProduct}
        onClose={() => setActiveRestockProduct(null)}
        threshold={threshold}
        restockAmt={restockAmt}
        onChangeRestockAmt={setRestockAmt}
        saving={saving}
        onConfirm={handleRestock}
      />
    </div>
  );
}

function StokLoader() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <ChartBarIcon
        size={48}
        weight="duotone"
        className="animate-pulse text-[var(--color-brand)] opacity-50"
      />
      <p className="text-sm font-bold text-[var(--color-text-2)]">Memuat data persediaan...</p>
    </div>
  );
}
