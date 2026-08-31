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
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger-text)]">
          <WarningIcon size={32} weight="bold" />
        </div>

        <h3 className="m-0 mb-2 text-lg font-black text-[var(--color-text)]">Hapus Produk?</h3>
        <p className="mb-5 text-xs leading-relaxed text-[var(--color-text-2)]">
          Apakah Anda yakin ingin menghapus{" "}
          <strong className="font-extrabold text-[var(--color-text)]">"{product.name}"</strong> dari
          katalog? Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="press-tactile flex-1 cursor-pointer rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] py-3 text-xs font-extrabold text-[var(--color-text)]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="press-tactile flex-1.2 shadow-danger-500/30 cursor-pointer rounded-full bg-[var(--color-danger)] py-3 text-xs font-extrabold text-white shadow-md disabled:opacity-60"
          >
            {deleting ? "Menghapus..." : "Ya, Hapus Produk"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
