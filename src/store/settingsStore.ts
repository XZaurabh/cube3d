import { create } from 'zustand';
import { soundEngine } from '../engine/sound';

export type AnimationSpeedOption = 'slow' | 'normal' | 'fast';
export type CameraSensitivityOption = 'low' | 'normal' | 'high';

interface SettingsState {
  theme: 'dark' | 'light';
  animationSpeed: AnimationSpeedOption;
  sound: boolean;
  cameraSensitivity: CameraSensitivityOption;
  reducedMotion: boolean;

  setTheme: (theme: 'dark' | 'light') => void;
  setAnimationSpeed: (speed: AnimationSpeedOption) => void;
  setSound: (sound: boolean) => void;
  setCameraSensitivity: (sens: CameraSensitivityOption) => void;
  setReducedMotion: (reduced: boolean) => void;
  getDurationMs: () => number;
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('cube_theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // Ignored
    }
  }
  return 'dark';
};

// Initial sync with documentElement
if (typeof document !== 'undefined') {
  const init = getInitialTheme();
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(init);
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: getInitialTheme(),
  animationSpeed: 'normal',
  sound: true,
  cameraSensitivity: 'normal',
  reducedMotion: false,

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cube_theme', theme);
      } catch {
        // Ignored
      }
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(theme);
    }
    set({ theme });
  },

  setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
  setSound: (sound) => {
    soundEngine.enabled = sound;
    set({ sound });
  },
  setCameraSensitivity: (cameraSensitivity) => set({ cameraSensitivity }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),

  getDurationMs: () => {
    const { animationSpeed, reducedMotion } = get();
    if (reducedMotion) return 10;
    if (animationSpeed === 'slow') return 320;
    if (animationSpeed === 'fast') return 80;
    return 170; // normal
  },
}));
