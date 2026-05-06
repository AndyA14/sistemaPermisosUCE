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
  useTheme 
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Lock as LockIcon 
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// === IMPORTACIONES DE VALIDACIÓN (RHF + ZOD) ===
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Importaciones de lógica propia
import { loginUsuario } from '../services/api';
import { isAuthenticated, getRol, loginUsuarioT } from '../utils/auth';
import LoadingModal from '../components/LoadingModal';

// === ESQUEMA DE VALIDACIÓN ZOD PARA LOGIN ===
// Como pediste, aquí no validamos formato de correo, solo que no estén vacíos.
const loginSchema = z.object({
  username: z.string().min(1, 'El usuario o correo es obligatorio'),
  contrasena: z.string().min(1, 'La contraseña es obligatoria')
});

function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme(); 

  // === CONFIGURACIÓN DE REACT HOOK FORM ===
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      contrasena: ''
    }
  });

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

  // === Envío del formulario validado por Zod ===
  const onSubmitForm = async (data) => {
    // Si la ejecución llega aquí, es porque RHF y Zod ya confirmaron 
    // que los campos NO están vacíos. Nos ahorramos el "if" manual.
    setLoading(true);
    try {
      const response = await loginUsuario(data);
      loginUsuarioT(response.token);
      localStorage.setItem('rol', response.usuario.rol.toLowerCase());
      redirigirPorRol(response.usuario.rol);
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

          {/* Formulario enlazado con handleSubmit de RHF */}
          <Box component="form" onSubmit={handleSubmit(onSubmitForm)} sx={{ width: '100%' }}>
            
            {/* Campo Usuario */}
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  margin="normal"
                  label="Usuario"
                  placeholder="Ingrese su usuario o correo"
                  variant="outlined"
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: 'var(--color-text-secondary)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
            />

            {/* Campo Contraseña */}
            <Controller
              name="contrasena"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  margin="normal"
                  label="Contraseña"
                  type="password"
                  placeholder="Ingrese su contraseña"
                  variant="outlined"
                  error={!!errors.contrasena}
                  helperText={errors.contrasena?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'var(--color-text-secondary)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
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

      
      <LoadingModal visible={loading} />
    </Box>
  );
}

export default Login;