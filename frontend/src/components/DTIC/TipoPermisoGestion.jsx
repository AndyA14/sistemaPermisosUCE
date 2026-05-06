import React, { useEffect, useState, useRef } from 'react';
import {
  obtenerTiposPermiso,
  crearTipoPermiso,
  actualizarTipoPermiso,
  eliminarTipoPermiso,
} from '../../services/api';
import LoadingModal from '../../components/LoadingModal';
import { toast } from 'react-toastify';

// 📦 Importaciones de Material UI
import {
  Box, Container, Paper, Typography, Grid, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, InputAdornment
} from '@mui/material';

// 🎨 Importaciones de React Icons (Estilo Material)
import {
  MdAssignment, MdAdd, MdEdit, MdDelete, MdSave,
  MdCancel, MdTitle, MdLabel, MdFormatListBulleted
} from 'react-icons/md';

function TipoPermisoGestion() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, nombre: '', sub_tipo: '' });
  const [showForm, setShowForm] = useState(false);

  const toastCargaMostrado = useRef(false);

  useEffect(() => {
    cargarTipos();
  }, []);

  const cargarTipos = async () => {
    setLoading(true);
    try {
      const data = await obtenerTiposPermiso();
      setTipos(data);

      if (!toastCargaMostrado.current) {
        toast.success('📦 Tipos de permiso cargados correctamente');
        toastCargaMostrado.current = true;
      }
    } catch {
      toast.error('❌ Error al cargar tipos de permiso');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast.warn('⚠️ El nombre es obligatorio');
      return;
    }

    setLoading(true);
    try {
      if (form.id) {
        await actualizarTipoPermiso(form.id, {
          nombre: form.nombre,
          sub_tipo: form.sub_tipo,
        });
        toast.success('✅ Tipo de permiso actualizado');
      } else {
        await crearTipoPermiso({
          nombre: form.nombre,
          sub_tipo: form.sub_tipo,
        });
        toast.success('✅ Tipo de permiso creado');
      }

      setForm({ id: null, nombre: '', sub_tipo: '' });
      setShowForm(false);
      await cargarTipos();
    } catch {
      toast.error('❌ Error al guardar tipo de permiso');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (tipo) => {
    setForm({
      id: tipo.id,
      nombre: tipo.nombre,
      sub_tipo: tipo.sub_tipo,
    });
    setShowForm(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que desea eliminar este tipo de permiso?')) return;

    setLoading(true);
    try {
      await eliminarTipoPermiso(id);
      toast.success('🗑️ Tipo de permiso eliminado');
      await cargarTipos();
    } catch {
      toast.error('❌ Error al eliminar tipo de permiso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: 'calc(100vh - 80px)' }}>
      <LoadingModal visible={loading} />

      {/* 🎯 Header con estadísticas */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom display="flex" justifyContent="center" alignItems="center" gap={2}>
          <MdAssignment /> Gestión de Tipos de Permiso
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Administra los tipos de permisos disponibles en el sistema
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, bgcolor: 'primary.main', color: 'white', borderRadius: 2, transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
              <Typography variant="h3" fontWeight="bold">{tipos.length}</Typography>
              <Typography variant="overline" sx={{ letterSpacing: 1 }}>Total de Tipos</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 3, bgcolor: 'secondary.main', color: 'white', borderRadius: 2, transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
              <Typography variant="h3" fontWeight="bold">{tipos.filter(t => t.sub_tipo).length}</Typography>
              <Typography variant="overline" sx={{ letterSpacing: 1 }}>Con Sub-tipos</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* 🎨 Botón de crear / Indicador */}
      <Box display="flex" justifyContent="center" mb={4}>
        {!showForm ? (
          <Button 
            variant="contained" 
            color="success" 
            size="large" 
            startIcon={<MdAdd />}
            onClick={() => setShowForm(true)}
            sx={{ borderRadius: 2, px: 4, py: 1.5, fontSize: '1.1rem' }}
          >
            Nuevo Tipo de Permiso
          </Button>
        ) : (
          <Chip 
            color="warning" 
            icon={form.id ? <MdEdit /> : <MdAdd />} 
            label={form.id ? 'Editando Permiso' : 'Creando Nuevo Permiso'} 
            sx={{ px: 2, py: 2.5, fontSize: '1rem', fontWeight: 'bold' }}
          />
        )}
      </Box>

      {/* ✨ Formulario */}
      {showForm && (
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Box textAlign="center" mb={4}>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {form.id ? 'Editar Tipo de Permiso' : 'Crear Nuevo Tipo'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete la información del tipo de permiso
            </Typography>
          </Box>
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Nombre del Tipo"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Vacaciones, Permiso médico..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><MdTitle /></InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sub-tipo (Opcional)"
                  name="sub_tipo"
                  value={form.sub_tipo}
                  onChange={handleChange}
                  placeholder="Ej: Con goce, Sin goce..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start"><MdLabel /></InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Box display="flex" gap={2} justifyContent="center" mt={4} pt={3} borderTop={1} borderColor="divider">
              <Button type="submit" variant="contained" color="primary" startIcon={<MdSave />}>
                {form.id ? 'Actualizar Tipo' : 'Crear Tipo'}
              </Button>
              <Button 
                variant="outlined" 
                color="inherit" 
                startIcon={<MdCancel />}
                onClick={() => {
                  setShowForm(false);
                  setForm({ id: null, nombre: '', sub_tipo: '' });
                }}
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* 📊 Tabla moderna */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h5" color="primary" fontWeight="bold" display="flex" justifyContent="center" alignItems="center" gap={1}>
            <MdFormatListBulleted /> Lista de Tipos de Permiso
          </Typography>
        </Box>

        {tipos.length === 0 ? (
          <Box textAlign="center" py={6}>
            <MdAssignment style={{ fontSize: '4rem', opacity: 0.3, marginBottom: '1rem' }} />
            <Typography variant="h6" color="text.primary">No hay tipos de permiso</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Comienza creando el primer tipo de permiso para el sistema
            </Typography>
            <Button variant="contained" onClick={() => setShowForm(true)} startIcon={<MdAdd />}>
              Crear Primer Tipo
            </Button>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre del Tipo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sub-tipo</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tipos.map((tipo) => (
                  <TableRow key={tipo.id} hover>
                    <TableCell>
                      <Chip label={`#${tipo.id}`} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'medium' }}>{tipo.nombre}</TableCell>
                    <TableCell>
                      {tipo.sub_tipo ? (
                        <Chip label={tipo.sub_tipo} size="small" color="success" />
                      ) : (
                        <Typography variant="body2" color="text.disabled" fontStyle="italic">
                          Sin sub-tipo
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton color="warning" onClick={() => handleEditar(tipo)}>
                          <MdEdit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton color="error" onClick={() => handleEliminar(tipo.id)}>
                          <MdDelete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}

export default TipoPermisoGestion;