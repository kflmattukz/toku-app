// Web Audio API & Haptic Feedback for Barcode Scanning

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Play crisp electronic beep sound for successful barcode scan
 */
export function playScanSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Quick ascending blip tone from 1800Hz to 2400Hz
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // AudioContext failure fallback
  }
}

/**
 * Play low warning buzz sound when barcode is not found or error
 */
export function playScanErrorSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.setValueAtTime(200, now + 0.1);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch {
    // AudioContext failure fallback
  }
}

/**
 * Trigger mobile device vibration haptic
 */
export function triggerHaptic(type: "success" | "error" = "success") {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      if (type === "success") {
        navigator.vibrate(60);
      } else {
        navigator.vibrate([80, 50, 80]);
      }
    } catch {
      // Ignore vibration error
    }
  }
}

/**
 * Combined helper for scan feedback
 */
export function triggerScanFeedback(success: boolean) {
  if (success) {
    playScanSuccessSound();
    triggerHaptic("success");
  } else {
    playScanErrorSound();
    triggerHaptic("error");
  }
}
