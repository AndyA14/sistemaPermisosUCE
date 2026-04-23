import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { logoutUsuario } from '../utils/auth';

// 🌟 Importamos nuestro nuevo Contexto de Tema
import { ThemeContext } from '../context/ThemeContext';

// 📦 Importaciones de Material UI
import {
  AppBar, Toolbar, IconButton, Typography, Box, Menu, MenuItem,
  ListItemIcon, Divider, Tooltip
} from '@mui/material';

// 🎨 Iconos (Seguimos usando los tuyos)
import { 
  HiOutlineMenu, HiOutlineSun, HiOutlineMoon, 
  HiOutlineUserCircle, HiOutlineLogout 
} from 'react-icons/hi';

// ❌ Borramos la importación de Header.css y la de utils/theme (ya no se usan)

function Header({ toggleSidebar, isSidebarCollapsed }) {
  // Conectamos con el contexto global
  const { mode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Control del menú de usuario de Material UI
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logoutUsuario();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" elevation={2} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {/* Botón para ocultar/mostrar Sidebar */}
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          onClick={toggleSidebar}
          edge="start"
          sx={{ mr: 2 }}
        >
          <HiOutlineMenu />
        </IconButton>

        {/* Logo */}
        <Box 
          component="img" 
          src="/logoIAI.png" 
          alt="Logo del sistema" 
          sx={{ height: 40, mr: 2, borderRadius: 1 }} 
        />

        {/* Título (Se oculta en celulares muy pequeños para no romper el diseño) */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}
        >
          Sistema de Permisos
        </Typography>

        {/* Iconos de la derecha */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          {/* Botón mágico de Claro/Oscuro */}
          <Tooltip title={`Cambiar a modo ${mode === 'light' ? 'oscuro' : 'claro'}`}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'dark' ? <HiOutlineSun size={24} /> : <HiOutlineMoon size={24} />}
            </IconButton>
          </Tooltip>

          {/* Botón del menú de usuario */}
          <Tooltip title="Cuenta y opciones">
            <IconButton
              color="inherit"
              onClick={handleMenuClick}
              aria-controls={menuOpen ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={menuOpen ? 'true' : undefined}
            >
              <HiOutlineUserCircle size={28} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Menú Desplegable (Material UI maneja los clics afuera y la animación) */}
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 3,
            sx: { mt: 1.5, minWidth: 200, borderRadius: 2 }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem component={Link} to="/perfil" onClick={handleMenuClose}>
            <ListItemIcon><HiOutlineUserCircle size={20} /></ListItemIcon>
            Mi Perfil
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><HiOutlineLogout size={20} color="#d32f2f" /></ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Header;