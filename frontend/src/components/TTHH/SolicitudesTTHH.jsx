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
import { toast, ToastContainer } from 'react-toastify';

// Importaciones locales
import { obtenerCorreosUnificadosTTHH, obtenerUrlDocumento, revisarPermisoPorTTHH } from '../../services/api';
import LoadingModal from '../LoadingModal';

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
      setTimeout(async () => {
        setCorreoSeleccionado(null);
        setPermisoSeleccionado(null);
        setAdjuntoSeleccionado(null);
        setObservacion('');
        await fetchCorreos();
      }, 1000);
    } catch (e) {
      console.log(`Error al revisar permiso: ${e.message}`);
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
      // 1. Detectamos si el adjunto es la Evidencia o el PDF generado por el sistema
      // (Asumimos que el PDF del sistema termina en _Permiso.pdf como en tu captura)
      const esEvidencia = !adjuntoSeleccionado.filename.endsWith('_Permiso.pdf');

      // 2. Si es la evidencia, ignoramos el nombre corrupto del correo y extraemos 
      // el nombre perfecto directamente del objeto de la base de datos.
      // ⚠️ OJO: Cambia ".documento" si en tu backend la columna se llama ".archivo" o ".evidencia"
      const nombreSeguro = (esEvidencia && permisoSeleccionado?.documento) 
        ? permisoSeleccionado.documento 
        : adjuntoSeleccionado.filename;

      // 3. Generamos la URL con el nombre correcto
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
            sx={{ mb: 3, color: 'var(--color-text-secondary)' }}
          >
            Volver a la lista
          </Button>

          {/* ENCABEZADO */}
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

          {/* CONTENIDO PRINCIPAL: PERMISO E IFRAME */}
          <Grid container spacing={4}>
            
            {/* Columna Izquierda: Detalles y Revisión */}
            <Grid item xs={12} md={5}>
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

            {/* COLUMNA DERECHA: VISTA PREVIA PROFESIONAL (ESTILO CARTA) */}
            <Grid item xs={12} md={7} lg={8}>
              <Box sx={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                backgroundColor: '#eaeff2', // Fondo gris de "escritorio"
                py: 4,
                borderRadius: 2,
                overflowY: 'auto',
                maxHeight: '100vh',
                position: { md: 'sticky' }, 
                top: { md: 24 } 
              }}>
                <Paper 
                  elevation={6} 
                  sx={{ 
                    width: '100%', 
                    maxWidth: '800px', 
                    minHeight: '1050px', // Altura proporcional a A4
                    padding: { xs: 2, sm: '1.3cm 2cm' }, // Tus márgenes exactos
                    backgroundColor: '#ffffff', 
                    color: '#2c3e50', 
                    fontFamily: '"Times New Roman", Times, serif', 
                    borderRadius: 1, 
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Título interno del visor */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      mb: 2, 
                      color: 'grey.400', 
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      borderBottom: '1px solid #eee',
                      pb: 1
                    }}
                  >
                  </Typography>

                  <iframe
                    srcDoc={`
                      <html>
                        <head>
                          <style>
                            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
                            
                            body { 
                              margin: 0; 
                              padding: 0; 
                              font-family: "Times New Roman", Times, serif; 
                              line-height: 1.5;
                              color: #2c3e50;
                            }
                            
                            /* Adaptamos los estilos que me pasaste para que funcionen dentro del HTML del correo */
                            .carta-body { width: 100%; }
                            .carta-encabezado { font-weight: 600; text-transform: uppercase; text-align: center; margin-bottom: 2rem; }
                            .fecha-derecha { text-align: right; margin-bottom: 1.5rem; }
                            .destinatario-derecha { text-align: left; margin-bottom: 1.5rem; line-height: 1.3; }
                            .saludo { font-weight: 600; margin-bottom: 1.5rem; }
                            .contenido-justificado { text-align: justify; margin: 1rem 0; word-break: break-word; }
                            .firma-derecha { margin-top: 3rem; }
                            
                            /* Forzamos a que las tablas del correo ocupen todo el ancho */
                            table { width: 100% !important; border-collapse: collapse; }
                            img { max-width: 150px; height: auto; display: block; margin: 0 auto 1rem auto; }
                          </style>
                        </head>
                        <body>
                          <div class="carta-body">
                            ${correoSeleccionado.html || `<div style="white-space: pre-wrap;">${correoSeleccionado.text}</div>`}
                          </div>
                        </body>
                      </html>
                    `}
                    title="Visualizador de Documento"
                    style={{ 
                      width: '100%', 
                      flexGrow: 1, 
                      border: 'none',
                      overflow: 'hidden'
                    }}
                  />
                </Paper>
              </Box>
            </Grid>
          </Grid>

          {/* ADJUNTOS */}
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

        <ToastContainer position="top-right" autoClose={3500} hideProgressBar={false} theme="colored" />
        <LoadingModal visible={procesandoAccion || cargando} />
      </Container>
    </Box>
  );
}

export default SolicitudesTTHH;