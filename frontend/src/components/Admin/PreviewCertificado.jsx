// frontend/src/components/PreviewCertificado.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const PreviewCertificado = ({ form, docentes, directores }) => {
  // Buscar los nombres de docente y director
  const docente = docentes.find(d => d.id === form.docente_id);
  const director = directores.find(d => d.id === form.director_id);

  return (
    <Box sx={{
      width: '100%',
      maxWidth: '800px',
      aspectRatio: '1.414 / 1', // Proporción de hoja A4 Horizontal
      border: '10px double #1976d2',
      p: 4,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      color: '#000',
      textAlign: 'center',
      fontFamily: '"Times New Roman", Times, serif',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>

      {/* ENCABEZADO */}
      <Box>
         <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlG2ZniQvzJjbix-fZIaIFJ-gfn3bm6fhHkg&s" 
            alt="Logo IAI" 
            style={{ width: 80, height: 80, marginBottom: '10px' }} 
         />
         <Typography variant="h5" fontWeight="bold">INSTITUTO ACADÉMICO DE IDIOMAS</Typography>
         <Typography variant="h6">UNIVERSIDAD CENTRAL DEL ECUADOR</Typography>
      </Box>

      {/* CUERPO DEL CERTIFICADO */}
      <Box sx={{ my: 3 }}>
        <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
          Otorga el presente certificado a:
        </Typography>

        {/* Mostrar directamente los datos del formulario */}
        <Typography variant="h3" sx={{ mt: 2, mb: 2, fontWeight: 'bold', textTransform: 'uppercase', color: '#2c3e50' }}>
          {form.estudiante_nombres || '[NOMBRES]'} {form.estudiante_apellidos || '[APELLIDOS]'}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
          Por haber aprobado satisfactoriamente el nivel de suficiencia de inglés:
        </Typography>
        <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold', fontStyle: 'italic' }}>
          {form.nivel_ingles || '[Nivel de Inglés]'}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Fecha de Aprobación: <strong>{form.fecha_aprobacion || '[Fecha]'}</strong>
        </Typography>
      </Box>

      {/* ZONA DE FIRMAS */}
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4, px: 4 }}>
        <Box sx={{ textAlign: 'center', width: '40%' }}>
          <Box sx={{ borderBottom: '1px solid black', mb: 1, height: '40px' }}></Box>
          <Typography variant="body2" fontWeight="bold">
            {docente ? `${docente.nombres} ${docente.apellidos}` : 'Nombre del Docente'}
          </Typography>
          <Typography variant="caption">Docente a cargo</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', width: '40%' }}>
          <Box sx={{ borderBottom: '1px solid black', mb: 1, height: '40px' }}></Box>
          <Typography variant="body2" fontWeight="bold">
            {director ? `${director.nombres} ${director.apellidos}` : 'Nombre del Director'}
          </Typography>
          <Typography variant="caption">Director del Instituto</Typography>
        </Box>
      </Box>

      {/* ZONA DEL QR Y SEGURIDAD */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2 }}>
         <Box sx={{ border: '2px dashed #ccc', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9' }}>
            <Typography variant="caption" color="textSecondary" align="center">
              QR<br/>Autogenerado
            </Typography>
         </Box>
         <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
           ID de Verificación: [Se generará al emitir el documento]
         </Typography>
      </Box>
    </Box>
  );
};

export default PreviewCertificado;