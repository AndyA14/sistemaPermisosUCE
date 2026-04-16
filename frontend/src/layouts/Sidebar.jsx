import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  HiOutlineDocumentText, HiOutlineEye, HiOutlinePlus, HiOutlineUserGroup,
  HiOutlineChartBar, HiOutlineCheckCircle, HiOutlineUsers, HiOutlineHome,
  HiOutlineClipboard, HiOutlineSearch, HiOutlineCog, HiOutlineTrendingUp,
  HiOutlineUser, HiOutlineDocument
} from 'react-icons/hi';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';

// 📦 Importaciones de Material UI
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Tooltip, Divider, Box, Menu, MenuItem, useTheme
} from '@mui/material';

// ❌ Borramos la importación de Sidebar.css

const drawerWidth = 260;
const collapsedDrawerWidth = 70;

function Sidebar({ rol, isCollapsed }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  // Estado para los submenús normales (cuando NO está colapsado)
  const [openSubMenus, setOpenSubMenus] = useState({
    permisos: false,
    dashboard: false,
    tthh: false,
    dtic: false,
  });

  // Estado para los menús flotantes (cuando SÍ está colapsado)
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeFloatMenu, setActiveFloatMenu] = useState(null);

  const permisosRoles = ['docente', 'director', 'tthh', 'dti', 'admin'];
  const dashboardRoles = ['director', 'admin'];
  const tthhRoles = ['tthh', 'admin'];
  const dticRoles = ['dti', 'admin'];

  const isActivePath = (path) => pathname.startsWith(path);

  // Manejador principal de clics en los botones del menú padre
  const handleParentClick = (menuId, event) => {
    if (isCollapsed) {
      // Si está colapsado, abrimos el menú flotante de MUI
      setAnchorEl(event.currentTarget);
      setActiveFloatMenu(menuId);
    } else {
      // Si está expandido, abrimos el Collapse de MUI
      setOpenSubMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
    }
  };

  const closeFloatMenu = () => {
    setAnchorEl(null);
    setActiveFloatMenu(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    closeFloatMenu();
  };

  // Definición estructurada del menú para construirlo dinámicamente
  const menuConfig = [
    {
      id: 'permisos',
      title: 'Mis Permisos',
      icon: <HiOutlineDocumentText size={24} />,
      roles: permisosRoles,
      pathMatch: '/permisos',
      children: [
        { title: 'Consultar Solicitudes', path: '/permisos/ver', icon: <HiOutlineEye size={20} /> },
        { title: 'Nueva Solicitud', path: '/permisos/crear', icon: <HiOutlinePlus size={20} /> },
      ]
    },
    {
      id: 'dashboard',
      title: 'Gestión Directiva',
      icon: <HiOutlineUserGroup size={24} />,
      roles: dashboardRoles,
      pathMatch: '/dashboard',
      children: [
        { title: 'Estadísticas de Solicitudes', path: '/dashboard/resumen', icon: <HiOutlineChartBar size={20} /> },
        { title: 'Solicitudes por Aprobar', path: '/dashboard/dashboard', icon: <HiOutlineCheckCircle size={20} /> },
      ]
    },
    {
      id: 'tthh',
      title: 'Talento Humano',
      icon: <HiOutlineUsers size={24} />,
      roles: tthhRoles,
      pathMatch: '/listado-tthh',
      children: [
        { title: 'Panel General', path: '/listado-tthh/dashboard', icon: <HiOutlineHome size={20} /> },
        { title: 'Generar Informes', path: '/listado-tthh/informes', icon: <HiOutlineClipboard size={20} /> },
        { title: 'Revisión de Solicitudes', path: '/listado-tthh/registro-solicitudes', icon: <HiOutlineSearch size={20} /> },
      ]
    },
    {
      id: 'dtic',
      title: 'Administración del Sistema',
      icon: <HiOutlineCog size={24} />,
      roles: dticRoles,
      pathMatch: '/dtic',
      children: [
        { title: 'Panel General', path: '/dtic/dashboard', icon: <HiOutlineHome size={20} /> },
        { title: 'Generador de Reportes', path: '/dtic/informes', icon: <HiOutlineTrendingUp size={20} /> },
        { title: 'Gestión de Usuarios', path: '/dtic/gestion-usuarios', icon: <HiOutlineUser size={20} /> },
        { title: 'Tipos de Permiso', path: '/dtic/tipo-permiso', icon: <HiOutlineDocument size={20} /> },
      ]
    }
  ];

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          '& .MuiDrawer-paper': {
            width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            borderRight: '1px solid',
            borderColor: 'divider',
            position: 'relative', // Para que no se ponga encima del header
            bgcolor: 'background.paper',
          },
        }}
      >
        <List sx={{ pt: 2 }}>
          {menuConfig.filter(section => section.roles.includes(rol)).map((section) => {
            const isSectionActive = isActivePath(section.pathMatch);
            const isExpanded = openSubMenus[section.id] && !isCollapsed;

            return (
              <Box key={section.id}>
                {/* Botón Padre */}
                <Tooltip title={isCollapsed ? section.title : ''} placement="right">
                  <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
                    <ListItemButton
                      onClick={(e) => handleParentClick(section.id, e)}
                      sx={{
                        minHeight: 48,
                        justifyContent: isCollapsed ? 'center' : 'initial',
                        px: 2.5,
                        mx: 1,
                        borderRadius: 2,
                        bgcolor: isSectionActive ? 'action.selected' : 'transparent',
                        color: isSectionActive ? 'primary.main' : 'text.primary',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: isCollapsed ? 0 : 2,
                          justifyContent: 'center',
                          color: isSectionActive ? 'primary.main' : 'inherit',
                        }}
                      >
                        {section.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={section.title} 
                        sx={{ opacity: isCollapsed ? 0 : 1, m: 0 }} 
                        primaryTypographyProps={{ fontWeight: isSectionActive ? 'bold' : 'medium' }}
                      />
                      {!isCollapsed && (
                         isExpanded ? <MdExpandLess /> : <MdExpandMore />
                      )}
                    </ListItemButton>
                  </ListItem>
                </Tooltip>

                {/* Submenú Normal (Collapse) - Solo visible si NO está colapsado */}
                {!isCollapsed && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {section.children.map((child) => (
                        <ListItemButton
                          key={child.path}
                          component={NavLink}
                          to={child.path}
                          sx={{
                            pl: 6, // Identación para hijos
                            py: 1,
                            mx: 1,
                            borderRadius: 2,
                            color: pathname === child.path ? 'primary.main' : 'text.secondary',
                            bgcolor: pathname === child.path ? 'primary.light' : 'transparent',
                            '&.active': { bgcolor: 'action.selected', color: 'primary.main', fontWeight: 'bold' }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 30, color: 'inherit' }}>
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={child.title} 
                            primaryTypographyProps={{ fontSize: '0.9rem' }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Drawer>

      {/* Menú Flotante de MUI (Solo visible cuando el Sidebar ESTÁ colapsado) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && isCollapsed}
        onClose={closeFloatMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{ elevation: 4, sx: { mt: -1, ml: 1, borderRadius: 2, minWidth: 200 } }}
      >
        <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
          <ListItemText 
            primary={menuConfig.find(m => m.id === activeFloatMenu)?.title} 
            primaryTypographyProps={{ fontWeight: 'bold', color: 'primary.main' }}
          />
        </Box>
        <Divider />
        {menuConfig.find(m => m.id === activeFloatMenu)?.children.map((child) => (
          <MenuItem 
            key={child.path} 
            onClick={() => handleNavigate(child.path)}
            selected={pathname === child.path}
            sx={{ py: 1.5 }}
          >
            <ListItemIcon sx={{ color: pathname === child.path ? 'primary.main' : 'inherit' }}>
              {child.icon}
            </ListItemIcon>
            <ListItemText primary={child.title} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default Sidebar;