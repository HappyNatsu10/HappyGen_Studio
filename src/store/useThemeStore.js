import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const PRESET_THEMES = {
  default: {
    id: 'default',
    name: 'Midnight Blue (Default)',
    colors: {
      '--surface-0': '#050511',
      '--surface-1': '#0a0a1a',
      '--surface-2': '#15152a',
      '--surface-3': '#1f1f3d',
      '--surface-4': '#2d2d56',
      '--border-subtle': 'rgba(255, 255, 255, 0.06)',
      '--border-default': 'rgba(255, 255, 255, 0.12)',
      '--accent': '#a855f7',
      '--text-primary': '#ffffff',
      '--text-secondary': '#94a3b8',
      '--text-tertiary': '#64748b',
    }
  },
  oled: {
    id: 'oled',
    name: 'OLED Black',
    colors: {
      '--surface-0': '#000000',
      '--surface-1': '#080808',
      '--surface-2': '#121212',
      '--surface-3': '#1a1a1a',
      '--surface-4': '#242424',
      '--border-subtle': 'rgba(255, 255, 255, 0.04)',
      '--border-default': 'rgba(255, 255, 255, 0.10)',
      '--accent': '#3b82f6',
      '--text-primary': '#ffffff',
      '--text-secondary': '#a1a1aa',
      '--text-tertiary': '#71717a',
    }
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: {
      '--surface-0': '#0f0a1c',
      '--surface-1': '#19112c',
      '--surface-2': '#271944',
      '--surface-3': '#36225a',
      '--surface-4': '#4a2f7c',
      '--border-subtle': 'rgba(236, 72, 153, 0.15)',
      '--border-default': 'rgba(236, 72, 153, 0.3)',
      '--accent': '#f43f5e',
      '--text-primary': '#fdf2f8',
      '--text-secondary': '#fbcfe8',
      '--text-tertiary': '#f472b6',
    }
  },
  forest: {
    id: 'forest',
    name: 'Deep Forest',
    colors: {
      '--surface-0': '#05110a',
      '--surface-1': '#091c12',
      '--surface-2': '#112e1f',
      '--surface-3': '#18402b',
      '--surface-4': '#21593c',
      '--border-subtle': 'rgba(255, 255, 255, 0.05)',
      '--border-default': 'rgba(255, 255, 255, 0.12)',
      '--accent': '#10b981',
      '--text-primary': '#ffffff',
      '--text-secondary': '#94a3b8',
      '--text-tertiary': '#64748b',
    }
  },
  light: {
    id: 'light',
    name: 'Minimal Light',
    colors: {
      '--surface-0': '#f8fafc',
      '--surface-1': '#ffffff',
      '--surface-2': '#f1f5f9',
      '--surface-3': '#e2e8f0',
      '--surface-4': '#cbd5e1',
      '--border-subtle': 'rgba(0, 0, 0, 0.05)',
      '--border-default': 'rgba(0, 0, 0, 0.1)',
      '--accent': '#a855f7',
      '--text-primary': '#0f172a',
      '--text-secondary': '#475569',
      '--text-tertiary': '#64748b',
    }
  }
};

const useThemeStore = create(
  persist(
    (set) => ({
      activeThemeId: 'default',
      customThemes: [],
      
      setTheme: (id) => set({ activeThemeId: id }),
      
      addCustomTheme: (themeObj) => set((state) => {
        const newTheme = {
          ...themeObj,
          id: `custom_${Date.now()}`,
          isCustom: true,
        };
        return {
          customThemes: [...state.customThemes, newTheme],
          activeThemeId: newTheme.id
        };
      }),
      
      updateCustomTheme: (id, themeObj) => set((state) => ({
        customThemes: state.customThemes.map(t => t.id === id ? { ...t, ...themeObj } : t)
      })),
      
      deleteCustomTheme: (id) => set((state) => ({
        customThemes: state.customThemes.filter(t => t.id !== id),
        activeThemeId: state.activeThemeId === id ? 'default' : state.activeThemeId
      })),
    }),
    {
      name: 'happygen-theme-storage'
    }
  )
);

export default useThemeStore;
