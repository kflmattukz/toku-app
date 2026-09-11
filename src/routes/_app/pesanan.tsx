import { createFileRoute } from "@tanstack/react-router";
import { OrderView, useOrderViewContext } from "#/features/pesanan";

export const Route = createFileRoute("/_app/pesanan")({
  component: PesananPage,
});

function PesananContent() {
  const { viewMode } = useOrderViewContext();

  return (
    <>
      <OrderView.Header />
      <div key={viewMode} className="animate-in fade-in duration-200 ease-out">
        {viewMode === "kanban" ? <OrderView.Kanban /> : <OrderView.Table />}
      </div>
      <OrderView.DetailDrawer />
      <OrderView.PaymentModal />
      <OrderView.ReceiptModal />
    </>
  );
}

function PesananPage() {
  return (
    <OrderView.Root>
      <PesananContent />
    </OrderView.Root>
  );
}
