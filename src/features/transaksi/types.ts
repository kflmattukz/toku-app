import type { Id } from "../../../convex/_generated/dataModel";

export type TransactionItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  discountType?: "percentage" | "nominal";
  discountValue?: number;
  subtotal?: number;
};

export type Transaction = {
  _id: Id<"transactions">;
  _creationTime: number;
  storeId: Id<"stores">;
  storeName?: string;
  items: TransactionItem[];
  subtotal: number;
  total: number;
  discountType?: "percentage" | "nominal";
  discountValue?: number;
  discountAmount?: number;
  paymentMethod: "cash" | "qris";
  cashPaid?: number;
  change?: number;
  cashierId?: string;
  cashierName?: string;
  shiftId?: Id<"shifts">;
  status?: "completed" | "cancelled";
  cancelledAt?: number;
  cancelReason?: string;
  cancelledBy?: string;
  syncedFromOffline?: boolean;
  createdAt: number;
};

export type CancelReason = {
  id: string;
  label: string;
};

export const CANCEL_REASONS: CancelReason[] = [
  { id: "retur_barang", label: "Pelanggan Meretur Barang / Produk Rusak" },
  { id: "salah_input", label: "Salah Input Pesanan / Kesalahan Kasir" },
  { id: "batal_bayar", label: "Pembayaran Dibatalkan / Batal Transaksi" },
  { id: "lainnya", label: "Alasan Lainnya (Tulis Catatan)" },
];
