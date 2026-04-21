import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Stack 
} from '@mui/material';
import { 
  LockOutlined as LockIcon, 
  WarningAmber as WarningIcon 
} from '@mui/icons-material';

function Unauthorized() {
  const navigate = useNavigate();

  const handleHome = () => navigate('/');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
        background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            padding: { xs: 4, sm: 6 },
            borderRadius: 4,
            textAlign: 'center',
            backgroundColor: 'var(--card-bg, #ffffff)',
            color: 'var(--color-text)',
            borderTop: '5px solid var(--color-danger, #e74c3c)',
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
            <LockIcon sx={{ fontSize: 60, color: 'var(--color-text-secondary)', opacity: 0.5 }} />
            <WarningIcon 
              sx={{ 
                fontSize: 35, 
                color: 'var(--color-danger, #e74c3c)', 
                position: 'absolute', 
                bottom: -5, 
                right: -10,
                backgroundColor: 'var(--card-bg)',
                borderRadius: '50%'
              }} 
            />
          </Box>

          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Acceso No Autorizado
          </Typography>
          
          <Typography variant="h6" sx={{ color: 'var(--color-danger, #e74c3c)', mb: 2, fontWeight: 500 }}>
            No tienes permisos para acceder a esta sección.
          </Typography>
          
          <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)', mb: 4 }}>
            Si crees que esto es un error, contacta con el administrador de tu sistema o verifica tus credenciales.
          </Typography>

          <Stack direction="row" justifyContent="center">
            <Button
              variant="outlined"
              onClick={handleHome}
              size="large"
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                px: 4,
                color: 'var(--color-text)',
                borderColor: 'var(--color-border)',
                '&:hover': {
                  borderColor: 'var(--color-text)',
                  backgroundColor: 'rgba(0,0,0,0.05)'
                }
              }}
            >
              Ir al Inicio
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default Unauthorized;