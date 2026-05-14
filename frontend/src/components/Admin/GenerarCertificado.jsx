// frontend/src/components/GenerarCertificado.jsx
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Grid, TextField, Button, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';
import PreviewCertificado from './PreviewCertificado';

// Importamos las funciones nativas de tu api.js
import { crearCertificado, getUsuarios } from '../../services/api';

function GenerarCertificado() {
  const [docentes, setDocentes] = useState([]);
  const [directores, setDirectores] = useState([]);
  
  // Estado del formulario con datos manuales del estudiante
  const [form, setForm] = useState({
    estudiante_nombres: '',
    estudiante_apellidos: '',
    estudiante_ci: '',
    nivel_ingles: '',
    fecha_aprobacion: '',
    docente_id: '',
    director_id: ''
  });

  // Cargar docentes y directores desde la API al montar el componente
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        // Usamos directamente tu función getUsuarios()
        const listaUsuarios = await getUsuarios(); 

        setDocentes(listaUsuarios.filter(u => u.rol === 'docente'));
        setDirectores(listaUsuarios.filter(u => u.rol === 'director' || u.rol === 'admin'));
      } catch (error) {
        toast.error('Error al cargar la lista de usuarios');
        console.error(error);
      }
    };

    cargarUsuarios();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearCertificado(form);
      toast.success('Certificado generado exitosamente');
      // Opcional: Limpiar el formulario aquí
    } catch (error) {
      toast.error('Error al generar el certificado');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Emisión de Certificados
      </Typography>
      
      <Grid container spacing={3}>
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom>Datos del Estudiante</Typography>
              
              {/* Datos Manuales del Estudiante */}
              <TextField
                fullWidth
                margin="normal"
                label="Nombres del Estudiante"
                name="estudiante_nombres"
                value={form.estudiante_nombres}
                onChange={handleChange}
                required
              />

              <TextField
                fullWidth
                margin="normal"
                label="Apellidos del Estudiante"
                name="estudiante_apellidos"
                value={form.estudiante_apellidos}
                onChange={handleChange}
                required
              />

              <TextField
                fullWidth
                margin="normal"
                label="Número de Cédula"
                name="estudiante_ci"
                value={form.estudiante_ci}
                onChange={handleChange}
                required
              />

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Datos del Certificado</Typography>

              {/* Nivel de Inglés */}
              <TextField
                fullWidth
                margin="normal"
                label="Nivel de Inglés Aprobado (Ej: B2)"
                name="nivel_ingles"
                value={form.nivel_ingles}
                onChange={handleChange}
                required
              />

              {/* Fecha de Aprobación */}
              <TextField
                fullWidth
                margin="normal"
                label="Fecha de Aprobación"
                type="date"
                name="fecha_aprobacion"
                value={form.fecha_aprobacion}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />

              {/* Select de Docente */}
              <TextField select fullWidth margin="normal" label="Docente a cargo (Firma)" name="docente_id" value={form.docente_id} onChange={handleChange} required>
                <MenuItem value=""><em>Seleccione un docente</em></MenuItem>
                {docentes.map((doc) => (
                  <MenuItem key={doc.id} value={doc.id}>
                    {doc.nombres} {doc.apellidos}
                  </MenuItem>
                ))}
              </TextField>

              {/* Select de Director */}
              <TextField select fullWidth margin="normal" label="Director (Firma)" name="director_id" value={form.director_id} onChange={handleChange} required>
                <MenuItem value=""><em>Seleccione al director</em></MenuItem>
                {directores.map((dir) => (
                  <MenuItem key={dir.id} value={dir.id}>
                    {dir.nombres} {dir.apellidos}
                  </MenuItem>
                ))}
              </TextField>

              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
                Generar Certificado
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* COLUMNA DERECHA: VISTA PREVIA */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '600px', backgroundColor: '#f0f2f5' }}>
            <PreviewCertificado
              form={form}
              docentes={docentes}
              directores={directores}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default GenerarCertificado;