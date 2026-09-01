import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatIDR, calculateItemDiscount } from "#/lib/utils";
import { enqueueOfflineTx } from "#/lib/offline-queue";
import type { CartItem, PaymentMethod } from "../types";
import type { ActiveCashier } from "#/lib/store-context";
import type { Id } from "../../../../convex/_generated/dataModel";

interface UseKasirPaymentProps {
  store: { _id: Id<"stores">; name: string } | null | undefined;
  currentCashier: ActiveCashier | null;
  activeShift: { _id: Id<"shifts"> } | null | undefined;
  cart: CartItem[];
  subtotal: number;
  total: number;
  basketDiscountType: "none" | "percentage" | "nominal";
  basketDiscountValNum: number;
  basketDiscountAmount: number;
  isOnline: boolean;
  onPaymentSuccess: () => void;
}

export function useKasirPayment({
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
  onPaymentSuccess,
}: UseKasirPaymentProps) {
  const createTx = useMutation(api.transactions.create);

  const [showPayment, setShowPayment] = useState(false);
  const [payMethod, setPayMethod] = useState<PaymentMethod>("cash");
  const [cashInput, setCashInput] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTx, setLastTx] = useState<any>(null);

  const cashPaid = parseFloat(cashInput) || 0;
  const change = Math.max(0, cashPaid - total);

  const handleConfirmPayment = async () => {
    if (cart.length === 0 || !store) return;

    const tx = {
      storeId: store._id,
      items: cart.map((i) => {
        const disc = calculateItemDiscount(i.price, i.discountType, i.discountValue);
        return {
          productId: i.productId,
          name: i.name,
          price: i.price,
          costPrice: i.costPrice,
          qty: i.qty,
          discountType: i.discountType,
          discountValue: i.discountValue,
          subtotal: disc.unitPrice * i.qty,
        };
      }),

      subtotal,
      discountType: basketDiscountType === "none" ? undefined : basketDiscountType,
      discountValue: basketDiscountValNum > 0 ? basketDiscountValNum : undefined,
      discountAmount: basketDiscountAmount > 0 ? basketDiscountAmount : undefined,
      total,
      paymentMethod: payMethod,
      cashPaid: payMethod === "cash" ? cashPaid : undefined,
      change: payMethod === "cash" ? change : undefined,
      cashierId: currentCashier?.id,
      cashierName: currentCashier?.name || "Kasir",
      shiftId: activeShift?._id,
      createdAt: Date.now(),
    };

    if (!isOnline) {
      enqueueOfflineTx({ ...tx, storeId: store._id as string });
      setLastTx({ ...tx, storeName: store.name });
      toast.warning("Mode Offline: Disimpan di Perangkat", {
        description: "Akan otomatis disinkron saat internet pulih",
      });
    } else {
      try {
        await createTx(tx);
        setLastTx({ ...tx, storeName: store.name });
        toast.success("Pembayaran Berhasil Lunas!", {
          description: `Total ${formatIDR(total)} (${payMethod.toUpperCase()})`,
        });
      } catch {
        enqueueOfflineTx({ ...tx, storeId: store._id as string });
        setLastTx({ ...tx, storeName: store.name });
        toast.warning("Tersimpan Offline (Gagal Koneksi)", {
          description: "Transaksi tetap aman di memori lokal",
        });
      }
    }

    setShowPayment(false);
    setShowReceipt(true);
    setCashInput("");
    onPaymentSuccess();
  };

  return {
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
    setLastTx,
    handleConfirmPayment,
  };
}
