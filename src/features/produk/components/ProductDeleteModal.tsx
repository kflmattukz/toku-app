import { Modal } from "#/components/Modal";
import { WarningIcon } from "@phosphor-icons/react";
import type { Product } from "../types";

interface ProductDeleteModalProps {
  product: Product | null;
  onClose: () => void;
  deleting: boolean;
  onConfirm: () => void;
}

export function ProductDeleteModal({
  product,
  onClose,
  deleting,
  onConfirm,
}: ProductDeleteModalProps) {
  if (!product) return null;

  return (
    <Modal onClose={onClose} maxWidth={400}>
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--color-danger-light)] border border-[var(--color-danger)]/30 text-[var(--color-danger-text)] flex items-center justify-center mx-auto mb-4">
          <WarningIcon size={32} weight="bold" />
        </div>

        <h3 className="text-lg font-black text-[var(--color-text)] m-0 mb-2">Hapus Produk?</h3>
        <p className="text-xs text-[var(--color-text-2)] mb-5 leading-relaxed">
          Apakah Anda yakin ingin menghapus{" "}
          <strong className="text-[var(--color-text)] font-extrabold">"{product.name}"</strong> dari
          katalog? Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="press-tactile flex-1 py-3 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] text-xs font-extrabold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="press-tactile flex-1.2 py-3 rounded-full bg-[var(--color-danger)] text-white text-xs font-extrabold cursor-pointer shadow-md shadow-danger-500/30 disabled:opacity-60"
          >
            {deleting ? "Menghapus..." : "Ya, Hapus Produk"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
