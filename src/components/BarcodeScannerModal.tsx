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
      if (trimmed === lastScannedRef.current.code && now - lastScannedRef.current.time < 1300) {
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
        } else if (errStr.includes("NotFoundError") || errStr.includes("DevicesNotFoundError")) {
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
    <Modal onClose={onClose} maxWidth={440} showCloseButton={false} noPadding>
      <div className="relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)]">
        {/* Minimalist Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]">
              <BarcodeIcon size={18} weight="regular" />
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-tight text-[var(--color-text)] sm:text-sm">
                {title}
              </h3>
              <p className="text-[11px] text-[var(--color-text-3)]">
                {continuous ? "Mode Berkelanjutan (Multi-Scan)" : subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="press-tactile flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-2)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Tutup"
          >
            <XIcon size={14} weight="bold" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950 sm:aspect-[16/11]">
          {/* html5-qrcode target container */}
          <div
            id={scannerContainerId}
            className="h-full w-full object-cover [&_video]:h-full! [&_video]:w-full! [&_video]:object-cover!"
          />

          {/* Subtle status pill in continuous mode */}
          {continuous && lastScannedInfo && (
            <div className="pointer-events-none absolute top-3 inset-x-0 z-20 flex justify-center px-4">
              <div
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium backdrop-blur-md transition-all ${
                  lastScannedInfo.success
                    ? "border-emerald-500/30 bg-emerald-950/80 text-emerald-300"
                    : "border-rose-500/30 bg-rose-950/80 text-rose-300"
                }`}
              >
                {lastScannedInfo.success ? (
                  <CheckCircleIcon size={13} weight="fill" className="shrink-0 text-emerald-400" />
                ) : (
                  <WarningCircleIcon size={13} weight="fill" className="shrink-0 text-rose-400" />
                )}
                <span className="truncate max-w-[240px]">
                  {lastScannedInfo.success
                    ? (lastScannedInfo.name ?? lastScannedInfo.code)
                    : `Tidak ditemukan: ${lastScannedInfo.code}`}
                </span>
              </div>
            </div>
          )}

          {/* Target Viewfinder Overlay */}
          {!cameraError && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
              <div
                className={`relative flex h-36 w-64 items-center justify-center rounded-xl transition-all duration-300 sm:h-44 sm:w-72 ${
                  scanFlash
                    ? "ring-2 ring-emerald-400/80 bg-emerald-500/10"
                    : "shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                }`}
              >
                {/* Thin Corner Reticles */}
                <div className="absolute top-0 left-0 h-3.5 w-3.5 rounded-tl-xs border-t-2 border-l-2 border-white/80" />
                <div className="absolute top-0 right-0 h-3.5 w-3.5 rounded-tr-xs border-t-2 border-r-2 border-white/80" />
                <div className="absolute bottom-0 left-0 h-3.5 w-3.5 rounded-bl-xs border-b-2 border-l-2 border-white/80" />
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-br-xs border-r-2 border-b-2 border-white/80" />

                {/* Subtle Minimalist Sweep Line */}
                <div className="absolute inset-x-3 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent animate-scanner-sweep" />

                {isInitializing && (
                  <div className="flex flex-col items-center gap-2 text-white/80">
                    <div className="h-5 w-5 animate-spin rounded-full border border-white/30 border-t-white" />
                    <span className="text-[11px] font-medium tracking-wide">
                      Menyiapkan kamera...
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scan Flash Feedback */}
          {scanFlash && (
            <div className="pointer-events-none absolute inset-0 bg-emerald-500/15 transition-opacity duration-300" />
          )}

          {/* Camera Error Message */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
              <WarningCircleIcon size={36} weight="regular" className="mb-2 text-neutral-400" />
              <p className="max-w-xs text-xs leading-relaxed text-neutral-200">
                {cameraError}
              </p>
              <p className="mt-2 text-[11px] text-neutral-400">
                Gunakan input barcode manual di bawah ini.
              </p>
            </div>
          )}

          {/* Minimalist Floating Controls (Camera Flip & Torch) */}
          {!cameraError && !isInitializing && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-black/50 p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="press-tactile flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-white/80 hover:bg-white/15 hover:text-white transition-colors"
                title="Ganti Kamera (Depan / Belakang)"
              >
                <CameraRotateIcon size={15} weight="bold" />
              </button>

              {hasTorchSupport && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`press-tactile flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors ${
                    torchOn
                      ? "bg-white text-black"
                      : "text-white/80 hover:bg-white/15 hover:text-white"
                  }`}
                  title={torchOn ? "Matikan Lampu" : "Nyalakan Lampu Senter"}
                >
                  <FlashlightIcon size={15} weight="bold" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Minimalist Manual Barcode Input Fallback */}
        <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-3 sm:p-3.5">
          <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ketik barcode manual..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 text-xs font-mono text-[var(--color-text)] placeholder-[var(--color-text-3)] focus:border-[var(--color-text)] focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="press-tactile flex cursor-pointer items-center gap-1 rounded-lg bg-[var(--color-text)] px-3 py-1.5 text-xs font-medium text-[var(--color-surface)] transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
            >
              <span>Input</span>
              <ArrowRightIcon size={12} weight="bold" />
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
