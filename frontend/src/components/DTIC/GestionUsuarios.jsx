import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
  InputAdornment,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Badge as BadgeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AdminPanelSettings as RoleIcon,
  Edit as EditIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  PeopleAlt as PeopleIcon,
  CheckCircleOutline,
  CancelOutlined,
  Save as SaveIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// === IMPORTACIONES DE VALIDACIÓN (RHF + ZOD) ===
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Importaciones locales
import {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  activarUsuario,
  desactivarUsuario,
} from '../../services/api';
import LoadingModal from '../../components/LoadingModal';

// === ESQUEMA DE VALIDACIÓN ZOD ===
const usuarioSchema = z.object({
  nombres: z.string().min(3, 'Los nombres son obligatorios'),
  apellidos: z.string().min(3, 'Los apellidos son obligatorios'),
  ci: z.string()
    .length(10, 'La cédula debe tener exactamente 10 dígitos')
    .regex(/^\d+$/, 'La cédula solo debe contener números'),
  correo: z.string()
    .min(1, 'El correo es obligatorio')
    .includes('@', { message: 'El correo debe contener el símbolo "@"' }),
  telefono: z.string()
    .min(7, 'Mínimo 7 dígitos requeridos')
    .regex(/^\d+$/, 'El teléfono solo debe contener números'),
  direccion: z.string().min(4, 'La dirección es obligatoria'),
  rol: z.enum(['docente', 'admin', 'director', 'tthh', 'dti']),
  username: z.string()
});

const defaultValuesForm = {
  nombres: '',
  apellidos: '',
  username: '',
  ci: '',
  correo: '',
  telefono: '',
  direccion: '',
  rol: 'docente',
};

