import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { useAppStore } from "#/lib/store-context";
import { PackageIcon } from "@phosphor-icons/react";
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
  type Product,
} from "#/features/kasir";

export const Route = createFileRoute("/_app/kasir")({ component: Kasir });

function Kasir() {
  const { store, currentCashier } = useAppStore();
  const rawProducts = useQuery(api.products.list, store ? { storeId: store._id } : "skip");
  const products = (rawProducts as Product[] | undefined) ?? [];
  const activeShift = useQuery(api.shifts.getActive, store ? { storeId: store._id } : "skip");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [showMobileCart, setShowMobileCart] = useState(false);

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
  } = useKasirCart();

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

  if (!store || !rawProducts) return <KasirLoader />;

  const categories = ["Semua", ...new Set(products.map((p) => p.category))];

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-1 flex-col gap-6 lg:flex-row">
      {/* Products Panel */}
      <div className={`flex min-w-0 flex-1 flex-col ${cart.length > 0 ? "pb-20 lg:pb-0" : ""}`}>
        <KasirHeader productCount={products.length} isOnline={isOnline} />

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
      />
    </div>
  );
}

function KasirLoader() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <PackageIcon
        size={48}
        weight="duotone"
        className="animate-pulse text-[var(--color-brand)] opacity-50"
      />
      <p className="text-sm font-bold text-[var(--color-text-2)]">Memuat Kasir...</p>
    </div>
  );
}
