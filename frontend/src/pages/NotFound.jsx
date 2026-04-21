import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { keyframes } from '@mui/system';
import { ErrorOutline } from '@mui/icons-material';

// Definición de la animación shake en MUI
const shake = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(5deg); }
  75% { transform: rotate(-5deg); }
`;

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4AB3F4, #1D2D50)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            padding: { xs: 4, sm: 6 },
            borderRadius: '24px',
            textAlign: 'center',
            backgroundColor: 'var(--color-bg-elevated, #ffffff)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
            },
          }}
        >
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'center',
              animation: `${shake} 1.5s infinite`,
              color: '#003366',
            }}
          >
            {/* Usamos el ícono de MUI pero escalado */}
            <ErrorOutline sx={{ fontSize: 80 }} />
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4.5rem', sm: '6rem' },
              fontWeight: 'bold',
              color: 'var(--color-danger, #e74c3c)',
              lineHeight: 1,
              mb: 1,
            }}
          >
            404
          </Typography>

          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem' },
              color: 'var(--color-text-primary, #333)',
              mb: 2,
            }}
          >
            Página no encontrada
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'var(--color-text-secondary, #555)',
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            La ruta que estás intentando acceder no existe o ha sido movida.
          </Typography>

          <Button
            variant="contained"
            component={RouterLink}
            to="/"
            sx={{
              padding: '12px 32px',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              },
            }}
          >
            Volver al inicio
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFound;