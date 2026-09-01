import { Modal } from "#/components/Modal";
import { WarningIcon } from "@phosphor-icons/react";
import { Button } from "#/components/ui";
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

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            onClick={onClose}
            disabled={deleting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            fullWidth
            onClick={onConfirm}
            loading={deleting}
            loadingText="Menghapus..."
          >
            Ya, Hapus Produk
          </Button>
        </div>
      </div>
    </Modal>
  );
}
