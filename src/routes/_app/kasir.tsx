import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { PackageIcon } from "@phosphor-icons/react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { BarcodeScannerModal } from "#/components/BarcodeScannerModal";
import { triggerScanFeedback } from "#/lib/scan-feedback";
import { formatIDR } from "#/lib/utils";
import {
  useOfflineSync,
  useKasirCart,
  useKasirPayment,
  KasirHeader,
  ProductCatalogGrid,
  CartDrawer,
  ItemDiscountModal,
  PaymentModal,
  ReceiptModal,
  KasirSkeleton,
  type Product,
} from "#/features/kasir";

export const Route = createFileRoute("/_app/kasir")({ component: Kasir });

function Kasir() {
  const navigate = useNavigate();
  const { store, currentCashier } = useAppStore();
  const rawProducts = useQuery(api.products.list, store ? { storeId: store._id } : "skip");
  const isLoading = rawProducts === undefined;
  const products = (rawProducts as Product[] | undefined) ?? [];
  const activeShift = useQuery(api.shifts.getActive, store ? { storeId: store._id } : "skip");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [lastScannedInfo, setLastScannedInfo] = useState<{
    code: string;
    name?: string;
    success: boolean;
  } | null>(null);

  // Sync & state hooks
  const { isOnline } = useOfflineSync(store?._id);
  const {
    cart,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    itemDiscountModal,
    setItemDiscountModal,
    openItemDiscountModal,
    saveItemDiscount,
    basketDiscountType,
    setBasketDiscountType,
    basketDiscountValue,
    setBasketDiscountValue,
    basketDiscountValNum,
    totalItems,
    subtotal,
    total,
    basketDiscountAmount,
    totalSavings,
  } = useKasirCart(products);

  const {
    showPayment,
    setShowPayment,
    payMethod,
    setPayMethod,
    cashInput,
    setCashInput,
    cashPaid,
    change,
    showReceipt,
    setShowReceipt,
    lastTx,
    handleConfirmPayment,
  } = useKasirPayment({
    store,
    currentCashier,
    activeShift,
    cart,
    subtotal,
    total,
    basketDiscountType,
    basketDiscountValNum,
    basketDiscountAmount,
    isOnline,
    onPaymentSuccess: clearCart,
  });

  const handleScanBarcode = (scannedCode: string) => {
    const code = scannedCode.trim();
    if (!code) return;

    const found = products.find((p) => p.barcode && p.barcode.trim() === code);

    if (found) {
      if (found.stock <= 0) {
        triggerScanFeedback(false);
        setLastScannedInfo({ code, name: `${found.name} (Stok Habis)`, success: false });
        toast.error(`Stok ${found.name} habis!`, {
          description: "Silakan restok produk terlebih dahulu",
        });
        return;
      }

      const inCart = cart.find((i) => i.productId === found._id);
      if (inCart && inCart.qty >= found.stock) {
        triggerScanFeedback(false);
        setLastScannedInfo({ code, name: `${found.name} (Maks Stok)`, success: false });
        toast.warning(`Maksimal stok ${found.name} tercapai (${found.stock} pcs)`);
        return;
      }

      addToCart(found);
      triggerScanFeedback(true);
      setLastScannedInfo({ code, name: found.name, success: true });

      toast.custom(
        (t) => (
          <div
            onClick={() => toast.dismiss(t)}
            className="flex w-full max-w-[340px] cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 shadow-sm transition-opacity hover:opacity-95"
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]">
              {found.imageUrl ? (
                <img src={found.imageUrl} alt={found.name} className="h-full w-full object-cover" />
              ) : (
                <PackageIcon size={20} weight="duotone" className="text-[var(--color-text-3)]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate text-xs font-semibold text-[var(--color-text)]">
                {found.name}
              </h4>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--color-text)]">
                  {formatIDR(found.price)}
                </span>
                {found.barcode && (
                  <span className="font-mono text-[10px] text-[var(--color-text-3)]">
                    {found.barcode}
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center">
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                +1
              </span>
            </div>
          </div>
        ),
        { duration: 2500 },
      );
    } else {
      triggerScanFeedback(false);
      setLastScannedInfo({ code, success: false });
      toast.error(`Barcode "${code}" tidak ditemukan di katalog`, {
        description: "Tambahkan produk baru dengan barcode ini?",
        action: {
          label: "Tambah Produk",
          onClick: () => {
            setShowScanner(false);
            navigate({
              to: "/produk",
              search: { barcode: code },
            });
          },
        },
      });
    }
  };

  if (!store || !rawProducts) return <KasirSkeleton />;

  const categories = ["Semua", ...new Set(products.map((p) => p.category))];

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-1 flex-col gap-6 lg:flex-row">
      {/* Products Panel */}
      <div className={`flex min-w-0 flex-1 flex-col ${cart.length > 0 ? "pb-20 lg:pb-0" : ""}`}>
        <KasirHeader
          productCount={products.length}
          isOnline={isOnline}
          onOpenScanner={() => {
            setLastScannedInfo(null);
            setShowScanner(true);
          }}
        />

        <ProductCatalogGrid
          products={products}
          categories={categories}
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          cart={cart}
          onAddToCart={addToCart}
          onUpdateQty={updateQty}
          onOpenScanner={() => {
            setLastScannedInfo(null);
            setShowScanner(true);
          }}
          isLoading={isLoading}
        />
      </div>

      {/* Cart Sidebar & Mobile Drawers */}
      <CartDrawer
        cart={cart}
        products={products}
        totalItems={totalItems}
        subtotal={subtotal}
        total={total}
        totalSavings={totalSavings}
        onUpdateQty={updateQty}
        onRemoveFromCart={removeFromCart}
        onClearCart={clearCart}
        onOpenItemDiscount={openItemDiscountModal}
        showPayment={showPayment}
        showMobileCart={showMobileCart}
        setShowMobileCart={setShowMobileCart}
        onOpenPayment={() => {
          setShowMobileCart(false);
          setShowPayment(true);
        }}
      />

      {/* Item Discount Modal */}
      <ItemDiscountModal
        state={itemDiscountModal}
        onChangeState={setItemDiscountModal}
        onSave={saveItemDiscount}
        onClose={() => setItemDiscountModal(null)}
      />

      {/* Payment Confirmation Modal */}
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        payMethod={payMethod}
        onPayMethodChange={setPayMethod}
        subtotal={subtotal}
        total={total}
        totalSavings={totalSavings}
        basketDiscountType={basketDiscountType}
        onBasketDiscountTypeChange={setBasketDiscountType}
        basketDiscountValue={basketDiscountValue}
        onBasketDiscountValueChange={setBasketDiscountValue}
        basketDiscountAmount={basketDiscountAmount}
        cashInput={cashInput}
        onCashInputChange={setCashInput}
        cashPaid={cashPaid}
        change={change}
        onConfirm={handleConfirmPayment}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        tx={lastTx}
        storeName={store.name}
        storeAddress={store.address}
      />

      {/* Barcode Camera Scanner (Continuous Mode) */}
      <BarcodeScannerModal
        open={showScanner}
        onClose={() => {
          setShowScanner(false);
          setLastScannedInfo(null);
        }}
        continuous={true}
        title="Scanner Kasir"
        subtitle="Scan barcode barang untuk otomatis masuk keranjang"
        lastScannedInfo={lastScannedInfo}
        onScanSuccess={handleScanBarcode}
      />
    </div>
  );
}
