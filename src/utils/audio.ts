// Web Audio API synthesizer for scanner feedback and alarms

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Standard laser scanner high-pitch success beep (880Hz)
 */
export function playScanSuccessBeep(): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    console.warn('Audio feedback failed', e);
  }
}

/**
 * Double confirmation chime for clearance confirmed
 */
export function playClearanceConfirmedSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(587.33, now, 0.1);       // D5
    playTone(880, now + 0.1, 0.18);    // A5
  } catch (e) {
    console.warn('Audio feedback failed', e);
  }
}

let sirenInterval: number | null = null;

/**
 * Emergency police / security siren for stolen laptop alert
 */
export function playStolenAlarm(durationMs: number = 3500): () => void {
  stopStolenAlarm();
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.4, ctx.currentTime);

    // Modulate pitch between 600Hz and 1200Hz
    const now = ctx.currentTime;
    const duration = durationMs / 1000;
    
    for (let t = 0; t < duration; t += 0.3) {
      osc.frequency.setValueAtTime(650, now + t);
      osc.frequency.linearRampToValueAtTime(1200, now + t + 0.15);
      osc.frequency.linearRampToValueAtTime(650, now + t + 0.3);
    }

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);

    const stop = () => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // already stopped
      }
    };
    return stop;
  } catch (e) {
    console.warn('Alarm audio failed', e);
    return () => {};
  }
}

export function stopStolenAlarm(): void {
  if (sirenInterval !== null) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
}
