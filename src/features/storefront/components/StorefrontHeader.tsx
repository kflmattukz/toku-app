import { StorefrontIcon, MapPinIcon, InfoIcon } from "@phosphor-icons/react";
import type { StorefrontStore } from "../types";

interface StorefrontHeaderProps {
  store: StorefrontStore;
}

export function StorefrontHeader({ store }: StorefrontHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-2xl bg-[var(--color-brand-light)] text-[var(--color-brand)] border border-[var(--color-brand)]/20 flex items-center justify-center shrink-0 shadow-xs"
            aria-hidden="true"
          >
            <StorefrontIcon size={26} weight="duotone" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg text-[var(--color-text)] truncate tracking-tight">
                {store.name}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-brand-light)] text-[var(--color-brand)] border border-[var(--color-brand)]/20 uppercase tracking-wider">
                Pickup
              </span>
            </div>
            {store.address && (
              <p className="text-xs text-[var(--color-text-2)] truncate flex items-center gap-1 mt-0.5">
                <MapPinIcon size={12} className="shrink-0 text-[var(--color-text-3)]" />
                <span>{store.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* Pickup Notice */}
        <div className="bg-[var(--color-brand-light)] border border-[var(--color-brand)]/20 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-[var(--color-text-2)] md:max-w-md">
          <InfoIcon size={16} className="text-[var(--color-brand)] shrink-0" weight="fill" />
          <p className="leading-snug">
            <span className="font-bold text-[var(--color-brand)]">Pesan & Ambil di Toko:</span>{" "}
            Pilih produk, konfirmasi via WhatsApp, bayar di kasir saat pickup.
          </p>
        </div>
      </div>
    </header>
  );
}
