import { StorefrontIcon } from "@phosphor-icons/react";
import type { StorefrontStore } from "../types";

interface StorefrontClosedStateProps {
  store?: StorefrontStore | null;
}

export function StorefrontClosedState({ store }: StorefrontClosedStateProps) {
  const isNotFound = !store;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--color-surface)] text-center">
      <div
        className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <StorefrontIcon size={32} weight="duotone" />
      </div>
      <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">
        {isNotFound ? "Toko Tidak Ditemukan" : "Pemesanan Online Sedang Tutup"}
      </h1>
      <p className="text-sm text-[var(--color-text-2)] max-w-sm leading-relaxed">
        {isNotFound
          ? "Toko dengan alamat URL ini tidak ditemukan atau link mungkin salah."
          : "Toko ini sedang menonaktifkan pemesanan online untuk sementara waktu. Silakan hubungi kasir atau kunjungi langsung toko."}
      </p>
    </main>
  );
}
