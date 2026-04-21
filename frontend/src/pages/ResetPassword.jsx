import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  InputAdornment, 
  Alert,
  IconButton
} from '@mui/material';
import { 
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

import { resetearContrasena } from '../services/api';
import LoadingModal from '../components/LoadingModal';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para mostrar contraseñas (mejora UX)
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validarContrasena = (pwd) => {
    return pwd.length >= 8 &&
           /[A-Z]/.test(pwd) &&
           /[a-z]/.test(pwd) &&
           /\d/.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setLoading(true);

    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    if (!validarContrasena(contrasena)) {
      setError('Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      setLoading(false);
      return;
    }

    try {
      const data = await resetearContrasena(token, contrasena);
      setMensaje(data.mensaje || 'Contraseña actualizada correctamente.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña.');
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
          <Typography variant="h5" component="h1" gutterBottom sx={{ color: 'var(--color-link)', fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
            Restablecer Contraseña
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {mensaje && <Alert severity="success" sx={{ mb: 2 }}>{mensaje}</Alert>}

            <TextField
              fullWidth
              margin="normal"
              label="Nueva Contraseña"
              type={showPass ? 'text' : 'password'}
              placeholder="Ingrese nueva contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              variant="outlined"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'var(--icon-color)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Confirmar Contraseña"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repita la contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              variant="outlined"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'var(--icon-color)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                backgroundColor: 'var(--color-link)',
                '&:hover': { backgroundColor: 'var(--color-link-hover)' }
              }}
            >
              {loading ? "Restableciendo..." : "Restablecer"}
            </Button>
          </Box>
        </Paper>
      </Container>
      <LoadingModal visible={loading} />
    </Box>
  );
}

export default ResetPassword;