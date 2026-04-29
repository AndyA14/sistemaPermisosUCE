import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { getRol } from '../utils/auth';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

// 📦 Importaciones de Material UI
import { Box } from '@mui/material';

// ❌ Borramos la importación de LayoutPrincipal.css

function LayoutPrincipal() {
  const rol = getRol();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Nuestro nuevo Header de MUI */}
      <Header toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
      
      {/* Contenedor principal para Sidebar y el contenido */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        
        {/* Tu Sidebar original (Aún no lo tocamos para que no se rompa) */}
        <Sidebar rol={rol} isCollapsed={isSidebarCollapsed} />
        
        {/* Área principal donde se cargan las vistas (Outlet) */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 2, md: 4 }, // Padding adaptable (menor en móviles)
            overflowY: 'auto',
            backgroundColor: 'background.default', // Automático para claro/oscuro
            transition: 'background-color 0.3s ease'
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Tu Footer original */}
      <Footer />
    </Box>
  );
}

export default LayoutPrincipal;