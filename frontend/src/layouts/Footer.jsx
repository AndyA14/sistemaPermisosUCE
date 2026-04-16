import React from 'react';
import { Box, Typography } from '@mui/material';

// ❌ Borramos la importación de Footer.css

function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 2, 
        textAlign: 'center', 
        bgcolor: 'background.paper', 
        color: 'text.secondary',
        borderTop: 1,
        borderColor: 'divider',
        transition: 'background-color 0.3s ease'
      }}
    >
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} Instituto Académico de Idiomas - UCE. Todos los derechos reservados.
      </Typography>
    </Box>
  );
}

export default Footer;