import { useEffect } from 'react';
import useThemeStore, { PRESET_THEMES } from '../../store/useThemeStore';

export default function ThemeManager() {
  const { activeThemeId, customThemes } = useThemeStore();

  useEffect(() => {
    let themeObj = PRESET_THEMES[activeThemeId];
    
    // If it's a custom theme, find it in the custom array
    if (!themeObj && activeThemeId.startsWith('custom_')) {
      themeObj = customThemes.find(t => t.id === activeThemeId);
    }
    
    // Fallback to default if not found
    if (!themeObj) {
      themeObj = PRESET_THEMES['default'];
    }

    if (themeObj && themeObj.colors) {
      const root = document.documentElement;
      Object.entries(themeObj.colors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [activeThemeId, customThemes]);

  return null; // This is a headless component
}
