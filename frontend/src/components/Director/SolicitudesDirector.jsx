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
  Alert,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  Attachment as AttachmentIcon,
  CheckCircleOutline as CheckCircleIcon,
  CancelOutlined as CancelIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import { toast, ToastContainer } from 'react-toastify';

// Importaciones locales
import {
  obtenerCorreosUnificadosDirector,
  obtenerUrlDocumento,
  autorizarPermiso,
  denegarPermiso
} from '../../services/api.js';
import LoadingModal from '../LoadingModal';

function SolicitudesDirector() {
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [correoSeleccionado, setCorreoSeleccionado] = useState(null);
  const [permisoSeleccionado, setPermisoSeleccionado] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [cargaVacaciones, setCargaVacaciones] = useState(false);
  const [adjuntoSeleccionado, setAdjuntoSeleccionado] = useState(null);
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  useEffect(() => {
    async function fetchCorreos() {
      setCargando(true);
      setError(null);
      try {
        const data = await obtenerCorreosUnificadosDirector();
        setResultados(data.resultados);
        toast.success('Solicitudes cargadas correctamente', { toastId: 'dir-toast-carga' });
      } catch (e) {
        toast.error(`Error al cargar solicitudes: ${e.message}`, { toastId: 'dir-toast-error' });
      } finally {
        setCargando(false);
      }
    }
    fetchCorreos();
  }, []);

  const manejarAutorizar = async () => {
    if (!permisoSeleccionado) return;
    setProcesandoAccion(true);

    try {
      await autorizarPermiso(permisoSeleccionado.id, observacion, cargaVacaciones);
      toast.success('✅ Permiso autorizado correctamente', {
        toastId: `autorizado-${permisoSeleccionado.id}`,
        position: 'top-right',
      });

      const data = await obtenerCorreosUnificadosDirector();
      setResultados(data.resultados);
      setCorreoSeleccionado(null);
      setPermisoSeleccionado(null);
      setAdjuntoSeleccionado(null);
      setObservacion('');
      setCargaVacaciones(false); // Reset de checkbox
      setError(null);
    } catch (e) {
      toast.error(`❌ Error al autorizar: ${e.message}`, {
        toastId: `error-autorizar-${permisoSeleccionado.id}`,
        position: 'top-right',
      });
    } finally {
      setProcesandoAccion(false);
    }
  };

  const manejarDenegar = async () => {
    if (!permisoSeleccionado) return;
    setProcesandoAccion(true);

    try {
      await denegarPermiso(permisoSeleccionado.id, observacion, cargaVacaciones);
      toast.success('🚫 Permiso denegado correctamente', {
        toastId: `denegado-${permisoSeleccionado.id}`,
        position: 'top-right',
      });

      const data = await obtenerCorreosUnificadosDirector();
      setResultados(data.resultados);
      setCorreoSeleccionado(null);
      setPermisoSeleccionado(null);
      setAdjuntoSeleccionado(null);
      setObservacion('');
      setCargaVacaciones(false); // Reset de checkbox
      setError(null);
    } catch (e) {
      toast.error(`⚠️ Error al denegar: ${e.message}`, {
        toastId: `error-denegar-${permisoSeleccionado.id}`,
        position: 'top-right',
      });
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
      // === LÓGICA INTELIGENTE DE VACACIONES (NIVEL DIOS) ===

      // 1. Convertimos TODO el objeto "tipo" a texto. 
      // Así evitamos que la palabra se nos escape si viene en otro campo de la BD.
      const datosTipo = JSON.stringify(permisoSeleccionado?.tipo || {}).toLowerCase() 
                        + ' ' + 
                        (permisoSeleccionado?.tipo_permiso || '').toLowerCase();

      // 2. Buscamos cualquier palabra clave relacionada a evidencias o salud
      const requiereEvidencia = 
        datosTipo.includes('requiere') || 
        datosTipo.includes('evidencia') || 
        datosTipo.includes('medic') || 
        datosTipo.includes('médic') || 
        datosTipo.includes('calamidad');

      // === LÓGICA DE DOCUMENTOS ADJUNTOS ===
      let url = '';

      if (adjuntoSeleccionado) {
        const nombreArchivo = adjuntoSeleccionado?.filename?.toLowerCase() || '';

        // Se considera evidencia si NO es el PDF generado automáticamente del permiso
        const esEvidencia = !nombreArchivo.endsWith('_permiso.pdf');

        // Selección segura del nombre del documento
        const nombreSeguro =
          (esEvidencia && permisoSeleccionado?.documento)
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
              setCargaVacaciones(false);
              setError(null);
            }}
            sx={{ mb: 3, color: 'var(--color-text-secondary)', textTransform: 'none' }}
          >
            Volver a la lista
          </Button>

          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: 'var(--color-header-bg)', color: 'var(--color-header-text)' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              {correoSeleccionado.subject}
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
            <Grid item xs={12} md={5} lg={4}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: 'var(--card-bg)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  📝 Detalles del Permiso
                </Typography>
                
                <Stack spacing={2} sx={{ mb: 3, flexGrow: 1 }}>
                  <Typography variant="body1" color="var(--color-text)">
                    <strong>Tipo:</strong> {permisoSeleccionado.tipo.nombre} {permisoSeleccionado.tipo.sub_tipo ? `(${permisoSeleccionado.tipo.sub_tipo})` : ''}
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
                  
                  {permisoSeleccionado.revisado_tthh && (
                    <>
                      <Box>
                        <Typography variant="body1" color="var(--color-text)"><strong>Observación TTHH:</strong></Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', mt: 0.5 }}>
                          {permisoSeleccionado.observacion_tthh || '(sin observación)'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="var(--color-text-secondary)">
                        <strong>Fecha de revisión:</strong> {new Date(permisoSeleccionado.fecha_revision_tthh).toLocaleString()}
                      </Typography>
                    </>
                  )}

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' }}>
                    Decisión del Director
                  </Typography>
                  
                  <TextField
                    label="Respuesta / Observación"
                    multiline
                    rows={3}
                    value={observacion}
                    onChange={e => setObservacion(e.target.value)}
                    placeholder="Ingrese respuesta al presente documento"
                    fullWidth
                    variant="outlined"
                  />

                  {/* === CHECKBOX CONDICIONAL === */}
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={cargaVacaciones} 
                        onChange={e => setCargaVacaciones(e.target.checked)} 
                        disabled={requiereEvidencia}
                        sx={{
                          color: requiereEvidencia ? 'text.disabled' : 'primary.main',
                          '&.Mui-checked': {
                            color: 'primary.main',
                          },
                        }}
                      />
                    }
                    label="Cargar a vacaciones"
                    sx={{ color: requiereEvidencia ? 'text.disabled' : 'var(--color-text)' }}
                  />
                  
                  {requiereEvidencia && (
                    <Typography variant="caption" sx={{ display: 'block', ml: 4, mt: -1, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                      * Opción no disponible para permisos que se justifican con evidencia (médica/calamidad).
                    </Typography>
                  )}
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={manejarAutorizar}
                    disabled={procesandoAccion}
                    startIcon={<ThumbUpIcon />}
                    sx={{
                      py: 1.5,
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                      '&:hover': { background: 'linear-gradient(135deg, #219653, #27ae60)' }
                    }}
                  >
                    Autorizar
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={manejarDenegar}
                    disabled={procesandoAccion}
                    startIcon={<ThumbDownIcon />}
                    sx={{
                      py: 1.5,
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
                      '&:hover': { background: 'linear-gradient(135deg, #a93226, #c0392b)' }
                    }}
                  >
                    Denegar
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={7} lg={8}>
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  backgroundColor: '#0f172a',
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
                    width: '210mm',
                    minHeight: '297mm',
                    backgroundColor: '#ffffff',
                    padding: '20mm',
                    boxSizing: 'border-box',
                    borderRadius: 2,
                    position: 'relative',
                    fontFamily: '"Times New Roman", Times, serif',
                    color: '#1e2a3a'
                  }}
                >
                  <Box
                    sx={{
                      '& img': {
                        display: 'block',
                        margin: '0 auto',
                        maxWidth: '120px',
                        mb: 2
                      },
                      '& .titulo-institucion': {
                        textAlign: 'center',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontSize: '14px',
                        lineHeight: 1.4,
                        mb: 3
                      },
                      '& .fecha': {
                        textAlign: 'right',
                        mb: 3,
                        fontSize: '13px'
                      },
                      '& .destinatario': {
                        textAlign: 'left',
                        mb: 3,
                        fontSize: '13px'
                      },
                      '& .texto': {
                        textAlign: 'justify',
                        fontSize: '13.5px',
                        lineHeight: 1.6,
                        mb: 2
                      },
                      '& .firma': {
                        marginTop: '40px',
                        fontSize: '13px'
                      }
                    }}
                  >
                    {correoSeleccionado?.html ? (
                      <div
                           dangerouslySetInnerHTML={{
                             __html: `
                               <style>
                                 body {
                                   font-family: "Times New Roman", serif;
                                   color: #1e2a3a;
                                   line-height: 1.6;
                                 }
                                 img {
                                   display: block;
                                   margin: 0 auto;
                                   max-width: 120px;
                                 }
                                 .titulo-institucion {
                                   text-align: center;
                                   font-weight: bold;
                                   text-transform: uppercase;
                                   font-size: 14px;
                                   margin-bottom: 20px;
                                 }
                                 .fecha {
                                   text-align: right;
                                   font-size: 13px;
                                   margin-bottom: 20px;
                                 }
                                 .destinatario {
                                   font-size: 13px;
                                   margin-bottom: 20px;
                                 }
                                 .texto {
                                   text-align: justify;
                                   font-size: 13.5px;
                                   margin-bottom: 15px;
                                 }
                                 .firma {
                                   margin-top: 40px;
                                   font-size: 13px;
                                 }
                                 table {
                                   width: 100%;
                                   border-collapse: collapse;
                                 }
                               </style>
                               ${correoSeleccionado.html}
                             `
                            }}
                      />
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {correoSeleccionado?.text || ''}
                      </div>
                    )}
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>

          <Paper elevation={3} sx={{ mt: 4, p: 4, borderRadius: 2, backgroundColor: 'var(--card-bg)' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'var(--color-text)' }}>
              Adjuntos:
            </Typography>
            
            {correoSeleccionado.attachments?.length > 0 ? (
              <List>
                {correoSeleccionado.attachments.map((adj, i) => (
                  <ListItem key={i} disableGutters>
                    <ListItemIcon>
                      <AttachmentIcon sx={{ color: 'var(--color-text)' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={adj.filename} 
                      secondary={adj.size || ''} 
                      primaryTypographyProps={{ color: 'var(--color-text)' }}
                      secondaryTypographyProps={{ color: 'var(--color-text-secondary)' }}
                    />
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setAdjuntoSeleccionado(adj)}
                      sx={{ ml: 2 }}
                    >
                      Ver adjunto
                    </Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                (sin adjuntos)
              </Typography>
            )}

            {adjuntoSeleccionado && (
              <Box sx={{ mt: 4, textAlign: 'center', p: 2, border: '1px solid var(--color-border)', borderRadius: 2, bgcolor: 'var(--color-bg-secondary)' }}>
                {esPDF ? (
                  <iframe src={url} width="100%" height="700px" title="Evidencia PDF" style={{ border: 'none', borderRadius: '4px' }} />
                ) : (
                  <img src={url} alt="Evidencia" style={{ maxWidth: '100%', maxHeight: '700px', borderRadius: '4px' }} />
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
          Solicitudes para aprobación o rechazo
        </Typography>

        {cargando ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={60} animation="wave" sx={{ borderRadius: 2, bgcolor: 'var(--color-bg-secondary)' }} />
            ))}
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, backgroundColor: 'var(--card-bg)' }}>
            <Table aria-label="tabla de solicitudes director">
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, var(--color-header-bg, #2c3e50), #34495e)' }}>
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
                        <Tooltip title="Ver Detalles">
                          <IconButton 
                            color="primary" 
                            onClick={() => {
                              setCorreoSeleccionado(correo);
                              const item = resultados.find(r => r.correo.id === correo.id);
                              setPermisoSeleccionado(item ? item.permiso : null);
                              setAdjuntoSeleccionado(null);
                              setObservacion('');
                              setCargaVacaciones(false);
                              setError(null);
                            }}
                            sx={{ color: 'var(--color-link, #2980b9)' }}
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
        )}

        <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} theme="colored" />
        <LoadingModal visible={procesandoAccion || cargando} />
      </Container>
    </Box>
  );
}

export default SolicitudesDirector;