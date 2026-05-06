import React, { useState, useEffect, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Box,
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  Stack,
  IconButton
} from '@mui/material';
import { 
  UploadFile as UploadFileIcon, 
  Send as SendIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import {
  crearPermiso,
  obtenerTiposPermiso,
  obtenerPerfil
} from '../../services/api';

import CartaAtraso from '../PlantillasCartas/CartaAtraso';
import CartaFalta from '../PlantillasCartas/CartaFalta';
import CartaSinTimbrar from '../PlantillasCartas/CartaSinTimbrar';
import CartaOtros from '../PlantillasCartas/CartaOtros';
import LoadingModal from '../LoadingModal';

function PermisosForm() {
  const [tipos, setTipos] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [form, setForm] = useState({});
  const [archivo, setArchivo] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);

  const toastMostrado = useRef(false);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [dataTipos, dataPerfil] = await Promise.all([
          obtenerTiposPermiso(),
          obtenerPerfil()
        ]);

        const agrupados = dataTipos.reduce((acc, item) => {
          const existente = acc.find((t) => t.nombre === item.nombre);
          const subtipo = {
            id: item.id,
            value: item.sub_tipo?.toLowerCase().replace(/\s/g, '_'),
            label: item.sub_tipo
          };
          if (existente) {
            existente.sub_tipos.push(subtipo);
          } else {
            acc.push({
              nombre: item.nombre,
              sub_tipos: [subtipo]
            });
          }
          return acc;
        }, []);
        setTipos(agrupados);
        setPerfil(dataPerfil);

        if (!toastMostrado.current) {
          toast.success('Tipos de permiso y perfil cargados correctamente.');
          toastMostrado.current = true;
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        if (!toastMostrado.current) {
          toast.error('Error al cargar datos iniciales. Intenta nuevamente.');
          toastMostrado.current = true;
        }
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // === LÓGICA INTELIGENTE DE EVIDENCIA ===
  const requiereEvidencia = form.subtipo ?
  (
    (form.subtipo.includes('requiere') || form.subtipo.includes('con_')) && 
    !form.subtipo.includes('sin_')
  ) : false;

  const getPermisoData = () => {
    if (!tipoSeleccionado) return {};

    const subtipoSeleccionado = tipoSeleccionado.sub_tipos.find(
      (st) => st.value === form.subtipo
    );

    let permisoData = {
      tipo_id: subtipoSeleccionado?.id,
      descripcion: form.descripcion || '',
    };

    if (tipoSeleccionado.nombre === 'Falta') {
      permisoData.fecha_inicio = form.fecha_inicio || null;
      permisoData.fecha_fin = form.fecha_fin || null;
      permisoData.subtipo = form.subtipo;
    } else {
      permisoData.fecha_inicio = form.fecha || null;
      permisoData.fecha_fin = form.fecha || null;
    }

    if (tipoSeleccionado.nombre === 'Atraso') {
      permisoData.subtipo = form.subtipo;
      permisoData.hora_inicio = form.hora_inicio || '00:00:00';
    }

    if (tipoSeleccionado.nombre === 'Sin Timbrar') {
      permisoData.no_entrada = !!form.no_entrada;
      permisoData.no_salida = !!form.no_salida;
      permisoData.hora_inicio = form.no_entrada ? form.hora_inicio || '00:00:00' : '00:00:00';
      permisoData.hora_fin = form.no_salida ? form.hora_fin || '00:00:00' : '00:00:00';
    }

    if (tipoSeleccionado.nombre.includes('Otro')) {
      permisoData.fecha_inicio = form.fecha || null;
      permisoData.fecha_fin = form.fecha || null;
      permisoData.subtipo = form.subtipo || '';
    }

    return permisoData;
  };

  const generarHtmlCarta = () => {
    let cartaComponente = null;

    if (tipoSeleccionado?.nombre === 'Atraso') {
      cartaComponente = <CartaAtraso perfil={perfil} form={form} tipoSeleccionado={tipoSeleccionado} />;
    } else if (tipoSeleccionado?.nombre === 'Falta') {
      cartaComponente = <CartaFalta perfil={perfil} form={form} tipoSeleccionado={tipoSeleccionado} />;
    } else if (tipoSeleccionado?.nombre === 'Sin Timbrar') {
      cartaComponente = <CartaSinTimbrar perfil={perfil} form={form} tipoSeleccionado={tipoSeleccionado} />;
    } else if (tipoSeleccionado?.nombre.includes('Otro')) {
      cartaComponente = <CartaOtros perfil={perfil} form={form} archivo={archivo} />;
    }

    if (!cartaComponente) return '';

    const estilosCarta = `
      <style>
        body { font-family: "Times New Roman", Times, serif; color: #2c3e50; background-color: #ffffff; margin: 0; padding: 2cm; box-sizing: border-box; }
        .modal-contenido { max-width: 700px; margin: 0 auto; padding: 40px; box-sizing: border-box; line-height: 1.6; background-color: #ffffff; }
        .logo-institucion { display: block; max-width: 120px; margin: 0 auto 1.5rem auto; }
        .carta-encabezado { font-family: "Times New Roman", Times, serif; font-weight: 600; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.06em; text-align: center; margin-bottom: 2rem; }
        .carta-encabezado p { margin: 0.15rem 0; }
        .fecha-derecha { text-align: right; margin-bottom: 1.8rem; font-size: 1rem; font-weight: 500; color: #2c3e50; }
        .destinatario-derecha { text-align: left; margin-bottom: 1.8rem; font-size: 1rem; line-height: 1.4; color: #2c3e50; }
        .destinatario-derecha p { margin: 0.12rem 0; }
        .saludo { font-weight: 600; margin-bottom: 1.5rem; text-align: left; color: #2c3e50; }
        .contenido-justificado { text-align: justify; margin: 0.9rem 0; font-size: 1rem; word-break: break-word; color: #2c3e50; }
        .agradecimiento-derecha { text-align: left; margin-top: 2rem; font-style: italic; font-size: 1rem; color: #2c3e50; }
        .firma-derecha { text-align: left; margin-top: 3rem; font-size: 1rem; font-weight: 400; color: #2c3e50; }
        .firma-derecha p { margin: 3px 0; font-size: 1rem; }
        .firma-derecha strong { font-size: 1.1rem; color: #2c3e50; }
      </style>
    `;

    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          ${estilosCarta}
        </head>
        <body>
          <div class="pagina-a4">
            ${renderToStaticMarkup(cartaComponente)}
          </div>
        </body>
      </html>
    `;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (requiereEvidencia && !archivo) {
      toast.warn('Por favor, adjunta el documento de evidencia requerido para este permiso.', { position: "top-center" });
      return;
    }

    setLoading(true);

    try {
      const permisoData = getPermisoData();
      const htmlCarta = generarHtmlCarta();

      const formData = new FormData();

      Object.keys(permisoData).forEach(key => {
        if (permisoData[key] !== null && permisoData[key] !== undefined) {
          formData.append(key, permisoData[key]);
        }
      });

      formData.append('htmlCorreo', htmlCarta);

      if (archivo) {
        formData.append('documento', archivo);
      }

      await crearPermiso(formData);

      if (!toastMostrado.current) {
        toast.success('Permiso creado con éxito.');
        toastMostrado.current = true;
      }

      setTipoSeleccionado(null);
      setForm({});
      setArchivo(null);
    } catch (error) {
      console.error('Error al crear permiso:', error);
      toast.error('Error al crear permiso, revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e, asuntoDefault) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop();

    const limpiarTexto = (texto) =>
      texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') 
        .replace(/ñ/gi, 'n')
        .replace(/[^a-zA-Z0-9]/g, '_')  
        .replace(/_+/g, '_')            
        .replace(/^_|_$/g, '')          
        .toLowerCase();

    const nombres = perfil?.nombres ? limpiarTexto(perfil.nombres) : 'nombre';
    const apellidos = perfil?.apellidos ? limpiarTexto(perfil.apellidos) : 'apellido';

    const subtipoLimpio = form.subtipo
      ? limpiarTexto(form.subtipo)
      : limpiarTexto(asuntoDefault || 'documento');

    let fechaRango = form.fecha || 'sin_fecha';

    if (tipoSeleccionado?.nombre === 'Falta') {
      const formatoFecha = (fechaStr) => {
        if (!fechaStr) return 'sin_fecha';
        const date = new Date(fechaStr + 'T00:00:00');
        return date
          .toLocaleDateString('es-EC', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
          .replace(/\//g, '-');
      };

      const fIni = formatoFecha(form.fecha_inicio);
      const fFin = formatoFecha(form.fecha_fin);
      fechaRango = fIni === fFin ? fIni : `${fIni}_a_${fFin}`;
    }

    const timestamp = Date.now();

    const nombreArchivo = `${apellidos}_${nombres}_${fechaRango}_${
      tipoSeleccionado?.nombre === 'Falta' ? timestamp + '_' : ''
    }${subtipoLimpio}.${extension}`;

    const archivoRenombrado = new File([file], nombreArchivo, {
      type: file.type
    });

    setArchivo(archivoRenombrado);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', py: 4 }}>
    
      {loading && <LoadingModal visible={true} />}

      <Container maxWidth="xl">
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--color-text)', mb: 4 }}>
          Generador de Solicitudes
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3, backgroundColor: 'var(--card-bg)' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'var(--color-text)', mb: 3 }}>
                Formulario de Permiso
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                
                <TextField
                  select
                  label="Tipo de permiso"
                  name="tipo"
                  value={tipoSeleccionado?.nombre || ''}
                  onChange={(e) => {
                    const seleccionado = tipos.find((t) => t.nombre === e.target.value);
                    setTipoSeleccionado(seleccionado || null);
                    setForm({});
                    setArchivo(null);
                    toastMostrado.current = false;
                  }}
                  required
                  fullWidth
                >
                  <MenuItem value=""><em>Seleccione...</em></MenuItem>
                  {tipos.map((t) => (
                    <MenuItem key={t.nombre} value={t.nombre}>{t.nombre}</MenuItem>
                  ))}
                </TextField>

                {tipoSeleccionado?.sub_tipos?.length > 0 && (
                  <TextField
                    select
                    label="Subtipo"
                    name="subtipo"
                    value={form.subtipo || ''}
                    onChange={handleChange}
                    required
                    fullWidth
                  >
                    <MenuItem value=""><em>Seleccione...</em></MenuItem>
                    {tipoSeleccionado.sub_tipos.map((st) => (
                      <MenuItem key={st.value} value={st.value}>{st.label}</MenuItem>
                    ))}
                  </TextField>
                )}

                {/* === FALTA === */}
                {tipoSeleccionado?.nombre === 'Falta' && (
                  <>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField type="date" label="Fecha inicio" name="fecha_inicio" value={form.fecha_inicio || ''} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />
                      <TextField type="date" label="Fecha fin" name="fecha_fin" value={form.fecha_fin || ''} onChange={handleChange} required fullWidth inputProps={{ min: form.fecha_inicio }} InputLabelProps={{ shrink: true }} />
                    </Stack>
                    <TextField label="Descripción / Observación" name="descripcion" value={form.descripcion || ''} onChange={handleChange} multiline rows={3} fullWidth />
                  </>
                )}

                {/* === ATRASO === */}
                {tipoSeleccionado?.nombre === 'Atraso' && (
                  <>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField type="date" label="Fecha" name="fecha" value={form.fecha || ''} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />
                      <TextField type="time" label="Hora de entrada" name="hora_inicio" value={form.hora_inicio || ''} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />
                    </Stack>
                    <TextField label="Motivo" name="descripcion" value={form.descripcion || ''} onChange={handleChange} multiline rows={3} fullWidth />
                  </>
                )}

                {/* === SIN TIMBRAR === */}
                {tipoSeleccionado?.nombre === 'Sin Timbrar' && (
                  <>
                    <TextField type="date" label="Fecha" name="fecha" value={form.fecha || ''} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControlLabel control={<Checkbox checked={!!form.no_entrada} onChange={handleChange} name="no_entrada" color="primary" />} label="Falta entrada" />
                      {form.no_entrada && <TextField type="time" label="Hora de entrada" name="hora_inicio" value={form.hora_inicio || ''} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />}

                      <FormControlLabel control={<Checkbox checked={!!form.no_salida} onChange={handleChange} name="no_salida" color="primary" />} label="Falta salida" />
                      {form.no_salida && <TextField type="time" label="Hora de salida" name="hora_fin" value={form.hora_fin || ''} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />}
                    </Box>

                    <TextField label="Descripción" name="descripcion" value={form.descripcion || ''} onChange={handleChange} multiline rows={3} fullWidth />
                  </>
                )}

                {/* === OTROS === */}
                {tipoSeleccionado?.nombre.includes('Otro') && (
                  <>
                    <TextField type="date" label="Fecha" name="fecha" value={form.fecha || ''} onChange={handleChange} required fullWidth InputLabelProps={{ shrink: true }} />
                    <TextField label="Descripción (opcional)" name="descripcion" value={form.descripcion || ''} onChange={handleChange} multiline rows={3} fullWidth />
                  </>
                )}

                {/* === BOTÓN SUBIR DOCUMENTO === */}
                {requiereEvidencia && !archivo && (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadFileIcon />}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    Subir Documento
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleFileUpload(e, 'documento')}
                    />
                  </Button>
                )}

                {/* === CAJA DE SUBIDA DE EVIDENCIA === */}
                {archivo && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 2,
                    p: 1.5,
                    border: '1px solid var(--color-border)',
                    borderRadius: 2,
                    backgroundColor: '#ffffff'
                  }}>
                    <Typography variant="body2" sx={{ color: 'var(--color-link)', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      ✅ {archivo.name}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setArchivo(null)}
                      title="Eliminar archivo seleccionado"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!tipoSeleccionado}
                  size="large"
                  startIcon={<SendIcon />}
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(135deg, var(--btn-crear-bg), #2980b9)',
                    color: 'white',
                    fontWeight: 'bold',
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Enviar Solicitud
                </Button>

              </Box>
            </Paper>
          </Grid>

          {/* COLUMNA DERECHA: VISTA PREVIA */}
          <Grid item xs={12} md={7}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', position: { md: 'sticky' }, top: { md: 24 } }}>
              <Paper 
                elevation={6} 
                sx={{ 
                  width: '100%', maxWidth: '800px', minHeight: '789px', padding: { xs: 4, sm: '1.3cm 2cm' }, backgroundColor: '#ffffff', color: '#2c3e50', fontFamily: '"Times New Roman", Times, serif', borderRadius: 2, boxSizing: 'border-box', overflowY: 'auto',
                  '& .carta-encabezado': { fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', mb: 4, '& p': { margin: '0.15rem 0' } },
                  '& .fecha-derecha': { textAlign: 'right', mb: 3, fontSize: '1rem', fontWeight: 500 },
                  '& .destinatario-derecha': { textAlign: 'left', mb: 3, fontSize: '1rem', lineHeight: 1.3, '& p': { margin: '0.12rem 0' } },
                  '& .saludo': { fontWeight: 600, mb: 3, textAlign: 'left' },
                  '& .contenido-justificado': { textAlign: 'justify', my: 2, fontSize: '1rem', wordBreak: 'break-word', hyphens: 'auto' },
                  '& .agradecimiento-derecha': { textAlign: 'left', mt: 4, fontStyle: 'italic', fontSize: '1rem' },
                  '& .firma-derecha': { textAlign: 'left', mt: 6, fontSize: '1rem', fontWeight: 400, '& p': { margin: '0.15rem 0' }, '& strong': { fontSize: '1.1rem' } },
                  '& .logo-institucion': { display: 'block', maxWidth: '120px', height: 'auto', margin: '0 auto 1.5rem auto' }
                }}
              >
                {!tipoSeleccionado && (
                  <Box display="flex" height="100%" alignItems="center" justifyItems="center" color="grey.400">
                    <Typography variant="h6" align="center" width="100%" fontStyle="italic">
                      La vista previa del documento aparecerá aquí...
                    </Typography>
                  </Box>
                )}
                {tipoSeleccionado?.nombre === 'Atraso' && <CartaAtraso perfil={perfil} form={form} tipoSeleccionado={tipoSeleccionado} />}
                {tipoSeleccionado?.nombre === 'Falta' && <CartaFalta perfil={perfil} form={form} tipoSeleccionado={tipoSeleccionado} />}
                {tipoSeleccionado?.nombre === 'Sin Timbrar' && <CartaSinTimbrar perfil={perfil} form={form} tipoSeleccionado={tipoSeleccionado} />}
                {tipoSeleccionado?.nombre.includes('Otro') && <CartaOtros perfil={perfil} form={form} archivo={archivo} />}
              </Paper>
            </Box>
          </Grid>
          
        </Grid>
      </Container>
    </Box>
  );
}

export default PermisosForm;