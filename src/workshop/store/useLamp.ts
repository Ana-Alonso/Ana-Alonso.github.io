import { create } from 'zustand';
import { soundEffects } from './useSound';

const STORAGE_KEY = 'portfolio:taller:v1';

interface LampStore {
  night: boolean;
  setNight: (night: boolean) => void;
  toggleNight: () => void;
}

function read(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return Boolean((JSON.parse(raw) as { night?: boolean }).night);
    }
    // Detección automática según hora local del usuario (noche de 20:00 a 07:00)
    const hours = new Date().getHours();
    return hours >= 20 || hours < 7;
  } catch {
    const hours = new Date().getHours();
    return hours >= 20 || hours < 7;
  }
}

function persist(night: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ night }));
  } catch {
  }
}

export const useLamp = create<LampStore>((set, get) => ({
  night: read(),
  setNight: (night) => {
    if (get().night === night) return;
    persist(night);
    soundEffects.syncAmbience(night);
    set({ night });
  },
  toggleNight: () => {
    soundEffects.click();
    const night = !get().night;
    persist(night);
    soundEffects.syncAmbience(night);
    set({ night });
  },
}));

window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY) return;
  useLamp.setState({ night: read() });
});
