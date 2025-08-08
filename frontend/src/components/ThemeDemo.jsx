/**
 * Componente de demostración para mostrar el sistema de temas
 * Este archivo es temporal y puede ser eliminado más tarde
 */

import React from 'react';
import { useTheme } from '../utils/theme';

const ThemeDemo = () => {
  const { theme, effectiveTheme, setTheme, toggleTheme, isLight, isDark } = useTheme();

  const demoStyles = {
    container: {
      padding: 'var(--spacing-xl)',
      backgroundColor: 'var(--color-bg-primary)',
      color: 'var(--color-text-primary)',
      borderRadius: 'var(--border-radius-lg)',
      border: '1px solid var(--color-border-primary)',
      boxShadow: 'var(--card-shadow)',
      margin: 'var(--spacing-lg)',
      transition: 'var(--theme-transition)'
    },
    card: {
      backgroundColor: 'var(--color-surface-primary)',
      padding: 'var(--spacing-lg)',
      borderRadius: 'var(--border-radius-md)',
      marginBottom: 'var(--spacing-md)',
      border: '1px solid var(--color-border-primary)'
    },
    button: {
      backgroundColor: 'var(--color-primary-500)',
      color: 'var(--color-text-inverse)',
      padding: 'var(--spacing-sm) var(--spacing-lg)',
      borderRadius: 'var(--border-radius-md)',
      border: 'none',
      margin: 'var(--spacing-xs)',
      cursor: 'pointer'
    }
  };

  return (
    <div style={demoStyles.container}>
      <h2>Demostración del Sistema de Temas</h2>
      
      <div style={demoStyles.card}>
        <h3>Estado Actual</h3>
        <p><strong>Tema configurado:</strong> {theme}</p>
        <p><strong>Tema efectivo:</strong> {effectiveTheme}</p>
        <p><strong>Es modo claro:</strong> {isLight ? 'Sí' : 'No'}</p>
        <p><strong>Es modo oscuro:</strong> {isDark ? 'Sí' : 'No'}</p>
      </div>

      <div style={demoStyles.card}>
        <h3>Controles de Tema</h3>
        <button 
          style={demoStyles.button}
          onClick={() => setTheme('light')}
        >
          Modo Claro
        </button>
        <button 
          style={demoStyles.button}
          onClick={() => setTheme('dark')}
        >
          Modo Oscuro
        </button>
        <button 
          style={demoStyles.button}
          onClick={() => setTheme('system')}
        >
          Seguir Sistema
        </button>
        <button 
          style={demoStyles.button}
          onClick={toggleTheme}
        >
          Alternar Tema
        </button>
      </div>

      <div style={demoStyles.card}>
        <h3>Colores Demostrativos</h3>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          <div style={{
            backgroundColor: 'var(--color-success)',
            padding: 'var(--spacing-sm)',
            borderRadius: 'var(--border-radius-sm)',
            color: 'white'
          }}>
            Éxito
          </div>
          <div style={{
            backgroundColor: 'var(--color-warning)',
            padding: 'var(--spacing-sm)',
            borderRadius: 'var(--border-radius-sm)',
            color: 'white'
          }}>
            Advertencia
          </div>
          <div style={{
            backgroundColor: 'var(--color-danger)',
            padding: 'var(--spacing-sm)',
            borderRadius: 'var(--border-radius-sm)',
            color: 'white'
          }}>
            Error
          </div>
          <div style={{
            backgroundColor: 'var(--color-info)',
            padding: 'var(--spacing-sm)',
            borderRadius: 'var(--border-radius-sm)',
            color: 'white'
          }}>
            Información
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
