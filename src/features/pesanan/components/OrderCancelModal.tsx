import { useState } from "react";
import { Modal } from "#/components/Modal";
import { WarningCircleIcon, InfoIcon } from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import { Button } from "#/components/ui";
import type { OrderRecord } from "../types";

export const ONLINE_ORDER_CANCEL_REASONS = [
  { id: "customer_request", label: "Permintaan pembatalan dari pelanggan" },
  { id: "out_of_stock", label: "Stok fisik barang tidak mencukupi / rusak" },
  { id: "unresponsive", label: "Pelanggan tidak merespons atau pesanan tidak diambil" },
  { id: "other", label: "Lainnya" },
] as const;

export interface OrderCancelModalProps {
  order: OrderRecord | null;
  open?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  cancelling: boolean;
}

export function OrderCancelModal({
  order,
  open = true,
  onClose,
  onConfirm,
  cancelling,
}: OrderCancelModalProps) {
  const [selectedReasonId, setSelectedReasonId] = useState<string>("customer_request");
  const [customReasonNote, setCustomReasonNote] = useState<string>("");

  if (!order || !open) return null;

  const totalQty = order.items?.reduce((s, i) => s + (i.qty || 0), 0) || 0;

  const handleConfirm = async () => {
    let finalReason = "";
    if (selectedReasonId === "other") {
      finalReason = customReasonNote.trim();
    } else {
      const selected = ONLINE_ORDER_CANCEL_REASONS.find((r) => r.id === selectedReasonId);
      finalReason = selected?.label || "Dibatalkan";
      if (customReasonNote.trim()) {
        finalReason += ` (${customReasonNote.trim()})`;
      }
    }
    await onConfirm(finalReason);
  };

  return (
    <Modal onClose={onClose} maxWidth={460}>
      <div>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger-text)]">
          <WarningCircleIcon size={28} weight="bold" />
        </div>

        <h3 className="m-0 mb-1 text-center text-lg font-black text-[var(--color-text)]">
          Batalkan Pesanan #{order.orderNumber}?
        </h3>

        <p className="mb-4 text-center text-xs leading-relaxed text-[var(--color-text-2)]">
          Pesanan atas nama <strong className="font-bold text-[var(--color-text)]">{order.customerName}</strong> akan dibatalkan.
        </p>

        {/* Order Details Summary Box */}
        <div className="mb-3 p-3 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-between text-xs">
          <div>
            <p className="text-[10px] text-[var(--color-text-3)] font-semibold uppercase tracking-wider">
              Pelanggan
            </p>
            <p className="font-bold text-[var(--color-text)]">{order.customerName}</p>
            <p className="text-[11px] text-[var(--color-text-3)] font-mono">{order.customerPhone}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[var(--color-text-3)] font-semibold uppercase tracking-wider">
              Total ({totalQty} item)
            </p>
            <p className="text-sm font-black text-rose-600 dark:text-rose-400 font-mono">
              {formatIDR(order.total)}
            </p>
          </div>
        </div>

        {/* Stock Return Info Notice */}
        <div className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-400">
          <InfoIcon size={16} className="shrink-0 mt-0.5 text-amber-500" weight="fill" />
          <span>
            Stok seluruh varian/produk pada pesanan ini akan secara otomatis dikembalikan ke inventaris toko.
          </span>
        </div>

        {/* Reason Selection */}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
            Pilih Alasan Pembatalan:
          </label>
          <div className="flex flex-col gap-2">
            {ONLINE_ORDER_CANCEL_REASONS.map((r) => {
              const isSelected = selectedReasonId === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReasonId(r.id)}
                  className={`press-tactile flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-xs transition-all ${
                    isSelected
                      ? "border-rose-500 bg-rose-500/10 font-bold text-rose-600 dark:text-rose-400"
                      : "border-[var(--color-border)] bg-[var(--color-surface-2)] font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-3)]"
                  }`}
                >
                  <div
                    className="h-4 w-4 shrink-0 rounded-full flex items-center justify-center"
                    style={{
                      border: isSelected
                        ? "5px solid #e11d48"
                        : "1.5px solid var(--color-text-3)",
                      background: isSelected ? "white" : "transparent",
                    }}
                  />
                  <span>{r.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Reason Textarea */}
        {selectedReasonId === "other" && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
              Tulis Alasan Pembatalan: <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Pelanggan salah memilih pesanan dan ingin membuat pesanan baru..."
              value={customReasonNote}
              onChange={(e) => setCustomReasonNote(e.target.value)}
              className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              autoFocus
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            onClick={onClose}
            disabled={cancelling}
          >
            Kembali
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            fullWidth
            onClick={handleConfirm}
            loading={cancelling}
            loadingText="Membatalkan..."
            disabled={cancelling || (selectedReasonId === "other" && !customReasonNote.trim())}
          >
            Ya, Batalkan
          </Button>
        </div>
      </div>
    </Modal>
  );
}
