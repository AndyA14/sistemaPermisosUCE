/**
 * Utilidades para manejo de temas (Light/Dark mode)
 */

import { useState, useEffect } from 'react';

// Claves para localStorage
const THEME_STORAGE_KEY = 'app-theme';
const THEME_ATTRIBUTE = 'data-theme';

// Temas disponibles
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

/**
 * Obtiene la preferencia del sistema
 * @returns {'light' | 'dark'}
 */
export const getSystemTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
  }
  return THEMES.LIGHT;
};

/**
 * Obtiene el tema actual desde localStorage o sistema
 * @returns {'light' | 'dark' | 'system'}
 */
export const getCurrentTheme = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && Object.values(THEMES).includes(saved)) {
      return saved;
    }
  }
  return THEMES.SYSTEM;
};

/**
 * Obtiene el tema efectivo (resuelve 'system' a light/dark)
 * @returns {'light' | 'dark'}
 */
export const getEffectiveTheme = () => {
  const current = getCurrentTheme();
  if (current === THEMES.SYSTEM) {
    return getSystemTheme();
  }
  return current;
};

/**
 * Aplica el tema al DOM
 * @param {'light' | 'dark'} theme 
 */
export const applyTheme = (theme) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    
    // Deshabilitar transiciones temporalmente para evitar flashing
    root.classList.add('no-transition');
    
    // Remover tema anterior
    root.removeAttribute(THEME_ATTRIBUTE);
    
    // Aplicar nuevo tema
    if (theme && theme !== THEMES.SYSTEM) {
      root.setAttribute(THEME_ATTRIBUTE, theme);
    }
    
    // Reactivar transiciones después de un frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('no-transition');
      });
    });
  }
};

/**
 * Guarda y aplica un tema
 * @param {'light' | 'dark' | 'system'} theme 
 */
export const setTheme = (theme) => {
  if (!Object.values(THEMES).includes(theme)) {
    console.warn(`Tema inválido: ${theme}`);
    return;
  }
  
  // Guardar en localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
  
  // Aplicar tema efectivo
  const effectiveTheme = theme === THEMES.SYSTEM ? getSystemTheme() : theme;
  applyTheme(effectiveTheme);
};

/**
 * Alterna entre modo claro y oscuro
 */
export const toggleTheme = () => {
  const current = getEffectiveTheme();
  const newTheme = current === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
  setTheme(newTheme);
};

/**
 * Inicializa el tema al cargar la aplicación
 */
export const initializeTheme = () => {
  const savedTheme = getCurrentTheme();
  const effectiveTheme = savedTheme === THEMES.SYSTEM ? getSystemTheme() : savedTheme;
  applyTheme(effectiveTheme);
  
  // Escuchar cambios en la preferencia del sistema
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const currentSaved = getCurrentTheme();
      if (currentSaved === THEMES.SYSTEM) {
        const systemTheme = e.matches ? THEMES.DARK : THEMES.LIGHT;
        applyTheme(systemTheme);
      }
    };
    
    // Método moderno
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }
};

/**
 * Hook personalizado para React (opcional)
 * Puedes usar esto en componentes React
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState(getCurrentTheme());
  const [effectiveTheme, setEffectiveTheme] = useState(getEffectiveTheme());
  
  useEffect(() => {
    const cleanup = initializeTheme();
    
    // Actualizar estado cuando cambie el tema
    const updateTheme = () => {
      setThemeState(getCurrentTheme());
      setEffectiveTheme(getEffectiveTheme());
    };
    
    // Observar cambios en localStorage (para múltiples pestañas)
    const handleStorageChange = (e) => {
      if (e.key === THEME_STORAGE_KEY) {
        updateTheme();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      if (cleanup) cleanup();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    setThemeState(newTheme);
    setEffectiveTheme(newTheme === THEMES.SYSTEM ? getSystemTheme() : newTheme);
  };
  
  return {
    theme,
    effectiveTheme,
    setTheme: changeTheme,
    toggleTheme: () => changeTheme(effectiveTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT),
    isLight: effectiveTheme === THEMES.LIGHT,
    isDark: effectiveTheme === THEMES.DARK,
    isSystem: theme === THEMES.SYSTEM
  };
};

// Exportar por defecto para facilitar importación
export default {
  THEMES,
  getCurrentTheme,
  getEffectiveTheme,
  setTheme,
  toggleTheme,
  initializeTheme,
  useTheme
};
