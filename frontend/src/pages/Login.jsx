import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Avatar, 
  InputAdornment, 
  Link,
  useTheme // <-- Importamos useTheme de MUI
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Lock as LockIcon 
} from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';

// Importaciones de lógica propia
import { loginUsuario } from '../services/api';
import { isAuthenticated, getRol, loginUsuarioT } from '../utils/auth';
import LoadingModal from '../components/LoadingModal';

function Login() {
  const [form, setForm] = useState({ username: '', contrasena: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme(); // <-- Detectamos el tema actual (light/dark)

  // === Función centralizada para redirigir según rol ===
  const redirigirPorRol = (rol = '') => {
    const rutaPorRol = {
      docente: '/permisos/ver',
      director: '/dashboard/resumen',
      tthh: '/listado-tthh/dashboard',
      dti: '/dtic/dashboard',
      admin: '/permisos/ver',
    };
    navigate(rutaPorRol[rol.toLowerCase()] || '/unauthorized');
  };

  // === Si ya está autenticado, redirigir automáticamente ===
  useEffect(() => {
    if (isAuthenticated()) {
      redirigirPorRol(getRol());
    }
  }, [navigate]);

  // === Manejo de inputs controlados ===
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // === Envío del formulario ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.contrasena) {
      toast.warn('Por favor, complete todos los campos', { position: "top-center" });
      return;
    }

    setLoading(true);
    try {
      const data = await loginUsuario(form);
      loginUsuarioT(data.token);
      localStorage.setItem('rol', data.usuario.rol.toLowerCase());
      redirigirPorRol(data.usuario.rol);
    } catch (err) {
      toast.error(err.message || 'Error al iniciar sesión', { position: "top-center" });
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
        // Fondo dinámico: Azul brillante en Light Mode, Azul profundo en Dark Mode
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
          : 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            padding: { xs: 3, sm: 6 },
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            // Color de tarjeta dinámico
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
            },
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#38bdf8' : '#1a237e', 
              fontWeight: 'bold' 
            }}
          >
            Iniciar Sesión
          </Typography>

          <Avatar
            src="/logoIAI.png"
            sx={{ width: 120, height: 120, mb: 3, boxShadow: 3, backgroundColor: 'white' }}
          />

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              margin="normal"
              name="username"
              label="Usuario"
              placeholder="Ingrese su usuario"
              value={form.username}
              onChange={handleInputChange}
              variant="outlined"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: 'var(--color-text-secondary)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              margin="normal"
              name="contrasena"
              label="Contraseña"
              type="password"
              placeholder="Ingrese su contraseña"
              value={form.contrasena}
              onChange={handleInputChange}
              variant="outlined"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'var(--color-text-secondary)' }} />
                  </InputAdornment>
                ),
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
                // Botón dinámico
                backgroundColor: theme.palette.mode === 'dark' ? '#0ea5e9' : '#1a237e',
                '&:hover': { 
                  backgroundColor: theme.palette.mode === 'dark' ? '#0284c7' : '#0d47a1' 
                }
              }}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link
                component={RouterLink}
                to="/solicitar-reset"
                sx={{
                  color: theme.palette.mode === 'dark' ? '#f59e0b' : '#d97706',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                ¿Olvidó su contraseña?
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>

      <ToastContainer />
      <LoadingModal visible={loading} />
    </Box>
  );
}

export default Login;