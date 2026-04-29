import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  InputAdornment, 
  Alert,
  Stack
} from '@mui/material';
import { MailOutline as MailIcon } from '@mui/icons-material';

import { solicitarReset } from '../services/api';
import LoadingModal from '../components/LoadingModal';

function SolicitarReset() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setLoading(true);

    try {
      const data = await solicitarReset(correo);
      setMensaje(data.mensaje || 'Se ha enviado un enlace de recuperación a su correo.');
      setCorreo('');
    } catch (err) {
      setError(err.message || 'Error al enviar el enlace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--login-bg-gradient, linear-gradient(135deg, #1a237e 0%, #0d47a1 100%))',
        padding: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            padding: { xs: 3, sm: 5 },
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.07))',
            backdropFilter: 'blur(10px)',
            color: 'var(--color-text)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
            },
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom sx={{ color: 'var(--color-link)', fontWeight: 'bold', textAlign: 'center' }}>
            Recuperar Contraseña
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Ingrese su correo electrónico y le enviaremos instrucciones para restablecer su contraseña.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {mensaje && <Alert severity="success" sx={{ mb: 2 }}>{mensaje}</Alert>}

            <TextField
              fullWidth
              margin="normal"
              label="Correo electrónico"
              type="email"
              placeholder="ejemplo@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              variant="outlined"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailIcon sx={{ color: 'var(--icon-color)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3, mb: 1 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  backgroundColor: 'var(--btn-crear-bg, var(--color-link))',
                  '&:hover': { backgroundColor: 'var(--btn-crear-bg-hover, var(--color-link-hover))' }
                }}
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </Button>

              <Button 
                type="button" 
                fullWidth
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border-primary)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  '&:hover': { 
                    backgroundColor: 'var(--color-bg-tertiary)',
                    borderColor: 'var(--color-link)',
                    color: 'var(--color-link)'
                  }
                }}
              >
                Atrás
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
      <LoadingModal visible={loading} />
    </Box>
  );
}

export default SolicitarReset;