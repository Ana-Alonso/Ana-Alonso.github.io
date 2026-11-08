// Sistema de audio procedimental con Web Audio API (cero dependencias externas y cero assets pesados)
let audioCtx: AudioContext | null = null;
let rainGain: GainNode | null = null;
let rainSource: AudioBufferSourceNode | null = null;

const SOUND_STORAGE = 'portfolio:sound:v1';

function readSoundPref(): boolean {
  try {
    const raw = window.localStorage.getItem(SOUND_STORAGE);
    // Desactivado por defecto para respetar a11y, o activado si el usuario lo eligió
    return raw ? Boolean(JSON.parse(raw)) : false;
  } catch {
    return false;
  }
}

let soundEnabled = typeof window !== 'undefined' ? readSoundPref() : false;

function persistSoundPref(enabled: boolean) {
  try {
    window.localStorage.setItem(SOUND_STORAGE, JSON.stringify(enabled));
  } catch {
    // Ignore storage errors
  }
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) audioCtx = new AudioCtx();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generador de ruido rosa/lluvia suave para ambiente nocturno
function createRainBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    data[i] = (b0 + b1 + b2) * 0.04;
  }
  return buffer;
}

export const soundEffects = {
  get enabled() {
    return soundEnabled;
  },
  toggle() {
    soundEnabled = !soundEnabled;
    persistSoundPref(soundEnabled);
    if (!soundEnabled) {
      soundEffects.stopAmbience();
    }
    return soundEnabled;
  },
  setEnabled(enabled: boolean) {
    soundEnabled = enabled;
    persistSoundPref(enabled);
    if (!soundEnabled) {
      soundEffects.stopAmbience();
    }
  },
  // Chasquido táctil mecánico
  click() {
    if (!soundEnabled) return;
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  },
  // Despliegue de papel / cambio de plano o libro
  whoosh() {
    if (!soundEnabled) return;
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.07);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  },
  // Tecla de laptop
  keyTap() {
    if (!soundEnabled) return;
    const ctx = getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.022);
  },
  // Lluvia ambiental suave de fondo en modo noche
  syncAmbience(night: boolean) {
    if (!soundEnabled || !night) {
      soundEffects.stopAmbience();
      return;
    }
    const ctx = getContext();
    if (!ctx) return;

    if (!rainSource) {
      const buffer = createRainBuffer(ctx);
      rainSource = ctx.createBufferSource();
      rainSource.buffer = buffer;
      rainSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 650;

      rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(0.015, ctx.currentTime);

      rainSource.connect(filter);
      filter.connect(rainGain);
      rainGain.connect(ctx.destination);

      rainSource.start();
    }
  },
  stopAmbience() {
    if (rainSource) {
      try {
        rainSource.stop();
        rainSource.disconnect();
      } catch {
        // Ignore if already stopped
      }
      rainSource = null;
      rainGain = null;
    }
  },
};
