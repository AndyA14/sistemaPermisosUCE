import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';

import { obtenerMisPermisos } from '../../services/api';
import CartaSeguimientoPermiso from '../PlantillasCartas/PlantillasVistasC/CartaSeguimientoPermiso';
import LoadingModal from '../LoadingModal';

// Mapas de equivalencia para estados y tipos
const estadosFiltroMap = {
  pendiente: ['pendiente'],
  aprobado: ['aprobado', 'autorizado'],
  rechazado: ['rechazado', 'denegado'],
  enrevision: ['en_revison', 'en_revision']
};

const tiposFiltroMap = {
  falta: ['falta'],
  atraso: ['atraso'],
  otros: ['otros', 'permiso', 'licencia'],
  'sin timbrar': ['sin timbrar'],
};

function MisSolicitudes() {
  const [permisos, setPermisos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [permisoDetalle, setPermisoDetalle] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const toastMostradoRef = useRef(false);

  const cargarPermisos = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerMisPermisos();
      setPermisos(data);
      if (!toastMostradoRef.current) {
        toast.success('Permisos cargados correctamente');
        toastMostradoRef.current = true;
      }
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      toast.error('Error al cargar permisos. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPermisos();
  }, [cargarPermisos]);

  // Función para normalizar texto (minúsculas y trim)
  const normalizar = (str) => str?.toLowerCase().trim() || '';

  // Memoizamos el filtrado para evitar cálculos innecesarios
  const permisosFiltrados = React.useMemo(() => {
    return permisos.filter((p) => {
      const estadoPermiso = normalizar(p.estado_general);
      const tipoPermiso = normalizar(p.tipo?.nombre);

      // Filtrar estado
      if (filtroEstado) {
        const estadosAceptados = estadosFiltroMap[filtroEstado] || [filtroEstado];
        if (!estadosAceptados.some(e => estadoPermiso.includes(e))) return false;
      }

      // Filtrar tipo
      if (filtroTipo) {
        const tiposAceptados = tiposFiltroMap[filtroTipo] || [filtroTipo];
        if (!tiposAceptados.some(t => tipoPermiso.includes(t))) return false;
      }

      return true;
    });
  }, [permisos, filtroEstado, filtroTipo]);

  const abrirDetalle = (permiso) => setPermisoDetalle(permiso);
  const cerrarDetalle = () => setPermisoDetalle(null);

  // Helper para renderizar estados con Chips nativos de MUI
  const renderEstadoChip = (estado) => {
    const estadoNorm = normalizar(estado);
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

      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          component="h2" 
          align="center" 
          gutterBottom 
          sx={{ fontWeight: 'bold', color: 'var(--color-text)', mb: 4 }}
        >
          📋 Mis Solicitudes de Permisos
        </Typography>

        {/* Sección de Filtros */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3, backgroundColor: 'var(--card-bg)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="filtro-estado-label">Estado</InputLabel>
              <Select
                labelId="filtro-estado-label"
                value={filtroEstado}
                label="Estado"
                onChange={e => setFiltroEstado(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value=""><em>🔍 Todos los estados</em></MenuItem>
                <MenuItem value="pendiente">⏳ Pendiente</MenuItem>
                <MenuItem value="aprobado">✅ Aprobado</MenuItem>
                <MenuItem value="rechazado">❌ Rechazado</MenuItem>
                <MenuItem value="enrevision">🔄 En revisión</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="filtro-tipo-label">Tipo</InputLabel>
              <Select
                labelId="filtro-tipo-label"
                value={filtroTipo}
                label="Tipo"
                onChange={e => setFiltroTipo(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value=""><em>📂 Todos los tipos</em></MenuItem>
                <MenuItem value="falta">🚫 Falta</MenuItem>
                <MenuItem value="atraso">⏰ Atraso</MenuItem>
                <MenuItem value="sin timbrar">🕐 Sin Timbrar</MenuItem>
                <MenuItem value="otros">📄 Otros</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Tabla de Solicitudes */}
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflowX: 'auto', backgroundColor: 'var(--card-bg)' }}>
          <Table sx={{ minWidth: 650 }} aria-label="tabla de solicitudes">
            <TableHead sx={{ background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Documentos</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {permisosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                    📋 No hay solicitudes que coincidan con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                permisosFiltrados.map((p) => (
                  <TableRow 
                    key={p.id}
                    sx={{ '&:hover': { backgroundColor: 'var(--color-surface-hover, rgba(0,0,0,0.02))' }, transition: 'background-color 0.2s' }}
                  >
                    <TableCell sx={{ color: 'var(--color-text)' }}>{p.id}</TableCell>
                    <TableCell sx={{ color: 'var(--color-text)' }}>
                      {p.tipo?.nombre} {p.tipo?.sub_tipo ? `(${p.tipo.sub_tipo})` : ''}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--color-text)' }}>
                      {p.fecha_inicio === p.fecha_fin ? p.fecha_inicio : `${p.fecha_inicio} - ${p.fecha_fin}`}
                    </TableCell>
                    <TableCell>
                      {renderEstadoChip(p.estado_general)}
                    </TableCell>
                    <TableCell>
                      {p.documentos?.length > 0 ? (
                        <Stack spacing={1}>
                          {p.documentos.map(doc => {
                            const nombreArchivo = doc.url.split('/').pop();
                            return (
                              <Button
                                key={doc.id}
                                variant="text"
                                size="small"
                                startIcon={<DescriptionIcon />}
                                onClick={() => navigate(`/uploads/documentos/${nombreArchivo}`)}
                                sx={{ textTransform: 'none', justifyContent: 'flex-start', color: 'var(--color-link)' }}
                              >
                                {doc.tipo?.replace(/"/g, '') || 'Evidencia'}
                              </Button>
                            );
                          })}
                        </Stack>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'text.disabled' }}>Sin documentos</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver Detalles">
                        <Button 
                          variant="contained" 
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => abrirDetalle(p)}
                          sx={{
                            background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)',
                            boxShadow: '0 2px 8px rgba(52, 152, 219, 0.2)',
                            borderRadius: 2,
                            textTransform: 'none'
                          }}
                        >
                          Detalles
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
                '& *': {                // Forzar la fuente
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

export default MisSolicitudes;