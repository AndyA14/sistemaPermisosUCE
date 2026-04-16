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
          // Aquí podemos poner los colores principales de tu app en el futuro
          primary: {
            main: '#4f46e5', // Un azul/índigo moderno
          },
          secondary: {
            main: '#ec4899', // Un rosa moderno
          },
        },
        // Hacemos que los botones sean un poco más redondeados por defecto
        shape: {
          borderRadius: 8,
        },
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