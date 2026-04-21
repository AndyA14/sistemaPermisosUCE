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
  Dialog,
  DialogContent,
  Autocomplete,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  DateRange as DateRangeIcon,
  CheckCircleOutline,
  HourglassEmpty,
  CancelOutlined,
  Group as GroupIcon,
  PersonOutline as PersonActiveIcon
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importaciones locales
import {
  buscarDocentesPorNombre,
  descargarInformeMensual,
  descargarInformeFiltrado,
  obtenerResumenGeneral,
  obtenerUltimosPermisos,
} from '../../services/api';
import CartaSeguimientoPermiso from '../PlantillasCartas/PlantillasVistasC/CartaSeguimientoPermiso';
import LoadingModal from '../../components/LoadingModal';

function ReportesDTIC() {
  // --- Estados principales ---
  const [datosResumen, setDatosResumen] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    permisosPendientes: 0,
    permisosAutorizados: 0,
    permisosDenegados: 0,
  });

  const [filtro, setFiltro] = useState({
    mes: '',
    anio: '',
    desde: '',
    hasta: '',
    nombre: '',
  });

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [listaUsuarios, setListaUsuarios] = useState([]);

  const [permisos, setPermisos] = useState([]);
  const [permisosCargados, setPermisosCargados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [permisoDetalle, setPermisoDetalle] = useState(null);

  const toastId = useRef(null);

  const abrirDetalle = (permiso) => setPermisoDetalle(permiso);
  const cerrarDetalle = () => setPermisoDetalle(null);

  // --- Filtro por nombre, fecha o mes ---
  const filtrarPermisos = () => {
    let filtrados = permisosCargados;

    if (filtro.nombre) {
      const nombreLower = filtro.nombre.toLowerCase();
      filtrados = filtrados.filter(p =>
        `${p.usuario.nombres} ${p.usuario.apellidos}`.toLowerCase().includes(nombreLower)
      );
    }

    if (filtro.mes && filtro.anio) {
      const mesStr = `${filtro.anio}-${filtro.mes.padStart(2, '0')}`;
      filtrados = filtrados.filter(p => p.fecha_inicio.startsWith(mesStr));
    }

    if (filtro.desde && filtro.hasta) {
      const desdeDate = new Date(filtro.desde);
      const hastaDate = new Date(filtro.hasta);
      filtrados = filtrados.filter(p => {
        const fecha = new Date(p.fecha_inicio);
        return fecha >= desdeDate && fecha <= hastaDate;
      });
    }

    setPermisos(filtrados);
  };

  // --- Carga inicial ---
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setCargando(true);
      try {
        const [resumen, todosPermisos] = await Promise.all([
          obtenerResumenGeneral(),
          obtenerUltimosPermisos()
        ]);
        
        setDatosResumen(resumen);
        setPermisosCargados(todosPermisos);
        setPermisos(todosPermisos);

        if (!toast.isActive(toastId.current)) {
          toastId.current = toast.success('Datos cargados correctamente');
        }
      } catch (err) {
        if (!toast.isActive(toastId.current)) {
          toastId.current = toast.error('Error al cargar datos del resumen');
        }
      } finally {
        setCargando(false);
      }
    };
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    filtrarPermisos();
  }, [filtro, permisosCargados]);

  // Autocomplete Logic
  useEffect(() => {
    if (nombreUsuario.trim().length < 3) {
      setListaUsuarios([]);
      return;
    }

    const handler = setTimeout(() => {
      const fetchUsuarios = async () => {
        try {
          const resultados = await buscarDocentesPorNombre(nombreUsuario.trim());
          setListaUsuarios(resultados);
        } catch {
          setListaUsuarios([]);
        }
      };
      fetchUsuarios();
    }, 500);

    return () => clearTimeout(handler);
  }, [nombreUsuario]);

  const manejarMesAnio = (e) => {
    const valor = e.target.value;
    if (!valor) {
      setFiltro(prev => ({ ...prev, mes: '', anio: '' }));
      return;
    }
    const [anio, mes] = valor.split('-');
    setFiltro(prev => ({ ...prev, mes, anio }));
  };

  const manejarFechaDesde = (e) => setFiltro(prev => ({ ...prev, desde: e.target.value }));
  const manejarFechaHasta = (e) => setFiltro(prev => ({ ...prev, hasta: e.target.value }));

  // --- Descargar informes ---
  const descargarMensual = async () => {
    if (!filtro.mes || !filtro.anio) {
      toast.warning('Debe seleccionar mes y año');
      return;
    }

    try {
      const blob = await descargarInformeMensual({
        mes: filtro.mes,
        anio: filtro.anio,
        nombre: filtro.nombre,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `informe_${filtro.mes}_${filtro.anio}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Informe mensual descargado');
    } catch (err) {
      toast.error('Error al descargar informe mensual');
    }
  };

  const descargarPorRango = async () => {
    if (!filtro.desde || !filtro.hasta) {
      toast.warning('Debe seleccionar un rango de fechas');
      return;
    }

    try {
      const blob = await descargarInformeFiltrado({
        desde: filtro.desde,
        hasta: filtro.hasta,
        nombre: filtro.nombre,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `informe_filtrado.zip`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Informe por rango descargado');
    } catch (err) {
      toast.error('Error al descargar informe por rango');
    }
  };

  // Helper de renderizado de estados
  const renderEstadoChip = (estado) => {
    const estadoNorm = estado?.toLowerCase().trim() || '';
    if (estadoNorm.includes('aprobado') || estadoNorm.includes('autorizado')) {
      return <Chip label={estado} color="success" size="small" sx={{ fontWeight: 'bold' }} />;
    }
    if (estadoNorm.includes('rechazado') || estadoNorm.includes('denegado')) {
      return <Chip label={estado} color="error" size="small" sx={{ fontWeight: 'bold' }} />;
    }
    if (estadoNorm.includes('pendiente')) {
      return <Chip label={estado} color="warning" size="small" sx={{ fontWeight: 'bold', color: 'white' }} />;
    }
    if (estadoNorm.includes('revision')) {
      return <Chip label={estado} color="info" size="small" sx={{ fontWeight: 'bold' }} />;
    }
    return <Chip label={estado || 'Desconocido'} size="small" sx={{ fontWeight: 'bold', bgcolor: 'grey.500', color: 'white' }} />;
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
        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: 'var(--color-bg)' }}>
      <ToastContainer position="top-right" autoClose={3500} theme="colored" />
      {cargando && <LoadingModal visible={true} />}

      <Container maxWidth="xl">
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--color-text)', mb: 4 }}>
          Dashboard DTIC
        </Typography>

        {/* Sección de KPIs */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <KpiCard 
              title="Pendientes" 
              value={datosResumen.permisosPendientes} 
              icon={<HourglassEmpty fontSize="large" />} 
              colorParams={{ bg: 'linear-gradient(135deg, #f39c12, #e67e22)', text: 'white' }} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <KpiCard 
              title="Autorizados" 
              value={datosResumen.permisosAutorizados} 
              icon={<CheckCircleOutline fontSize="large" />} 
              colorParams={{ bg: 'linear-gradient(135deg, #2ecc71, #27ae60)', text: 'white' }} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <KpiCard 
              title="Denegados" 
              value={datosResumen.permisosDenegados} 
              icon={<CancelOutlined fontSize="large" />} 
              colorParams={{ bg: 'linear-gradient(135deg, #e74c3c, #c0392b)', text: 'white' }} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={2.4}>
            <KpiCard 
              title="Usr. Activos" 
              value={datosResumen.usuariosActivos} 
              icon={<PersonActiveIcon fontSize="large" />} 
              colorParams={{ bg: 'var(--card-bg)', text: 'var(--color-text)' }} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={2.4}>
            <KpiCard 
              title="Total Usr." 
              value={datosResumen.totalUsuarios} 
              icon={<GroupIcon fontSize="large" />} 
              colorParams={{ bg: 'var(--card-bg)', text: 'var(--color-text)' }} 
            />
          </Grid>
        </Grid>

        {/* Sección de Filtros */}
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, backgroundColor: 'var(--card-bg)' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--color-text)', mb: 3 }}>
            Filtros y generación de informes
          </Typography>

          <Grid container spacing={3} alignItems="center">
            {/* Buscador Autocomplete */}
            <Grid item xs={12} md={4}>
              <Autocomplete
                freeSolo
                options={listaUsuarios}
                getOptionLabel={(option) => typeof option === 'string' ? option : `${option.nombres} ${option.apellidos}`}
                onInputChange={(event, newInputValue) => {
                  setNombreUsuario(newInputValue);
                  if (newInputValue === '') setFiltro(prev => ({ ...prev, nombre: '' }));
                }}
                onChange={(event, newValue) => {
                  if (newValue && typeof newValue === 'object') {
                    const nombreCompleto = `${newValue.nombres} ${newValue.apellidos}`;
                    setFiltro(prev => ({ ...prev, nombre: nombreCompleto }));
                  } else {
                    setFiltro(prev => ({ ...prev, nombre: newValue || '' }));
                  }
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Buscar usuario por nombre" 
                    variant="outlined" 
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Selector de Mes/Año */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                type="month"
                label="Filtrar por Mes"
                value={filtro.anio && filtro.mes ? `${filtro.anio}-${filtro.mes.padStart(2, '0')}` : ''}
                onChange={manejarMesAnio}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={5}>
              <Button 
                variant="contained" 
                startIcon={<DownloadIcon />}
                onClick={descargarMensual} 
                disabled={!filtro.mes || !filtro.anio}
                fullWidth
                sx={{ py: 1.5, background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)', textTransform: 'none' }}
              >
                Descargar Informe Mensual
              </Button>
            </Grid>

            {/* Selector de Rango de Fechas */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                type="date"
                label="Desde"
                value={filtro.desde}
                onChange={manejarFechaDesde}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                type="date"
                label="Hasta"
                value={filtro.hasta}
                onChange={manejarFechaHasta}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Button 
                variant="contained" 
                startIcon={<DateRangeIcon />}
                onClick={descargarPorRango} 
                disabled={!filtro.desde || !filtro.hasta}
                fullWidth
                sx={{ py: 1.5, background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)', textTransform: 'none' }}
              >
                Descargar Informe por Rango
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de Permisos */}
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', backgroundColor: 'var(--card-bg)' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid var(--color-border)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
              Últimos permisos
            </Typography>
          </Box>
          
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label="tabla de permisos">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)', color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                  <TableCell sx={{ background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)', color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell sx={{ background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)', color: 'white', fontWeight: 'bold' }}>Subtipo</TableCell>
                  <TableCell sx={{ background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)', color: 'white', fontWeight: 'bold' }}>Fecha inicio</TableCell>
                  <TableCell sx={{ background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)', color: 'white', fontWeight: 'bold' }}>Fecha fin</TableCell>
                  <TableCell sx={{ background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)', color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell align="center" sx={{ background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)', color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permisos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                      No hay permisos para mostrar con estos filtros.
                    </TableCell>
                  </TableRow>
                ) : (
                  permisos.map(p => (
                    <TableRow key={p.id} hover sx={{ '&:hover': { backgroundColor: 'var(--color-surface-hover, rgba(0,0,0,0.02))' } }}>
                      <TableCell sx={{ color: 'var(--color-text)' }}>{p.usuario.nombres} {p.usuario.apellidos}</TableCell>
                      <TableCell sx={{ color: 'var(--color-text)' }}>{p.tipo.nombre}</TableCell>
                      <TableCell sx={{ color: 'var(--color-text)' }}>{p.tipo.sub_tipo || '-'}</TableCell>
                      <TableCell sx={{ color: 'var(--color-text)' }}>{p.fecha_inicio}</TableCell>
                      <TableCell sx={{ color: 'var(--color-text)' }}>{p.fecha_fin}</TableCell>
                      <TableCell>
                        {renderEstadoChip(p.estado_general)}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver Carta">
                          <IconButton 
                            color="primary" 
                            onClick={() => abrirDetalle(p)}
                            sx={{ color: 'var(--color-link)' }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Modal para Detalles de Permiso */}
        <Dialog 
          open={!!permisoDetalle} 
          onClose={cerrarDetalle}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }
          }}
        >
          <DialogContent sx={{ p: 0 }}>
            {permisoDetalle && <CartaSeguimientoPermiso permiso={permisoDetalle} />}
          </DialogContent>
        </Dialog>

      </Container>
    </Box>
  );
}

export default ReportesDTIC;