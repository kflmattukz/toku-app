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
      {viewMode === "kanban" ? <OrderView.Kanban /> : <OrderView.Table />}
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
