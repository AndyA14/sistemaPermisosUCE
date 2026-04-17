import React, { createContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 1. Creamos el contexto que usaremos luego en el Header para el botón de cambio
export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  // 2. Revisamos si el usuario ya tenía guardado el modo oscuro antes
  const [mode, setMode] = useState(localStorage.getItem('app_theme') || 'light');

  // 3. LA MAGIA: Esto hace que tu CSS viejo y Material UI trabajen juntos
  useEffect(() => {
    // Esto hace que funcione tu viejo CSS: [data-theme="dark"]
    document.documentElement.setAttribute('data-theme', mode);
    // Guardamos la preferencia
    localStorage.setItem('app_theme', mode);
  }, [mode]);

  // 4. Función para alternar el modo (la usaremos en el Header)
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // 5. Configuramos el tema oficial de Material UI
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode, // 'light' o 'dark'
          primary: {
            // Sincronizado con tu --color-sky-500 (light) y --color-sky-400 (dark)
            main: mode === 'dark' ? '#38bdf8' : '#0ea5e9', 
          },
          secondary: {
            main: '#ec4899', // Mantenemos tu rosa moderno
          },
          // 🚀 LA SOLUCIÓN AL TEXTO INVISIBLE:
          // Le decimos a MUI exactamente qué colores de fondo usar en modo oscuro
          background: {
            default: mode === 'dark' ? '#0f172a' : '#ffffff', // var(--color-bg-primary)
            paper: mode === 'dark' ? '#1e293b' : '#ffffff',   // var(--color-bg-elevated)
          },
          // Forzamos el color del texto para que siempre haga contraste con los fondos
          text: {
            primary: mode === 'dark' ? '#f1f5f9' : '#1e293b', 
            secondary: mode === 'dark' ? '#cbd5e1' : '#64748b',
          }
        },
        // Hacemos que los botones sean un poco más redondeados por defecto
        shape: {
          borderRadius: 8,
        },
        // Sincronizamos la tipografía con la de tu root.css
        typography: {
          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={muiTheme}>
        {/* CssBaseline normaliza colores de fondo y texto generales en MUI */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};