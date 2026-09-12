import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import {
  useStorefrontCart,
  StorefrontHeader,
  StorefrontSearchBar,
  StorefrontProductCard,
  StorefrontCartSidebar,
  StorefrontFloatingCartBar,
  StorefrontCheckoutModal,
  StorefrontSkeleton,
  StorefrontClosedState,
  type StorefrontProduct,
  type CheckoutFormValues,
} from "../features/storefront";
import { VariantSelectionModal } from "../features/kasir";

export const Route = createFileRoute("/s/$storeSlug")({
  component: PublicStoreCatalog,
});

function PublicStoreCatalog() {
  const { storeSlug } = Route.useParams();
  const navigate = useNavigate();

  // Data fetching
  const data = useQuery(api.stores.getBySlugOrId, { identifier: storeSlug });
  const createOrder = useMutation(api.onlineOrders.create);

  // Cart state & persistence
  const { cart, updateQty, clearCart, totalItems, total, subtotal } = useStorefrontCart(storeSlug);

  // Search & category filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variantModalProduct, setVariantModalProduct] = useState<StorefrontProduct | null>(null);

  const store = data?.store;
  const products: StorefrontProduct[] = (data?.products ?? []) as StorefrontProduct[];

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Distinct category list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  // Order submission
  const handleCheckoutSubmit = async (values: CheckoutFormValues) => {
    if (!store) return;

    if (!values.customerName.trim()) {
      toast.error("Nama pemesan wajib diisi.");
      return;
    }

    const cleanPhone = values.customerPhone.trim().replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      toast.error("Nomor WhatsApp wajib diisi dengan benar (min 9 digit).");
      return;
    }

    const items = Object.values(cart).map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      variantName: item.variantName,
      name: item.name,
      price: item.price,
      qty: item.qty,
      subtotal: item.subtotal,
      discountType: item.discountType,
      discountValue: item.discountValue,
    }));

    if (items.length === 0) {
      toast.error("Keranjang belanja masih kosong.");
      return;
    }

    try {
      setIsSubmitting(true);
      const orderId = await createOrder({
        storeId: store._id,
        customerName: values.customerName.trim(),
        customerPhone: cleanPhone,
        customerNotes: values.customerNotes?.trim() || undefined,
        items,
        subtotal,
        total,
      });

      clearCart();
      setIsCheckoutOpen(false);
      toast.success("Pesanan berhasil dibuat!");
      navigate({
        to: "/order/$orderId",
        params: { orderId },
      });
    } catch (err: any) {
      toast.error(err?.message || "Gagal membuat pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading skeleton
  if (data === undefined) {
    return <StorefrontSkeleton />;
  }

  // Not found or closed state
  if (!store || store.onlineStoreEnabled === false) {
    return <StorefrontClosedState store={store} />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)] pb-32 transition-colors">
      {/* Top Store Header */}
      <StorefrontHeader store={store} />

      {/* Main Catalog View */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Catalog Column */}
          <main className="flex-1 w-full space-y-5">
            {/* Sticky Search & Categories */}
            <div className="sticky top-[69px] z-20 bg-[var(--color-surface)]/95 backdrop-blur-sm py-2">
              <StorefrontSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                totalProductsCount={products.length}
              />
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-3xl p-8">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  Tidak ada produk ditemukan
                </p>
                <p className="text-xs text-[var(--color-text-2)] mt-1">
                  Coba gunakan kata kunci pencarian atau kategori lain.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredProducts.map((p) => {
                  const productCartQty = Object.values(cart)
                    .filter((item) => item.productId === p._id)
                    .reduce((sum, item) => sum + item.qty, 0);

                  return (
                    <StorefrontProductCard
                      key={p._id}
                      product={p}
                      cartQty={productCartQty}
                      onUpdateQty={updateQty}
                      onSelectVariant={(prod) => setVariantModalProduct(prod)}
                    />
                  );
                })}
              </div>
            )}
          </main>

          {/* Desktop Right Sidebar Cart */}
          <StorefrontCartSidebar
            cart={cart}
            products={products}
            totalItems={totalItems}
            total={total}
            onUpdateQty={updateQty}
            onClearCart={clearCart}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        </div>
      </div>

      {/* Mobile / Tablet Floating Cart Bar */}
      <StorefrontFloatingCartBar
        totalItems={totalItems}
        total={total}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Accessible Checkout Modal / Drawer */}
      <StorefrontCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        products={products}
        totalItems={totalItems}
        total={total}
        onUpdateQty={updateQty}
        onSubmitOrder={handleCheckoutSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Variant Selection Modal */}
      <VariantSelectionModal
        open={Boolean(variantModalProduct)}
        onClose={() => setVariantModalProduct(null)}
        product={variantModalProduct as any}
        onSelectVariant={(prod, variant) => {
          updateQty(prod as any, 1, variant);
          setVariantModalProduct(null);
        }}
      />
    </div>
  );
}
