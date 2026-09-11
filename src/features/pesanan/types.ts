import type { Id } from "../../../convex/_generated/dataModel";

export type OrderStatus =
  | "all"
  | "pending"
  | "preparing"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";

export type OrderViewMode = "kanban" | "table";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
  discountType?: "percentage" | "nominal";
  discountValue?: number;
}

export interface OrderRecord {
  _id: Id<"online_orders">;
  storeId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: "pending" | "preparing" | "ready_for_pickup" | "completed" | "cancelled";
  cancelReason?: string;
  transactionId?: string;
  completedAt?: number;
  createdAt: number;
}

export interface OrderCounts {
  pending: number;
  preparing: number;
  ready_for_pickup: number;
  completed?: number;
  cancelled?: number;
}

export interface CompletedTxData {
  order: OrderRecord;
  txId: string;
  paymentMethod: string;
  cashPaid?: number;
  change?: number;
}
