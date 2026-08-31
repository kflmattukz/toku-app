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
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger-text)]">
          <WarningCircleIcon size={28} weight="bold" />
        </div>

        <h3 className="m-0 mb-2 text-center text-lg font-black text-[var(--color-text)]">
          Batalkan Transaksi & Retur Stok?
        </h3>

        <p className="mb-5 text-center text-xs leading-relaxed text-[var(--color-text-2)]">
          Transaksi senilai{" "}
          <strong className="font-extrabold text-[var(--color-text)]">
            {formatIDR(cancelTarget.total)}
          </strong>{" "}
          akan ditandai sebagai batal. Seluruh stok ({totalQty} item) akan otomatis dikembalikan ke
          inventaris.
        </p>

        {/* Select Reason */}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-bold text-[var(--color-text)]">
            Pilih Alasan Pembatalan:
          </label>
          <div className="flex flex-col gap-2">
            {CANCEL_REASONS.map((r) => {
              const isSelected = selectedReasonId === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => onSelectReasonId(r.id)}
                  className={`press-tactile flex cursor-pointer items-center gap-2.5 rounded-[12px] border p-3 text-xs transition-all ${
                    isSelected
                      ? "border-[var(--color-brand)] bg-[var(--color-brand-light)] font-extrabold text-[var(--color-brand)]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-2)] font-semibold text-[var(--color-text)]"
                  }`}
                >
                  <div
                    className="h-4 w-4 shrink-0 rounded-full bg-white"
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
            <label className="mb-1.5 block text-xs font-bold text-[var(--color-text)]">
              Tulis Catatan Alasan Pembatalan:
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Kesalahan nominal pembayaran QRIS"
              value={customReasonNote}
              onChange={(e) => onCustomReasonNoteChange(e.target.value)}
              className="focus:ring-primary-500 w-full resize-none rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:ring-1"
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={cancelling}
            className="press-tactile flex-1 cursor-pointer rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] py-3 text-xs font-extrabold text-[var(--color-text)]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={cancelling}
            className="press-tactile flex-1.3 shadow-danger-500/30 cursor-pointer rounded-full bg-[var(--color-danger)] py-3 text-xs font-extrabold text-white shadow-md disabled:opacity-60"
          >
            {cancelling ? "Membatalkan..." : "Ya, Batalkan Transaksi"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
