import { Modal } from "#/components/Modal";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";
import { CANCEL_REASONS, type Transaction } from "../types";

interface TransactionCancelModalProps {
  cancelTarget: Transaction | null;
  onClose: () => void;
  selectedReasonId: string;
  onSelectReasonId: (id: string) => void;
  customReasonNote: string;
  onCustomReasonNoteChange: (val: string) => void;
  cancelling: boolean;
  onConfirm: () => void;
}

export function TransactionCancelModal({
  cancelTarget,
  onClose,
  selectedReasonId,
  onSelectReasonId,
  customReasonNote,
  onCustomReasonNoteChange,
  cancelling,
  onConfirm,
}: TransactionCancelModalProps) {
  if (!cancelTarget) return null;

  const totalQty = cancelTarget.items.reduce((s, i) => s + i.qty, 0);

  return (
    <Modal onClose={onClose} maxWidth={440}>
      <div>
        <div className="w-12 h-12 rounded-full bg-[var(--color-danger-light)] border border-[var(--color-danger)]/30 text-[var(--color-danger-text)] flex items-center justify-center mx-auto mb-4">
          <WarningCircleIcon size={28} weight="bold" />
        </div>

        <h3 className="text-lg font-black text-center text-[var(--color-text)] m-0 mb-2">
          Batalkan Transaksi & Retur Stok?
        </h3>

        <p className="text-xs text-[var(--color-text-2)] text-center mb-5 leading-relaxed">
          Transaksi senilai{" "}
          <strong className="text-[var(--color-text)] font-extrabold">
            {formatIDR(cancelTarget.total)}
          </strong>{" "}
          akan ditandai sebagai batal. Seluruh stok ({totalQty} item) akan otomatis dikembalikan
          ke inventaris.
        </p>

        {/* Select Reason */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-[var(--color-text)] mb-2">
            Pilih Alasan Pembatalan:
          </label>
          <div className="flex flex-col gap-2">
            {CANCEL_REASONS.map((r) => {
              const isSelected = selectedReasonId === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => onSelectReasonId(r.id)}
                  className={`press-tactile p-3 rounded-[12px] border cursor-pointer text-xs flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? "border-[var(--color-brand)] bg-[var(--color-brand-light)] text-[var(--color-brand)] font-extrabold"
                      : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] font-semibold"
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full bg-white shrink-0"
                    style={{
                      border: isSelected
                        ? "5px solid var(--color-brand)"
                        : "1.5px solid var(--color-text-3)",
                    }}
                  />
                  <span>{r.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Reason Note */}
        {selectedReasonId === "lainnya" && (
          <div className="mb-5">
            <label className="block text-xs font-bold text-[var(--color-text)] mb-1.5">
              Tulis Catatan Alasan Pembatalan:
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Kesalahan nominal pembayaran QRIS"
              value={customReasonNote}
              onChange={(e) => onCustomReasonNoteChange(e.target.value)}
              className="w-full px-3 py-2 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text)] outline-none focus:ring-1 focus:ring-primary-500 resize-none"
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={cancelling}
            className="press-tactile flex-1 py-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] text-xs font-extrabold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={cancelling}
            className="press-tactile flex-1.3 py-3 rounded-full bg-[var(--color-danger)] text-white text-xs font-extrabold cursor-pointer shadow-md shadow-danger-500/30 disabled:opacity-60"
          >
            {cancelling ? "Membatalkan..." : "Ya, Batalkan Transaksi"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