// Función helper original
function generarUsername(nombres, apellidos, usuariosExistentes) {
  if (!nombres || !apellidos) return '';

  const nombresArr = nombres.trim().split(/\s+/);
  const apellidosArr = apellidos.trim().split(/\s+/);

  const inicial1 = nombresArr[0]?.[0]?.toLowerCase() || '';
  const inicial2 = nombresArr[1]?.[0]?.toLowerCase() || '';
  const primerApellido = apellidosArr[0]?.toLowerCase() || '';
  const segundaInicialApellido = apellidosArr.length > 1 ? apellidosArr[1][0].toLowerCase() : '';

  let usernameBase = inicial1 + inicial2 + primerApellido;
  const existeBase = usuariosExistentes.some(u => u.username === usernameBase);

  if (!existeBase) return usernameBase;

  if (segundaInicialApellido) {
    let usernameConSegunda = usernameBase + segundaInicialApellido;
    const existeConSegunda = usuariosExistentes.some(u => u.username === usernameConSegunda);
    if (!existeConSegunda) return usernameConSegunda;
  }

  return usernameBase;
}

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [busquedaCI, setBusquedaCI] = useState('');
  
  const [modoEditar, setModoEditar] = useState(false);
  const [usuarioEditarId, setUsuarioEditarId] = useState(null);
  const [cargando, setCargando] = useState(false);

  const toastMostrado = useRef(false);

  // === CONFIGURACIÓN DE REACT HOOK FORM ===
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(usuarioSchema),
    defaultValues: defaultValuesForm,
    mode: 'onChange' // Valida mientras el usuario escribe
  });

  // Observamos los nombres y apellidos para generar el username en tiempo real
  const watchNombres = watch('nombres');
  const watchApellidos = watch('apellidos');

  useEffect(() => {
    const fetchInicial = async () => {
      await cargarUsuarios();
      if (!toastMostrado.current) {
        toast.success('Usuarios cargados correctamente');
        toastMostrado.current = true;
      }
    };
    fetchInicial();
  }, []);

  // Efecto para autogenerar el username
  useEffect(() => {
    if (!modoEditar) {
      const nuevoUsername = generarUsername(watchNombres, watchApellidos, usuarios);
      setValue('username', nuevoUsername, { shouldValidate: true });
    }
  }, [watchNombres, watchApellidos, usuarios, modoEditar, setValue]);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  // onSubmit ahora recibe 'data' ya validada y perfecta desde Zod
  const onSubmitForm = async (data) => {
    setCargando(true);
    try {
      if (modoEditar) {
        await actualizarUsuario(usuarioEditarId, data);
        toast.success('Usuario actualizado correctamente');
      } else {
        await crearUsuario(data);
        toast.success('Usuario creado correctamente');
      }
      handleResetForm();
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar usuario');
    } finally {
      setCargando(false);
    }
  };

  const handleEditar = (usuario) => {
    setModoEditar(true);
    setUsuarioEditarId(usuario.id);
    // Llenamos el formulario con los datos usando reset() de RHF
    reset({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      username: usuario.username,
      ci: usuario.ci,
      correo: usuario.correo,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      rol: usuario.rol,
    });
  };

  const handleToggleActivo = async (id, estadoActual) => {
    setCargando(true);
    try {
      if (estadoActual) {
        await desactivarUsuario(id);
        toast.info('Usuario desactivado');
      } else {
        await activarUsuario(id);
        toast.success('Usuario activado');
      }
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      toast.error('Error al cambiar estado del usuario');
    } finally {
      setCargando(false);
    }
  };

  const handleResetForm = () => {
    setModoEditar(false);
    setUsuarioEditarId(null);
    reset(defaultValuesForm); // Limpia todos los errores y valores
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    (u.nombres.toLowerCase().includes(busquedaNombre.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(busquedaNombre.toLowerCase())) &&
    u.ci.toLowerCase().includes(busquedaCI.toLowerCase())
  );

  const ROLES_LABELS = {
    docente: 'Docente',
    admin: 'Administrador',
    director: 'Director',
    tthh: 'Talento Humano',
    dti: 'DTIC',
  };

  const KpiCard = ({ title, value, icon, colorParams }) => (
    <Paper 
      elevation={3} 
      sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, background: colorParams.bg, color: colorParams.text, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}
    >
      <Box sx={{ p: 1.5, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</Typography>
      </Box>
    </Paper>
  );

  const renderRoleChip = (rol) => {
    const roleColors = {
      docente: { bg: '#e0f2fe', text: '#075985' },
      admin: { bg: '#fee2e2', text: '#991b1b' },
      director: { bg: '#f3e8ff', text: '#6b21a8' },
      tthh: { bg: '#dcfce7', text: '#166534' },
      dti: { bg: '#cffafe', text: '#155e75' }
    };
    const colors = roleColors[rol] || { bg: '#f1f5f9', text: '#475569' };
    return <Chip label={ROLES_LABELS[rol] || rol} size="small" sx={{ bgcolor: colors.bg, color: colors.text, fontWeight: 'bold' }} />;
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: 'var(--color-bg)' }}>
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
      <LoadingModal visible={cargando} />

      <Container maxWidth="xl">
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--color-text)' }}>
            Gestión de Usuarios
          </Typography>
          <Typography variant="h6" align="center" sx={{ color: 'var(--color-text-secondary)', mb: 4 }}>
            Administración del sistema de permisos
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <KpiCard title="Total Usuarios" value={usuarios.length} icon={<PeopleIcon fontSize="large" />} colorParams={{ bg: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', text: 'white' }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <KpiCard title="Activos" value={usuarios.filter(u => u.estado).length} icon={<CheckCircleOutline fontSize="large" />} colorParams={{ bg: 'linear-gradient(135deg, #10b981, #059669)', text: 'white' }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <KpiCard title="Inactivos" value={usuarios.filter(u => !u.estado).length} icon={<CancelOutlined fontSize="large" />} colorParams={{ bg: 'linear-gradient(135deg, #ef4444, #dc2626)', text: 'white' }} />
            </Grid>
          </Grid>
        </Box>

        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3, backgroundColor: 'var(--card-bg)' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth variant="outlined" placeholder="Buscar por nombre completo..." value={busquedaNombre} onChange={(e) => setBusquedaNombre(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth variant="outlined" placeholder="Buscar por CI..." value={busquedaCI} onChange={(e) => setBusquedaCI(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              {(busquedaNombre || busquedaCI) && (
                <Chip label={`Mostrando ${usuariosFiltrados.length} de ${usuarios.length}`} color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
              )}
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, mb: 5, borderRadius: 3, backgroundColor: 'var(--card-bg)' }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
            {modoEditar ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </Typography>
          <Typography variant="body2" align="center" sx={{ color: 'var(--color-text-secondary)', mb: 4 }}>
            Complete los datos correspondientes en el formulario
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit(onSubmitForm)}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'var(--color-text)' }}>Información Personal</Typography>
                <Stack spacing={2}>
                  <Controller
                    name="nombres"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nombres completos"
                        fullWidth
                        error={!!errors.nombres}
                        helperText={errors.nombres?.message}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
                      />
                    )}
                  />
                  <Controller
                    name="apellidos"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Apellidos completos"
                        fullWidth
                        error={!!errors.apellidos}
                        helperText={errors.apellidos?.message}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'var(--color-text)' }}>Datos de Acceso</Typography>
                <Stack spacing={2}>
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Username (Generado)"
                        readOnly
                        fullWidth
                        sx={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 1 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>, readOnly: true }}
                        helperText="Generado automáticamente basado en nombres y apellidos"
                      />
                    )}
                  />
                  <Controller
                    name="ci"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Cédula de Identidad"
                        fullWidth
                        error={!!errors.ci}
                        helperText={errors.ci?.message}
                        InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon /></InputAdornment> }}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'var(--color-text)' }}>Información de Contacto</Typography>
                <Stack spacing={2}>
                  <Controller
                    name="correo"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="text"
                        label="Correo electrónico"
                        fullWidth
                        error={!!errors.correo}
                        helperText={errors.correo?.message}
                        InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
                      />
                    )}
                  />
                  <Controller
                    name="telefono"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Número de teléfono"
                        fullWidth
                        error={!!errors.telefono}
                        helperText={errors.telefono?.message}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'var(--color-text)' }}>Rol y Extras</Typography>
                <Stack spacing={2}>
                  <Controller
                    name="direccion"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Dirección completa"
                        fullWidth
                        error={!!errors.direccion}
                        helperText={errors.direccion?.message}
                        InputProps={{ startAdornment: <InputAdornment position="start"><LocationIcon /></InputAdornment> }}
                      />
                    )}
                  />
                  <Controller
                    name="rol"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Rol del Sistema"
                        fullWidth
                        error={!!errors.rol}
                        helperText={errors.rol?.message}
                        InputProps={{ startAdornment: <InputAdornment position="start"><RoleIcon /></InputAdornment> }}
                      >
                        <MenuItem value="docente">Docente</MenuItem>
                        <MenuItem value="admin">Administrador</MenuItem>
                        <MenuItem value="director">Director</MenuItem>
                        <MenuItem value="tthh">Talento Humano</MenuItem>
                        <MenuItem value="dti">DTIC</MenuItem>
                      </TextField>
                    )}
                  />
                </Stack>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid var(--color-border)', display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={modoEditar ? <SaveIcon /> : <AddIcon />}
                sx={{ background: 'linear-gradient(135deg, var(--btn-crear-bg, #0ea5e9), #0284c7)', fontWeight: 'bold', px: 4, textTransform: 'none' }}
              >
                {modoEditar ? 'Actualizar Usuario' : 'Crear Usuario'}
              </Button>
              {modoEditar && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleResetForm}
                  startIcon={<CloseIcon />}
                  sx={{ color: 'var(--color-text)', borderColor: 'var(--color-border)', fontWeight: 'bold', textTransform: 'none' }}
                >
                  Cancelar
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Tabla de usuarios */}
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', backgroundColor: 'var(--card-bg)' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid var(--color-border)' }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
              Lista de Usuarios
            </Typography>
          </Box>

          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                  <TableCell sx={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', fontWeight: 'bold' }}>Contacto</TableCell>
                  <TableCell sx={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', fontWeight: 'bold' }}>Acceso</TableCell>
                  <TableCell sx={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', fontWeight: 'bold' }}>Rol</TableCell>
                  <TableCell sx={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell align="center" sx={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((u) => (
                    <TableRow 
                      key={u.id} 
                      hover 
                      sx={{ 
                        opacity: u.estado ? 1 : 0.6,
                        backgroundColor: !u.estado ? 'var(--color-surface-secondary, rgba(0,0,0,0.03))' : 'inherit',
                        '&:hover': { backgroundColor: 'var(--color-surface-hover, rgba(0,0,0,0.05))' }
                      }}
                    >
                      <TableCell><Chip label={`#${u.id}`} size="small" sx={{ bgcolor: '#e0f2fe', color: '#075985', fontWeight: 'bold' }} /></TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'var(--color-text)' }}>{u.nombres} {u.apellidos}</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>CI: {u.ci}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'var(--color-text)' }}><EmailIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }}/>{u.correo}</Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}><PhoneIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }}/>{u.telefono}</Typography>
                      </TableCell>
                      <TableCell><Chip label={`@${u.username}`} size="small" variant="outlined" sx={{ fontWeight: 'bold', color: 'var(--color-text)' }} /></TableCell>
                      <TableCell>{renderRoleChip(u.rol)}</TableCell>
                      <TableCell>
                        <Chip label={u.estado ? 'Activo' : 'Inactivo'} color={u.estado ? 'success' : 'error'} size="small" sx={{ fontWeight: 'bold' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Editar">
                            <IconButton color="warning" onClick={() => handleEditar(u)}><EditIcon /></IconButton>
                          </Tooltip>
                          <Tooltip title={u.estado ? 'Desactivar' : 'Activar'}>
                            <IconButton color={u.estado ? 'error' : 'success'} onClick={() => handleToggleActivo(u.id, u.estado)}>
                              {u.estado ? <ToggleOffIcon /> : <ToggleOnIcon />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
                        <SearchIcon sx={{ fontSize: 60, mb: 2, color: 'var(--color-text-secondary)' }} />
                        <Typography variant="h6" color="var(--color-text-secondary)">No se encontraron usuarios</Typography>
                        <Typography variant="body2" color="var(--color-text-tertiary)">Intenta modificar los filtros de búsqueda</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
}

export default GestionUsuarios;