import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Grid,
  TextField,
  Divider,
  Stack,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Attachment as AttachmentIcon,
  CheckCircleOutline as CheckCircleIcon,
  CancelOutlined as CancelIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Importaciones locales
import { obtenerCorreosUnificadosTTHH, obtenerUrlDocumento, revisarPermisoPorTTHH } from '../../services/api';
import LoadingModal from '../LoadingModal';
import CartaSeguimientoPermiso from '../PlantillasCartas/PlantillasVistasC/CartaSeguimientoPermiso';

function SolicitudesTTHH() {
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoAccion, setProcesandoAccion] = useState(false);
  const [error, setError] = useState(null);

  const [correoSeleccionado, setCorreoSeleccionado] = useState(null);
  const [permisoSeleccionado, setPermisoSeleccionado] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [adjuntoSeleccionado, setAdjuntoSeleccionado] = useState(null);

  const fetchCorreos = async () => {
    setCargando(true);
    try {
      const data = await obtenerCorreosUnificadosTTHH();
      setResultados(data.resultados);
      toast.success('Permisos cargados correctamente', {
        toastId: 'permisos-cargados',
      });
    } catch (e) {
      toast.error(`Error al cargar solicitudes: ${e.message}`, {
        toastId: 'error-cargar-solicitudes',
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchCorreos();
  }, []);

  const manejarRevision = async () => {
    if (!permisoSeleccionado) return;

    setProcesandoAccion(true);

    try {
      await revisarPermisoPorTTHH(permisoSeleccionado.id, { observacion });
      toast.success('Revisión confirmada con éxito.');
      
      setCorreoSeleccionado(null);
      setPermisoSeleccionado(null);
      setAdjuntoSeleccionado(null);
      setObservacion('');
      
      await fetchCorreos(); 
    } catch (e) {
      console.log(`Error al revisar permiso: ${e.message}`);
      toast.error('Error al procesar la revisión.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // ==========================================
  // VISTA DE DETALLE
  // ==========================================
  if (correoSeleccionado) {
    let url = '';
    if (adjuntoSeleccionado) {
      const esEvidencia = !adjuntoSeleccionado.filename.endsWith('_Permiso.pdf');
      const nombreSeguro = (esEvidencia && permisoSeleccionado?.documento) 
        ? permisoSeleccionado.documento 
        : adjuntoSeleccionado.filename;
      url = obtenerUrlDocumento(nombreSeguro);
    }

    const esPDF = url.toLowerCase().endsWith('.pdf');

    return (
      <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: 'var(--color-bg)' }}>
        <Container maxWidth="xl">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              setCorreoSeleccionado(null);
              setPermisoSeleccionado(null);
              setAdjuntoSeleccionado(null);
              setObservacion('');
              setError(null);
            }}
            sx={{ mb: 3, color: 'var(--color-text-secondary)', textTransform: 'none' }}
          >
            Volver a la lista
          </Button>

          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: 'var(--color-header-bg)', color: 'var(--color-header-text)' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Solicitud de permiso de {correoSeleccionado.from}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2"><strong>De:</strong> {correoSeleccionado.from}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2"><strong>Para:</strong> {correoSeleccionado.to}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2"><strong>Fecha:</strong> {new Date(correoSeleccionado.date).toLocaleString()}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={4}>
            
            {/* Columna Izquierda: Detalles */}
            <Grid item xs={12} md={5} lg={4}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: 'var(--card-bg)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  📝 Detalles del Permiso
                </Typography>
                
                <Stack spacing={2} sx={{ mb: 3, flexGrow: 1 }}>
                  <Typography variant="body1" color="var(--color-text)">
                    <strong>Tipo:</strong> {permisoSeleccionado.tipo.nombre} ({permisoSeleccionado.tipo.sub_tipo})
                  </Typography>
                  <Typography variant="body1" color="var(--color-text)">
                    <strong>Fecha inicio:</strong> {permisoSeleccionado.fecha_inicio}
                  </Typography>
                  <Typography variant="body1" color="var(--color-text)">
                    <strong>Fecha fin:</strong> {permisoSeleccionado.fecha_fin || '-'}
                  </Typography>
                  <Box>
                    <Typography variant="body1" color="var(--color-text)"><strong>Descripción:</strong></Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', mt: 0.5, p: 1.5, bgcolor: 'var(--color-bg-secondary)', borderRadius: 1 }}>
                      {permisoSeleccionado.descripcion}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="var(--color-text)">
                    <strong>Estado general:</strong> <em>{permisoSeleccionado.estado_general}</em>
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="body1" color="var(--color-text)" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <strong>Revisado TTHH:</strong> 
                    {permisoSeleccionado.revisado_tthh 
                      ? <CheckCircleIcon color="success" fontSize="small" /> 
                      : <CancelIcon color="error" fontSize="small" />}
                    {permisoSeleccionado.revisado_tthh ? 'Sí' : 'No'}
                  </Typography>
                  <Box>
                    <Typography variant="body1" color="var(--color-text)"><strong>Observación TTHH:</strong></Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', mt: 0.5 }}>
                      {permisoSeleccionado.observacion_tthh || '(sin observación)'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <TextField
                    label="Agregar observación"
                    multiline
                    rows={3}
                    value={observacion}
                    onChange={e => setObservacion(e.target.value)}
                    placeholder="Ingrese observación de Talento Humano (opcional)"
                    disabled={permisoSeleccionado.revisado_tthh}
                    fullWidth
                    variant="outlined"
                  />
                </Stack>

                <Button
                  variant="contained"
                  onClick={manejarRevision}
                  disabled={procesandoAccion || permisoSeleccionado.revisado_tthh}
                  sx={{
                    py: 1.5,
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, var(--btn-activar-bg, #27ae60), #2ecc71)',
                    '&:hover': { background: 'var(--btn-activar-bg-hover, #219653)' }
                  }}
                >
                  Confirmar revisión
                </Button>
              </Paper>
            </Grid>

            {/* COLUMNA DERECHA: CARTA A4 PROFESIONAL */}
            <Grid item xs={12} md={7} lg={8}>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  backgroundColor: '#eaeff2',
                  py: 4,
                  borderRadius: 2,
                  overflowY: 'auto',
                  maxHeight: '100vh',
                  position: { md: 'sticky' },
                  top: { md: 24 }
                }}
              >
                <Paper
                  elevation={6}
                  sx={{
                    width: '100%',
                    maxWidth: '210mm',
                    minHeight: '297mm',
                    backgroundColor: '#ffffff',
                    padding: { xs: 2, sm: '20mm' },
                    boxSizing: 'border-box',
                    borderRadius: 2,
                    position: 'relative',
                    fontFamily: '"Times New Roman", Times, serif',
                    color: '#1e2a3a'
                  }}
                >
                  {/* INYECTAMOS LA CARTA EN LUGAR DEL HTML DEL CORREO */}
                  {permisoSeleccionado ? (
                    <CartaSeguimientoPermiso permiso={permisoSeleccionado} />
                  ) : (
                    <Typography align="center" sx={{ mt: 10, color: 'text.secondary' }}>
                      Cargando documento...
                    </Typography>
                  )}
                </Paper>
              </Box>
            </Grid>
          </Grid>
          {/* ADJUNTOS DESDE LA BASE DE DATOS (ARQUITECTURA UNIFICADA Y BLINDADA) */}
          <Paper elevation={3} sx={{ mt: 4, p: 4, borderRadius: 2, backgroundColor: 'var(--card-bg)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
              Evidencia Adjunta:
            </Typography>
            
            {(() => {
              let rutaEvidencia = null;
              
              if (permisoSeleccionado?.documentos && permisoSeleccionado.documentos.length > 0) {
                // 1. PRIORIDAD MÁXIMA: Buscamos explícitamente el archivo que subió el usuario ('Adjunto')
                let doc = permisoSeleccionado.documentos.find(d => d.tipo === 'Adjunto' || d.tipo === 'Evidencia');
                
                // 2. Si por alguna razón no tiene ese tipo, agarramos el que NO sea generado por el sistema
                if (!doc) {
                  doc = permisoSeleccionado.documentos.find(d => 
                    d.tipo !== 'Respuesta PDF' && 
                    d.tipo !== 'Generado PDF' &&
                    !d.url.toLowerCase().includes('_autorizado') &&
                    !d.url.toLowerCase().includes('_denegado')
                  );
                }

                if (doc) rutaEvidencia = doc.url || doc.ruta || doc.fileUrl;
              }
              
              // 3. Fallback solo si la base de datos no trajo la tabla de documentos
              if (!rutaEvidencia) {
                 rutaEvidencia = permisoSeleccionado?.documento || permisoSeleccionado?.url_documento;
              }

              if (rutaEvidencia) {
                const nombreArchivo = rutaEvidencia.split('/').pop();
                const urlSegura = obtenerUrlDocumento(nombreArchivo);
                
                return (
                  <Box>
                    <Button 
                      variant="outlined" 
                      startIcon={<AttachmentIcon sx={{ color: 'var(--color-text)' }} />}
                      onClick={() => setAdjuntoSeleccionado({ filename: nombreArchivo, urlSegura })}
                    >
                      Ver Evidencia del Docente
                    </Button>
                  </Box>
                );
              } else {
                return (
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                    (Este permiso no requiere evidencia o el docente no la adjuntó)
                  </Typography>
                );
              }
            })()}

            {/* VISOR DE PREVIEW ARREGLADO */}
            {adjuntoSeleccionado && (
              <Box sx={{ mt: 4, textAlign: 'center', p: 2, border: '1px solid var(--color-border)', borderRadius: 2, bgcolor: 'var(--color-bg-secondary)' }}>
                {/* Ojo aquí: Validamos la extensión usando 'filename', no 'urlSegura' */}
                {adjuntoSeleccionado.filename.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={adjuntoSeleccionado.urlSegura} width="100%" height="700px" title="Evidencia PDF" style={{ border: 'none', borderRadius: '4px' }} />
                ) : (
                  <img src={adjuntoSeleccionado.urlSegura} alt="Evidencia" style={{ maxWidth: '100%', maxHeight: '700px', borderRadius: '4px', objectFit: 'contain' }} />
                )}
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    );
  }

  // ==========================================
  // VISTA DE LISTA
  // ==========================================
  return (
    <Box sx={{ minHeight: '100vh', py: 4, backgroundColor: 'var(--color-bg)' }}>
      <Container maxWidth="xl">
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--color-text)', mb: 4 }}>
          Solicitudes para Revisión TTHH
        </Typography>

        {cargando ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={60} animation="wave" sx={{ borderRadius: 2, bgcolor: 'var(--color-bg-secondary)' }} />
            ))}
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, backgroundColor: 'var(--card-bg)' }}>
            <Table aria-label="tabla de solicitudes tthh">
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, var(--btn-crear-bg, #1976d2), #1565c0)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Asunto</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                      No hay correos para mostrar.
                    </TableCell>
                  </TableRow>
                ) : (
                  resultados.map(({ correo }) => (
                    <TableRow key={correo.id} hover sx={{ '&:hover': { backgroundColor: 'var(--color-surface-hover, rgba(0,0,0,0.02))' } }}>
                      <TableCell sx={{ color: 'var(--color-text)' }}>{correo.subject}</TableCell>
                      <TableCell sx={{ color: 'var(--color-text)' }}>{new Date(correo.date).toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => {
                            setCorreoSeleccionado(correo);
                            const item = resultados.find(r => r.correo.id === correo.id);
                            setPermisoSeleccionado(item ? item.permiso : null);
                            setAdjuntoSeleccionado(null);
                            setObservacion('');
                            setError(null);
                          }}
                          sx={{
                            backgroundColor: 'var(--btn-editar-bg, #f39c12)',
                            color: 'white',
                            '&:hover': { backgroundColor: 'var(--btn-editar-bg-hover, #e67e22)' },
                            textTransform: 'none'
                          }}
                        >
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <LoadingModal visible={procesandoAccion} />
      </Container>
    </Box>
  );
}

export default SolicitudesTTHH;
