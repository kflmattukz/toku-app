import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Modal } from "#/components/Modal";
import {
  CameraRotateIcon,
  FlashlightIcon,
  XIcon,
  BarcodeIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";

interface BarcodeScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
  title?: string;
  subtitle?: string;
  continuous?: boolean;
  lastScannedInfo?: {
    code: string;
    name?: string;
    success: boolean;
  } | null;
}

export function BarcodeScannerModal({
  open,
  onClose,
  onScanSuccess,
  title = "Pindai Barcode / QR",
  subtitle = "Arahkan kamera tepat ke barcode produk",
  continuous = false,
  lastScannedInfo,
}: BarcodeScannerModalProps) {
  const scannerContainerId = "toku-barcode-scanner-view";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorchSupport, setHasTorchSupport] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [scanFlash, setScanFlash] = useState(false);
  const [manualCode, setManualCode] = useState("");

  const lastScannedRef = useRef<{ code: string; time: number }>({ code: "", time: 0 });

  const handleScan = useCallback(
    (decodedText: string) => {
      const trimmed = decodedText.trim();
      if (!trimmed) return;

      const now = Date.now();
      // Cooldown for identical barcode: 1.3 seconds
      if (
        trimmed === lastScannedRef.current.code &&
        now - lastScannedRef.current.time < 1300
      ) {
        return;
      }

      lastScannedRef.current = { code: trimmed, time: now };

      // Trigger visual flash animation
      setScanFlash(true);
      setTimeout(() => setScanFlash(false), 400);

      onScanSuccess(trimmed);

      if (!continuous) {
        onClose();
      }
    },
    [continuous, onClose, onScanSuccess],
  );

  // Initialize and start scanner
  useEffect(() => {
    if (!open) {
      setCameraError(null);
      setIsInitializing(true);
      setTorchOn(false);
      return;
    }

    let isMounted = true;
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        setIsInitializing(true);
        setCameraError(null);

        // Check camera element existence in DOM
        const elem = document.getElementById(scannerContainerId);
        if (!elem) return;

        html5QrCode = new Html5Qrcode(scannerContainerId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 12,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            // Landscape-friendly box for 1D retail barcodes and QR
            const w = Math.max(200, Math.floor(viewfinderWidth * 0.82));
            const h = Math.max(140, Math.floor(minEdge * 0.55));
            return { width: Math.min(w, 360), height: Math.min(h, 240) };
          },
          aspectRatio: 1.2,
        };

        await html5QrCode.start(
          { facingMode },
          config,
          (decodedText) => {
            if (isMounted) {
              handleScan(decodedText);
            }
          },
          () => {
            // Frame scanned without code - silent
          },
        );

        if (!isMounted) {
          if (html5QrCode.isScanning) {
            await html5QrCode.stop();
          }
          return;
        }

        setIsInitializing(false);

        // Check flashlight / torch capability
        try {
          const stream = (html5QrCode as any).localMediaStream as MediaStream | undefined;
          const track = stream?.getVideoTracks()[0];
          const capabilities = (track as any)?.getCapabilities?.();
          if (capabilities && "torch" in capabilities) {
            setHasTorchSupport(true);
          } else {
            setHasTorchSupport(false);
          }
        } catch {
          setHasTorchSupport(false);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setIsInitializing(false);
        console.error("Camera scanner error:", err);
        const errStr = String(err?.message || err || "");
        if (
          errStr.includes("NotAllowedError") ||
          errStr.includes("Permission denied") ||
          errStr.includes("PermissionDismissedError")
        ) {
          setCameraError(
            "Izin kamera ditolak. Mohon izinkan akses kamera di pengaturan browser Anda.",
          );
        } else if (
          errStr.includes("NotFoundError") ||
          errStr.includes("DevicesNotFoundError")
        ) {
          setCameraError("Kamera tidak ditemukan di perangkat ini.");
        } else {
          setCameraError(
            "Gagal mengakses kamera. Pastikan kamera tidak sedang digunakan aplikasi lain.",
          );
        }
      }
    };

    // Small delay to ensure modal DOM is mounted
    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        const instance = scannerRef.current;
        scannerRef.current = null;
        if (instance.isScanning) {
          instance
            .stop()
            .then(() => {
              instance.clear();
            })
            .catch(() => {});
        } else {
          try {
            instance.clear();
          } catch {}
        }
      }
    };
  }, [open, facingMode, handleScan]);

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const toggleTorch = async () => {
    if (!scannerRef.current) return;
    try {
      const nextTorch = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as any],
      });
      setTorchOn(nextTorch);
    } catch {
      toast.error("Gagal mengubah status senter/flash.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    handleScan(code);
    setManualCode("");
  };

  if (!open) return null;

  return (
    <Modal onClose={onClose} maxWidth={460} showCloseButton={false} noPadding>
      <div className="relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-brand-light)] text-[var(--color-brand)]">
              <BarcodeIcon size={20} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--color-text)] sm:text-base">
                {title}
              </h3>
              <p className="text-[11px] font-semibold text-[var(--color-text-3)]">
                {continuous ? "Mode Berkelanjutan (Multi-Scan)" : subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]"
            aria-label="Tutup"
          >
            <XIcon size={16} weight="bold" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black sm:aspect-[16/11]">
          {/* html5-qrcode target container */}
          <div
            id={scannerContainerId}
            className="h-full w-full object-cover [&_video]:h-full! [&_video]:w-full! [&_video]:object-cover!"
          />

          {/* Target Viewfinder Overlay */}
          {!cameraError && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
              {/* Darkened corner mask */}
              <div
                className={`relative flex h-36 w-64 items-center justify-center rounded-2xl border-2 transition-all duration-200 sm:h-44 sm:w-72 ${
                  scanFlash
                    ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_30px_rgba(52,211,153,0.8)]"
                    : "border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                }`}
              >
                {/* Target Reticles (Corner brackets) */}
                <div className="absolute -top-1.5 -left-1.5 h-4 w-4 border-t-4 border-l-4 border-[var(--color-brand)] rounded-tl-md" />
                <div className="absolute -top-1.5 -right-1.5 h-4 w-4 border-t-4 border-r-4 border-[var(--color-brand)] rounded-tr-md" />
                <div className="absolute -bottom-1.5 -left-1.5 h-4 w-4 border-b-4 border-l-4 border-[var(--color-brand)] rounded-bl-md" />
                <div className="absolute -bottom-1.5 -right-1.5 h-4 w-4 border-b-4 border-r-4 border-[var(--color-brand)] rounded-br-md" />

                {/* Animated Red Laser Scanning Line */}
                <div className="absolute inset-x-2 h-0.5 animate-pulse bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_rgba(239,68,68,0.9)]" />

                {isInitializing && (
                  <div className="flex flex-col items-center gap-2 text-white/90">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="text-[11px] font-bold tracking-wide">
                      Menyiapkan Kamera...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Flash feedback overlay */}
          {scanFlash && (
            <div className="pointer-events-none absolute inset-0 bg-emerald-500/30 animate-ping transition-opacity" />
          )}

          {/* Camera Error Message */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
              <WarningCircleIcon size={44} weight="duotone" className="mb-2 text-rose-400" />
              <p className="max-w-xs text-xs font-semibold leading-relaxed text-rose-200">
                {cameraError}
              </p>
              <p className="mt-3 text-[11px] text-white/60">
                Gunakan input barcode manual di bawah ini.
              </p>
            </div>
          )}

          {/* Quick Floating Controls (Camera Flip & Torch) */}
          {!cameraError && !isInitializing && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-md">
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/90 hover:bg-white/20 hover:text-white"
                title="Ganti Kamera (Depan / Belakang)"
              >
                <CameraRotateIcon size={18} weight="bold" />
              </button>

              {hasTorchSupport && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`press-tactile flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors ${
                    torchOn
                      ? "bg-amber-400 text-black"
                      : "text-white/90 hover:bg-white/20 hover:text-white"
                  }`}
                  title={torchOn ? "Matikan Lampu" : "Nyalakan Lampu Senter"}
                >
                  <FlashlightIcon size={18} weight="bold" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Live Feedback Banner (Continuous Kasir Mode) */}
        {continuous && lastScannedInfo && (
          <div
            className={`flex items-center gap-2.5 border-b px-4 py-2.5 text-xs font-bold transition-all ${
              lastScannedInfo.success
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            {lastScannedInfo.success ? (
              <CheckCircleIcon size={18} weight="fill" className="shrink-0 text-emerald-500" />
            ) : (
              <WarningCircleIcon size={18} weight="fill" className="shrink-0 text-rose-500" />
            )}
            <div className="min-w-0 flex-1 truncate">
              {lastScannedInfo.success ? (
                <span>
                  Berhasil discan: <strong>{lastScannedInfo.name ?? lastScannedInfo.code}</strong>
                </span>
              ) : (
                <span>
                  Tidak ditemukan: <strong>{lastScannedInfo.code}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Manual Barcode Input Fallback */}
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-2)] p-3 sm:p-4">
          <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Atau ketik barcode manual di sini..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--color-text)] placeholder-[var(--color-text-3)] focus:border-[var(--color-brand)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="press-tactile flex cursor-pointer items-center gap-1.5 rounded-xl bg-[var(--color-brand)] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Input</span>
              <ArrowRightIcon size={14} weight="bold" />
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
