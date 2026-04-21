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

// Importaciones locales
import {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  activarUsuario,
  desactivarUsuario,
} from '../../services/api';
import LoadingModal from '../../components/LoadingModal';

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
  const [form, setForm] = useState({
    username: '',
    ci: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    direccion: '',
    rol: 'docente',
  });
  const [modoEditar, setModoEditar] = useState(false);
  const [usuarioEditarId, setUsuarioEditarId] = useState(null);
  const [cargando, setCargando] = useState(false);

  const toastMostrado = useRef(false);

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

  useEffect(() => {
    if (!modoEditar) {
      const nuevoUsername = generarUsername(form.nombres, form.apellidos, usuarios);
      setForm(prev => ({ ...prev, username: nuevoUsername }));
    }
  }, [form.nombres, form.apellidos, usuarios, modoEditar]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      if (modoEditar) {
        await actualizarUsuario(usuarioEditarId, { ...form });
        toast.success('Usuario actualizado correctamente');
      } else {
        await crearUsuario(form);
        toast.success('Usuario creado correctamente');
      }
      resetForm();
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
    setForm({
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

  const resetForm = () => {
    setModoEditar(false);
    setUsuarioEditarId(null);
    setForm({
      username: '',
      ci: '',
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      direccion: '',
      rol: 'docente',
    });
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

  // Helper para crear KpiCards
  const KpiCard = ({ title, value, icon, colorParams }) => (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        borderRadius: 3, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        background: colorParams.bg,
        color: colorParams.text,
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-5px)' }
      }}
    >
      <Box sx={{ p: 1.5, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Typography>
      </Box>
    </Paper>
  );

  // Helper para colores de roles
  const renderRoleChip = (rol) => {
    const roleColors = {
      docente: { bg: '#e0f2fe', text: '#075985' },
      admin: { bg: '#fee2e2', text: '#991b1b' },
      director: { bg: '#f3e8ff', text: '#6b21a8' },
      tthh: { bg: '#dcfce7', text: '#166534' },
      dti: { bg: '#cffafe', text: '#155e75' }
    };
    const colors = roleColors[rol] || { bg: '#f1f5f9', text: '#475569' };
    
    return (
      <Chip 
        label={ROLES_LABELS[rol] || rol} 
        size="small" 
        sx={{ bgcolor: colors.bg, color: colors.text, fontWeight: 'bold' }} 
      />
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: 'var(--color-bg)' }}>
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
      <LoadingModal visible={cargando} />

      <Container maxWidth="xl">
        
        {/* Header con estadísticas */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--color-text)' }}>
            Gestión de Usuarios
          </Typography>
          <Typography variant="h6" align="center" sx={{ color: 'var(--color-text-secondary)', mb: 4 }}>
            Administración del sistema de permisos
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <KpiCard 
                title="Total Usuarios" 
                value={usuarios.length} 
                icon={<PeopleIcon fontSize="large" />} 
                colorParams={{ bg: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', text: 'white' }} 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <KpiCard 
                title="Activos" 
                value={usuarios.filter(u => u.estado).length} 
                icon={<CheckCircleOutline fontSize="large" />} 
                colorParams={{ bg: 'linear-gradient(135deg, #10b981, #059669)', text: 'white' }} 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <KpiCard 
                title="Inactivos" 
                value={usuarios.filter(u => !u.estado).length} 
                icon={<CancelOutlined fontSize="large" />} 
                colorParams={{ bg: 'linear-gradient(135deg, #ef4444, #dc2626)', text: 'white' }} 
              />
            </Grid>
          </Grid>
        </Box>

        {/* Filtros */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3, backgroundColor: 'var(--card-bg)' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar por nombre completo..."
                value={busquedaNombre}
                onChange={(e) => setBusquedaNombre(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar por CI..."
                value={busquedaCI}
                onChange={(e) => setBusquedaCI(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><BadgeIcon /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              {(busquedaNombre || busquedaCI) && (
                <Chip 
                  label={`Mostrando ${usuariosFiltrados.length} de ${usuarios.length}`}
                  color="primary" 
                  variant="outlined"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Formulario */}
        <Paper elevation={3} sx={{ p: 4, mb: 5, borderRadius: 3, backgroundColor: 'var(--card-bg)' }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
            {modoEditar ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </Typography>
          <Typography variant="body2" align="center" sx={{ color: 'var(--color-text-secondary)', mb: 4 }}>
            Complete los datos correspondientes en el formulario
          </Typography>
          
          <Box component="form" onSubmit={handleGuardar}>
            <Grid container spacing={4}>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'var(--color-text)' }}>Información Personal</Typography>
                <Stack spacing={2}>
                  <TextField
                    name="nombres"
                    label="Nombres completos"
                    value={form.nombres}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
                  />
                  <TextField
                    name="apellidos"
                    label="Apellidos completos"
                    value={form.apellidos}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'var(--color-text)' }}>Datos de Acceso</Typography>
                <Stack spacing={2}>
                  <TextField
                    name="username"
                    label="Username (Generado)"
                    value={form.username}
                    readOnly
                    fullWidth
                    sx={{ backgroundColor: 'var(--color-bg-secondary)', borderRadius: 1 }}
                    InputProps={{ 
                      startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>,
                      readOnly: true
                    }}
                    helperText="Generado automáticamente basado en nombres y apellidos"
                  />
                  <TextField
                    name="ci"
                    label="Cédula de Identidad"
                    value={form.ci}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon /></InputAdornment> }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'var(--color-text)' }}>Información de Contacto</Typography>
                <Stack spacing={2}>
                  <TextField
                    type="email"
                    name="correo"
                    label="Correo electrónico"
                    value={form.correo}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
                  />
                  <TextField
                    name="telefono"
                    label="Número de teléfono"
                    value={form.telefono}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'var(--color-text)' }}>Rol y Extras</Typography>
                <Stack spacing={2}>
                  <TextField
                    name="direccion"
                    label="Dirección completa"
                    value={form.direccion}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><LocationIcon /></InputAdornment> }}
                  />
                  <TextField
                    select
                    name="rol"
                    label="Rol del Sistema"
                    value={form.rol}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{ startAdornment: <InputAdornment position="start"><RoleIcon /></InputAdornment> }}
                  >
                    <MenuItem value="docente">Docente</MenuItem>
                    <MenuItem value="admin">Administrador</MenuItem>
                    <MenuItem value="director">Director</MenuItem>
                    <MenuItem value="tthh">Talento Humano</MenuItem>
                    <MenuItem value="dti">DTIC</MenuItem>
                  </TextField>
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
                  onClick={resetForm}
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
                      <TableCell>
                        <Chip label={`#${u.id}`} size="small" sx={{ bgcolor: '#e0f2fe', color: '#075985', fontWeight: 'bold' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'var(--color-text)' }}>{u.nombres} {u.apellidos}</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>CI: {u.ci}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'var(--color-text)' }}><EmailIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }}/>{u.correo}</Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}><PhoneIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }}/>{u.telefono}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={`@${u.username}`} size="small" variant="outlined" sx={{ fontWeight: 'bold', color: 'var(--color-text)' }} />
                      </TableCell>
                      <TableCell>
                        {renderRoleChip(u.rol)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={u.estado ? 'Activo' : 'Inactivo'} 
                          color={u.estado ? 'success' : 'error'} 
                          size="small" 
                          sx={{ fontWeight: 'bold' }} 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Editar">
                            <IconButton color="warning" onClick={() => handleEditar(u)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={u.estado ? 'Desactivar' : 'Activar'}>
                            <IconButton 
                              color={u.estado ? 'error' : 'success'} 
                              onClick={() => handleToggleActivo(u.id, u.estado)}
                            >
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