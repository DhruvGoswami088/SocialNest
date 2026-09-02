// Native Web Audio API Chimes
export function playHapticSFX(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "send") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "receive") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.18);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "upload") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === "like") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.14);
    }
  } catch (e) {
    // Handled gracefully
  }
}

// Device & Network Profile Detection
export function getAdaptiveProfile() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const cores = navigator.hardwareConcurrency || 4;
  const isLowPower = cores <= 4 || (conn && (conn.saveData || conn.effectiveType === "2g" || conn.effectiveType === "3g"));

  return {
    isLowPower,
    preloadMode: isLowPower ? "none" : "metadata",
    maxResolutionLabel: isLowPower ? "720p Optimized" : "4K / Ultra Clear",
    filterEnabled: !isLowPower,
  };
}