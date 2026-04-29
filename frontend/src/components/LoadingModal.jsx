import React from 'react';
import { Backdrop, CircularProgress, Typography, Paper } from '@mui/material';
import { keyframes } from '@mui/system';

// Definimos tu animación personalizada de entrada
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

/**
 * Componente que muestra un modal de carga
 * @param {boolean} visible - true para mostrar el modal
 */
function LoadingModal({ visible }) {
  return (
    <Backdrop
      open={visible}
      sx={{
        // Usamos tus variables CSS, MUI maneja el fadeIn automáticamente
        backgroundColor: 'var(--modal-bg-fondo, rgba(0, 0, 0, 0.5))',
        zIndex: 'var(--z-modal, 9999)',
        transition: 'var(--theme-transition)',
      }}
    >
      <Paper
        elevation={0} // Ponemos 0 porque tu CSS ya tiene un box-shadow definido
        sx={{
          // Mapeo exacto de .loading-box
          backgroundColor: 'var(--modal-bg-contenido)',
          color: 'var(--modal-text-color)',
          padding: { 
            xs: 'var(--spacing-xl) var(--spacing-2xl)', // Móvil 
            md: 'var(--spacing-2xl) var(--spacing-3xl)' // Desktop
          },
          borderRadius: 'var(--modal-border-radius)',
          textAlign: 'center',
          boxShadow: 'var(--modal-box-shadow)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-lg)',
          alignItems: 'center',
          border: '1px solid var(--color-border-primary)',
          transition: 'var(--theme-transition)',
          minWidth: { xs: '180px', md: '200px' },
          
          // Aplicamos tu animación keyframe
          animation: `${slideIn} 0.3s ease-out`,
        }}
      >
        <CircularProgress
          sx={{
            // Reemplazamos tu spinner manual por el nativo de MUI, respetando tus tamaños y colores
            color: 'var(--color-primary-500)',
            width: { xs: '36px !important', md: '48px !important' },
            height: { xs: '36px !important', md: '48px !important' },
            transition: 'var(--theme-transition)',
          }}
          thickness={5} // Equivalente a tu border-width: 5px
        />
        
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 'var(--font-weight-semibold)', 
            fontSize: { xs: 'var(--font-size-base)', md: 'var(--font-size-lg)' } 
          }}
        >
          Cargando...
        </Typography>
      </Paper>
    </Backdrop>
  );
}

export default LoadingModal;