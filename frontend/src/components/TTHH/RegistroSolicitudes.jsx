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
  DialogTitle,
  Autocomplete,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  DateRange as DateRangeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importaciones locales
import {
  buscarDocentesPorNombre,
  descargarInformeMensual,
  descargarInformeFiltrado,
  obtenerPermisosFiltrados,
} from '../../services/api';
import CartaSeguimientoPermiso from '../PlantillasCartas/PlantillasVistasC/CartaSeguimientoPermiso';
import LoadingModal from '../../components/LoadingModal.jsx';

function RegistroSolicitudes() {
  const [filtro, setFiltro] = useState({ mes: '', anio: '', desde: '', hasta: '', nombre: '' });
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [permisosCargados, setPermisosCargados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [permisoDetalle, setPermisoDetalle] = useState(null);

  // Ref para evitar toasts duplicados
  const toastId = useRef(null);

  const abrirDetalle = (permiso) => setPermisoDetalle(permiso);
  const cerrarDetalle = () => setPermisoDetalle(null);

  const filtrarPermisos = () => {
    let filtrados = permisosCargados;

    if (filtro.nombre) {
      const nombreLower = filtro.nombre.toLowerCase();
      filtrados = filtrados.filter(p =>
        `${p?.usuario?.nombres || ''} ${p?.usuario?.apellidos || ''}`.toLowerCase().includes(nombreLower)
      );
    }

    if (filtro.mes && filtro.anio) {
      const mesStr = `${filtro.anio}-${filtro.mes.padStart(2, '0')}`;
      filtrados = filtrados.filter(p => p?.fecha_inicio?.startsWith(mesStr));
    }

    if (filtro.desde && filtro.hasta) {
      const desdeDate = new Date(filtro.desde);
      const hastaDate = new Date(filtro.hasta);
      filtrados = filtrados.filter(p => {
        if (!p?.fecha_inicio) return false;
        const fecha = new Date(p.fecha_inicio);
        return fecha >= desdeDate && fecha <= hastaDate;
      });
    }

    setPermisos(filtrados);
  };

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setCargando(true);
      try {
        const todosPermisos = await obtenerPermisosFiltrados({});
        setPermisosCargados(todosPermisos);
        setPermisos(todosPermisos);
        if (!toast.isActive(toastId.current)) {
          toastId.current = toast.success('Permisos cargados correctamente');
        }
      } catch (err) {
        if (!toast.isActive(toastId.current)) {
          toastId.current = toast.error(err.message || 'Error al cargar datos');
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
    if (!valor) return setFiltro(prev => ({ ...prev, mes: '', anio: '' }));
    const [anio, mes] = valor.split('-');
    setFiltro(prev => ({ ...prev, mes, anio }));
  };

  const manejarFechaDesde = (e) => setFiltro(prev => ({ ...prev, desde: e.target.value }));
  const manejarFechaHasta = (e) => setFiltro(prev => ({ ...prev, hasta: e.target.value }));

  const descargarMensual = async () => {
    if (!filtro.mes || !filtro.anio) {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.warn('Debe seleccionar mes y año');
      }
      return;
    }
    setCargando(true);
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
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.success('Informe mensual descargado');
      }
    } catch (err) {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.error(err.message || 'Error al descargar informe mensual');
      }
    } finally {
      setCargando(false);
    }
  };

  const descargarPorRango = async () => {
    if (!filtro.desde || !filtro.hasta) {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.warn('Debe seleccionar rango de fechas');
      }
      return;
    }
    setCargando(true);
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
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.success('Informe por rango descargado');
      }
    } catch (err) {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.error(err.message || 'Error al descargar informe por rango');
      }
    } finally {
      setCargando(false);
    }
  };

  const renderEstadoChip = (estado) => {
    const estadoNorm = estado?.toLowerCase().trim() || '';
    if (estadoNorm.includes('aprobado') || estadoNorm.includes('autorizado')) {
      return <Chip label={estado} color="success" size="small" sx={{ fontWeight: 'bold' }} />;
    }
    if (estadoNorm.includes('rechazado') || estadoNorm.includes('denegado')) {
      return <Chip label={estado} color="error" size="small" sx={{ fontWeight: 'bold' }} />;
    }
    if (estadoNorm.includes('pendiente')) {
      return <Chip label={estado} color="warning" size="small" sx={{ fontWeight: 'bold' }} />;
    }
    if (estadoNorm.includes('revision')) {
      return <Chip label={estado} color="info" size="small" sx={{ fontWeight: 'bold' }} />;
    }
    return <Chip label={estado || 'Desconocido'} size="small" sx={{ fontWeight: 'bold', bgcolor: 'grey.500', color: 'white' }} />;
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: 'var(--color-bg)' }}>
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
      {cargando && <LoadingModal visible={true} />}

      <Container maxWidth="xl">
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          sx={{ fontWeight: 'bold', color: 'var(--color-text)', mb: 4 }}
        >
          Registro de Solicitudes
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3, backgroundColor: 'var(--card-bg)' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--color-text)', mb: 3 }}>
            Filtros y generación de informes
          </Typography>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Autocomplete
                freeSolo
                options={listaUsuarios}
                getOptionLabel={(option) => typeof option === 'string' ? option : `${option?.nombres || ''} ${option?.apellidos || ''}`.trim()}
                onInputChange={(event, newInputValue) => {
                  setNombreUsuario(newInputValue);
                  if (newInputValue === '') setFiltro(prev => ({ ...prev, nombre: '' }));
                }}
                onChange={(event, newValue) => {
                  if (newValue && typeof newValue === 'object') {
                    const nombreCompleto = `${newValue?.nombres || ''} ${newValue?.apellidos || ''}`.trim();
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
                sx={{ py: 1.5, background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)' }}
              >
                Descargar Informe Mensual
              </Button>
            </Grid>

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
                sx={{ py: 1.5, background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)' }}
              >
                Descargar Informe por Rango
              </Button>
            </Grid>
          </Grid>
        </Paper>

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
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'var(--color-text-secondary)' }}>
                      No hay permisos para mostrar con estos filtros.
                    </TableCell>
                  </TableRow>
                ) : (
                  permisos.map(p => (
                    <TableRow key={p.id} hover sx={{ '&:hover': { backgroundColor: 'var(--color-surface-hover, rgba(0,0,0,0.02))' } }}>
                      <TableCell sx={{ color: 'var(--color-text)' }}>{p?.usuario?.nombres || 'Usuario'} {p?.usuario?.apellidos || 'Desconocido'}</TableCell>
                      <TableCell sx={{ color: 'var(--color-text)' }}>{p?.tipo?.nombre || 'Desconocido'}</TableCell>
                      <TableCell sx={{ color: 'var(--color-text)' }}>{p?.tipo?.sub_tipo || '-'}</TableCell>
                      <TableCell sx={{ color: 'var(--color-text)' }}>{p?.fecha_inicio || '-'}</TableCell>
                      <TableCell sx={{ color: 'var(--color-text)' }}>{p?.fecha_fin || '-'}</TableCell>
                      <TableCell>
                        {renderEstadoChip(p?.estado_general)}
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

        {/* MODAL MEJORADO TIPO HOJA A4 */}
        <Dialog 
          open={!!permisoDetalle} 
          onClose={cerrarDetalle}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { 
              borderRadius: 2, 
              backgroundColor: '#e2e8f0', // Fondo gris oscuro para resaltar la hoja blanca
              overflow: 'hidden'
            }
          }}
        >
          {/* Header del Modal */}
          <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#334155', color: '#f8fafc' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Vista Previa del Documento
            </Typography>
            <IconButton
              aria-label="close"
              onClick={cerrarDetalle}
              sx={{ color: '#94a3b8', '&:hover': { color: '#f8fafc' } }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          {/* Contenido del Modal (Fondo oscuro con Hoja A4 blanca en el centro) */}
          <DialogContent sx={{ p: { xs: 2, sm: 4 }, backgroundColor: '#cbd5e1', display: 'flex', justifyContent: 'center' }}>
            <Paper
              elevation={6}
              sx={{
                width: '100%',
                maxWidth: '210mm',      // Ancho estándar A4
                minHeight: '297mm',     // Alto estándar A4
                backgroundColor: '#ffffff', // Hoja blanca pura
                padding: '20mm',        // Márgenes del documento
                boxSizing: 'border-box',
                fontFamily: '"Times New Roman", Times, serif', // Tipografía formal
                color: '#1e2a3a',       // Texto oscuro formal
                '& *': {                // Forzar la fuente en todos los elementos hijos
                  fontFamily: '"Times New Roman", Times, serif !important',
                }
              }}
            >
              {permisoDetalle && <CartaSeguimientoPermiso permiso={permisoDetalle} />}
            </Paper>
          </DialogContent>
        </Dialog>

      </Container>
    </Box>
  );
}

export default RegistroSolicitudes;