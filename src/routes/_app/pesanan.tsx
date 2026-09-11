import { createFileRoute } from "@tanstack/react-router";
import { OrderView, useOrderViewContext } from "#/features/pesanan";

export const Route = createFileRoute("/_app/pesanan")({
  component: PesananPage,
});

function PesananContent() {
  const { viewMode } = useOrderViewContext();

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <OrderView.Header />
      <div
        key={viewMode}
        className="animate-in fade-in duration-200 ease-out flex-1 min-h-0 flex flex-col"
      >
        {viewMode === "kanban" ? <OrderView.Kanban /> : <OrderView.Table />}
      </div>
      <OrderView.DetailDrawer />
      <OrderView.PaymentModal />
      <OrderView.ReceiptModal />
    </div>
  );
}

function PesananPage() {
  return (
    <OrderView.Root>
      <PesananContent />
    </OrderView.Root>
  );
}
