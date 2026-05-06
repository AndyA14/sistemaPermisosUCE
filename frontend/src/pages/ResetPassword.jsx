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
  IconButton,
  useTheme 
} from '@mui/material';
import { 
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

// === IMPORTACIONES DE VALIDACIÓN (RHF + ZOD) ===
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify'; // Agregamos Toastify para mensajes elegantes
import 'react-toastify/dist/ReactToastify.css';

import { resetearContrasena } from '../services/api';
import LoadingModal from '../components/LoadingModal';

// === ESQUEMA DE VALIDACIÓN ZOD ===
const resetSchema = z.object({
  contrasena: z.string()
    .min(8, 'Debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/\d/, 'Debe contener al menos un número'),
  confirmar: z.string()
}).refine((data) => data.contrasena === data.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
});

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [errorAPI, setErrorAPI] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para mostrar/ocultar contraseñas
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // === CONFIGURACIÓN DE REACT HOOK FORM ===
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      contrasena: '',
      confirmar: ''
    },
    mode: 'onChange'
  });

  const onSubmitForm = async (data) => {
    setErrorAPI('');
    setLoading(true);

    try {
      const res = await resetearContrasena(token, data.contrasena);
      toast.success(res.mensaje || 'Contraseña actualizada correctamente.');
      
      // Navegación rápida: Esperamos solo 800ms para que el usuario alcance a leer el Toast
      setTimeout(() => {
        navigate('/login', { replace: true }); // Usamos replace para que no puedan dar "Atrás" a esta página
      }, 800);
      
    } catch (err) {
      setErrorAPI(err.message || 'Error al restablecer la contraseña.');
      setLoading(false); // Solo ocultamos el loading si hay error
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
            padding: { xs: 3, sm: 5 },
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
            variant="h5" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: theme.palette.mode === 'dark' ? '#38bdf8' : '#1a237e', 
              fontWeight: 'bold', 
              mb: 3, 
              textAlign: 'center' 
            }}
          >
            Restablecer Contraseña
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmitForm)} sx={{ width: '100%' }}>
            
            {errorAPI && <Alert severity="error" sx={{ mb: 2 }}>{errorAPI}</Alert>}

            {/* Campo Nueva Contraseña */}
            <Controller
              name="contrasena"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  margin="normal"
                  label="Nueva Contraseña"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Ingrese nueva contraseña"
                  variant="outlined"
                  error={!!errors.contrasena}
                  helperText={errors.contrasena?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'var(--color-text-secondary)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPass(!showPass)} edge="end" sx={{ color: 'var(--color-text-secondary)' }}>
                          {showPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              )}
            />

            {/* Campo Confirmar Contraseña */}
            <Controller
              name="confirmar"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  margin="normal"
                  label="Confirmar Contraseña"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repita la contraseña"
                  variant="outlined"
                  error={!!errors.confirmar}
                  helperText={errors.confirmar?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'var(--color-text-secondary)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" sx={{ color: 'var(--color-text-secondary)' }}>
                          {showConfirm ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
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