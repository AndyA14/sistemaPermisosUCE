import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Alert,
  Badge,
  Container
} from '@mui/material';
import {
  PersonOutline,
  MailOutline,
  PhoneOutlined,
  BadgeOutlined, // Alternativa para Identification
  LocationOnOutlined,
  LockOutlined,
  PhotoCamera,
  EditOutlined,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

import { obtenerPerfil, cambiarContrasena } from '../services/api';
import LoadingModal from '../components/LoadingModal';

const ROLES_LABELS = {
  docente: 'Usuarios de Idiomas Extranjeros',
  admin: 'Administrador del Sistema',
  director: 'Director del Instituto Académico de Idiomas',
  tthh: 'Departamento de Talento Humano',
  dti: 'Departamento de Tecnología de la Información',
};

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado modal cambiar contraseña
  const [showModal, setShowModal] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Estados para mostrar/ocultar contraseñas
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    obtenerPerfil()
      .then(data => {
        setUsuario(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Error al cargar el perfil');
        setLoading(false);
      });
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!oldPass || !newPass || !confirmPass) {
      setPassError('Todos los campos son obligatorios');
      return;
    }

    if (newPass !== confirmPass) {
      setPassError('Las contraseñas no coinciden');
      return;
    }

    try {
      setChangingPass(true);
      await cambiarContrasena(oldPass, newPass);
      setPassSuccess('Contraseña cambiada correctamente');
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      setPassError(err.message);
    } finally {
      setChangingPass(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
    setPassError('');
    setPassSuccess('');
    setShowOldPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
  };

  // Renderizado del componente de Información
  const InfoItem = ({ icon, label, value }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        p: 2,
        backgroundColor: 'var(--color-bg)',
        borderRadius: 3,
        border: '1px solid var(--color-border)',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'var(--btn-crear-bg)',
          boxShadow: '0 2px 8px rgba(52, 152, 219, 0.1)',
        }
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(52, 152, 219, 0.2)'
        }}
      >
        {icon}
      </Box>
      <Box flex={1}>
        <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--color-text)', fontWeight: 500, mt: 0.5 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <LoadingModal visible={loading || changingPass} />

      <Container maxWidth="md">
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !usuario && !error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            No se encontró información del perfil.
          </Alert>
        )}

        {usuario && (
          <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden', backgroundColor: 'var(--color-bg)' }}>
            
            {/* Header del Perfil */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, var(--btn-crear-bg) 0%, #2980b9 100%)',
                color: 'white',
                p: { xs: 3, sm: 4 },
                position: 'relative'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 4, position: 'relative', zIndex: 1 }}>
                
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      sx={{
                        bgcolor: 'var(--btn-crear-bg)',
                        color: 'white',
                        border: '3px solid white',
                        '&:hover': { bgcolor: '#2980b9', transform: 'scale(1.1)' },
                        transition: 'all 0.3s'
                      }}
                    >
                      <PhotoCamera fontSize="small" />
                    </IconButton>
                  }
                >
                  <Avatar
                    src={usuario.fotoUrl || 'https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png'}
                    sx={{
                      width: 140,
                      height: 140,
                      border: '5px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'scale(1.05)' }
                    }}
                  />
                </Badge>

                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                    {usuario.nombres} {usuario.apellidos}
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      px: 2,
                      py: 1,
                      borderRadius: 10,
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <PersonOutline />
                    <Typography variant="body1" fontWeight={500}>
                      {ROLES_LABELS[usuario.rol] || 'Usuario'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Contenido Principal */}
            <Box sx={{ p: { xs: 2, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
              
              {/* Sección Información Personal */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '2px solid var(--color-border)' }}>
                  <Typography variant="h6" fontWeight={600} color="var(--color-text)">
                    Información Personal
                  </Typography>
                  <IconButton sx={{ color: 'var(--color-text)', '&:hover': { bgcolor: 'var(--btn-crear-bg)', color: 'white' } }}>
                    <EditOutlined />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<MailOutline />} label="Correo electrónico" value={usuario.correo} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<PhoneOutlined />} label="Teléfono" value={usuario.telefono || 'No registrado'} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem icon={<BadgeOutlined />} label="Cédula de identidad" value={usuario.ci || 'No registrada'} />
                  </Grid>
                  <Grid item xs={12}>
                    <InfoItem icon={<LocationOnOutlined />} label="Dirección" value={usuario.direccion || 'No registrada'} />
                  </Grid>
                </Grid>
              </Box>

              {/* Sección Seguridad */}
              <Box>
                <Box sx={{ mb: 2, pb: 1, borderBottom: '2px solid var(--color-border)' }}>
                  <Typography variant="h6" fontWeight={600} color="var(--color-text)">
                    Seguridad
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<LockOutlined />}
                  onClick={() => setShowModal(true)}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 3,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)',
                    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.2)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(52, 152, 219, 0.3)',
                    }
                  }}
                >
                  Cambiar Contraseña
                </Button>
              </Box>
            </Box>
          </Paper>
        )}
      </Container>

      {/* Dialog para Cambiar Contraseña */}
      <Dialog open={showModal} onClose={handleCloseModal} PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 480, bgcolor: 'var(--color-bg)' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text)', fontWeight: 600 }}>
          Cambiar Contraseña
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {passError && <Alert severity="error" sx={{ mb: 2 }}>{passError}</Alert>}
          {passSuccess && <Alert severity="success" sx={{ mb: 2 }}>{passSuccess}</Alert>}

          <Box component="form" id="password-form" onSubmit={handlePasswordChange} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              label="Contraseña actual"
              type={showOldPass ? "text" : "password"}
              fullWidth
              required
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowOldPass(!showOldPass)} edge="end">
                      {showOldPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
            <TextField
              label="Nueva contraseña"
              type={showNewPass ? "text" : "password"}
              fullWidth
              required
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPass(!showNewPass)} edge="end">
                      {showNewPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
            <TextField
              label="Confirmar nueva contraseña"
              type={showConfirmPass ? "text" : "password"}
              fullWidth
              required
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPass(!showConfirmPass)} edge="end">
                      {showConfirmPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseModal} sx={{ color: 'var(--color-text)' }}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="password-form" 
            variant="contained" 
            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)' }}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Perfil;