import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  XIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsOutIcon,
  ArrowClockwiseIcon,
} from "@phosphor-icons/react";
import { formatIDR } from "#/lib/utils";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null | undefined;
  title?: string;
  category?: string;
  price?: number;
  subtitle?: string;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  category,
  price,
  subtitle,
}: ImagePreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Reset zoom & rotation when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !imageUrl || typeof document === "undefined") {
    return null;
  }

  const handleZoomIn = () => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
      className="animate-backdrop fixed inset-0 z-99999 flex h-screen w-screen items-center justify-center p-4 sm:p-6"
      style={{
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Main Container */}
      <div className="animate-modal relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-2 px-5 py-3.5">
          <div className="min-w-0 flex-1 pr-4">
            <div className="flex items-center gap-2">
              <span className="eyebrow-tag">PREVIEW FOTO</span>
              {category && (
                <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[11px] font-bold text-text-2">
                  {category}
                </span>
              )}
            </div>
            <h3 id="preview-title" className="mt-0.5 truncate text-base font-extrabold text-text">
              {title || "Gambar Produk"}
            </h3>
            {price !== undefined && (
              <div className="price mt-0.5 text-xs font-black text-brand">{formatIDR(price)}</div>
            )}
            {subtitle && <p className="mt-0.5 text-xs text-text-3">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup preview"
            className="press-tactile flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-text-2 transition-all hover:bg-surface-3 hover:text-text"
          >
            <XIcon size={16} weight="bold" />
          </button>
        </div>

        {/* Image Canvas */}
        <div className="relative flex max-h-[65vh] min-h-80 flex-1 items-center justify-center overflow-hidden bg-black/90 p-4 select-none">
          <div
            className="flex items-center justify-center transition-transform duration-200 ease-out"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={imageUrl}
              alt={title || "Preview produk"}
              className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-lg"
              draggable={false}
            />
          </div>

          {/* Floating Controls Bar */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-3 py-1.5 shadow-xl backdrop-blur-md">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.75}
              aria-label="Zoom out"
              className="press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/20 hover:text-white disabled:opacity-40"
              title="Perkecil"
            >
              <MagnifyingGlassMinusIcon size={16} weight="bold" />
            </button>

            <span className="min-w-11 text-center font-mono text-xs font-bold text-white">
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              aria-label="Zoom in"
              className="press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/20 hover:text-white disabled:opacity-40"
              title="Perbesar"
            >
              <MagnifyingGlassPlusIcon size={16} weight="bold" />
            </button>

            <div className="mx-1 h-4 w-px bg-white/20" />

            <button
              type="button"
              onClick={handleRotate}
              aria-label="Rotate image"
              className="press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/20 hover:text-white"
              title="Putar 90°"
            >
              <ArrowClockwiseIcon size={16} weight="bold" />
            </button>

            <button
              type="button"
              onClick={handleResetZoom}
              aria-label="Reset zoom"
              className="press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/20 hover:text-white"
              title="Reset Tampilan"
            >
              <ArrowsOutIcon size={16} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
