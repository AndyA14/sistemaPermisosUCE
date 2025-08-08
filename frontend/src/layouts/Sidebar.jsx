import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlinePlus,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineUsers,
  HiOutlineHome,
  HiOutlineClipboard,
  HiOutlineSearch,
  HiOutlineCog,
  HiOutlineTrendingUp,
  HiOutlineUser,
  HiOutlineDocument
} from 'react-icons/hi';
import '../styles/layouts/Sidebar.css';

function Sidebar({ rol, isCollapsed }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  
  const [menuOpen, setMenuOpen] = useState({
    permisos: false,
    dashboard: false,
    tthh: false,
    dtic: false,
  });

  // Estado para el menú flotante cuando está colapsado
  const [floatingMenu, setFloatingMenu] = useState({
    isOpen: false,
    menu: null,
    position: { top: 0, left: 0 }
  });

  const toggleMenu = (menu, event) => {
    if (isCollapsed) {
      // Mostrar menú flotante
      const rect = event.currentTarget.getBoundingClientRect();
      setFloatingMenu({
        isOpen: !floatingMenu.isOpen || floatingMenu.menu !== menu,
        menu: menu,
        position: { 
          top: rect.top, 
          left: rect.right + 10 
        }
      });
      return;
    }
    setMenuOpen(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Cerrar todos los menús cuando se colapsa
  useEffect(() => {
    if (isCollapsed) {
      setMenuOpen({
        permisos: false,
        dashboard: false,
        tthh: false,
        dtic: false,
      });
    } else {
      setFloatingMenu({ isOpen: false, menu: null, position: { top: 0, left: 0 } });
    }
  }, [isCollapsed]);

  // Cerrar menú flotante al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (floatingMenu.isOpen && !event.target.closest('.floating-menu') && !event.target.closest('.sidebar-link')) {
        setFloatingMenu({ isOpen: false, menu: null, position: { top: 0, left: 0 } });
      }
    };

    if (floatingMenu.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [floatingMenu.isOpen]);

  const handleFloatingMenuClick = (route) => {
    navigate(route);
    setFloatingMenu({ isOpen: false, menu: null, position: { top: 0, left: 0 } });
  };

  const isActivePath = (path) => pathname.startsWith(path);

  const permisosRoles = ['docente', 'director', 'tthh', 'dti', 'admin'];
  const dashboardRoles = ['director', 'admin'];
  const tthhRoles = ['tthh', 'admin'];
  const dticRoles = ['dti', 'admin'];

  // Configuración de menús para el floating menu
  const menuConfig = {
    permisos: [
      { route: '/permisos/ver', icon: HiOutlineEye, text: 'Consultar Solicitudes' },
      { route: '/permisos/crear', icon: HiOutlinePlus, text: 'Nueva Solicitud' }
    ],
    dashboard: [
      { route: '/dashboard/resumen', icon: HiOutlineChartBar, text: 'Estadísticas de Solicitudes' },
      { route: '/dashboard/dashboard', icon: HiOutlineCheckCircle, text: 'Solicitudes por Aprobar' }
    ],
    tthh: [
      { route: '/listado-tthh/dashboard', icon: HiOutlineHome, text: 'Panel General' },
      { route: '/listado-tthh/informes', icon: HiOutlineClipboard, text: 'Generar Informes' },
      { route: '/listado-tthh/registro-solicitudes', icon: HiOutlineSearch, text: 'Revisión de Solicitudes' }
    ],
    dtic: [
      { route: '/dtic/dashboard', icon: HiOutlineHome, text: 'Panel General' },
      { route: '/dtic/informes', icon: HiOutlineTrendingUp, text: 'Generador de Reportes' },
      { route: '/dtic/gestion-usuarios', icon: HiOutlineUser, text: 'Gestión de Usuarios' },
      { route: '/dtic/tipo-permiso', icon: HiOutlineDocument, text: 'Tipos de Permiso' }
    ]
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ul className="sidebar-menu">

        {/* 🟢 Menú de Permisos (para la mayoría de usuarios) */}
        {permisosRoles.includes(rol) && (
          <li className="sidebar-menu-item">
            <div
              className={`sidebar-link ${isActivePath('/permisos') ? 'active' : ''}`}
              onClick={(e) => toggleMenu('permisos', e)}
              title={isCollapsed ? 'Mis Permisos - Clic para ver opciones' : ''}
            >
              <HiOutlineDocumentText className="sidebar-icon" />
              {!isCollapsed && (
                <>
                  <span className="sidebar-text">Mis Permisos</span>
                  <span className={`dropdown-arrow ${menuOpen.permisos ? 'open' : ''}`}>▾</span>
                </>
              )}
            </div>
            {menuOpen.permisos && !isCollapsed && (
              <ul className="submenu">
                <li>
                  <NavLink to="/permisos/ver" className="sidebar-link">
                    <HiOutlineEye className="sidebar-icon" />
                    <span className="sidebar-text">Consultar Solicitudes</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/permisos/crear" className="sidebar-link">
                    <HiOutlinePlus className="sidebar-icon" />
                    <span className="sidebar-text">Nueva Solicitud</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        )}

        {/* 🔵 Menú para Directores */}
        {dashboardRoles.includes(rol) && (
          <li className="sidebar-menu-item">
            <div
              className={`sidebar-link ${isActivePath('/dashboard') ? 'active' : ''}`}
              onClick={(e) => toggleMenu('dashboard', e)}
              title={isCollapsed ? 'Gestión Directiva - Clic para ver opciones' : ''}
            >
              <HiOutlineUserGroup className="sidebar-icon" />
              {!isCollapsed && (
                <>
                  <span className="sidebar-text">Gestión Directiva</span>
                  <span className={`dropdown-arrow ${menuOpen.dashboard ? 'open' : ''}`}>▾</span>
                </>
              )}
            </div>
            {menuOpen.dashboard && !isCollapsed && (
              <ul className="submenu">
                <li>
                  <NavLink to="/dashboard/resumen" className="sidebar-link">
                    <HiOutlineChartBar className="sidebar-icon" />
                    <span className="sidebar-text">Estadísticas de Solicitudes</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/dashboard" className="sidebar-link">
                    <HiOutlineCheckCircle className="sidebar-icon" />
                    <span className="sidebar-text">Solicitudes por Aprobar</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        )}

        {/* 🟡 Menú para Talento Humano */}
        {tthhRoles.includes(rol) && (
          <li className="sidebar-menu-item">
            <div
              className={`sidebar-link ${isActivePath('/listado-tthh') ? 'active' : ''}`}
              onClick={(e) => toggleMenu('tthh', e)}
              title={isCollapsed ? 'Talento Humano - Clic para ver opciones' : ''}
            >
              <HiOutlineUsers className="sidebar-icon" />
              {!isCollapsed && (
                <>
                  <span className="sidebar-text">Talento Humano</span>
                  <span className={`dropdown-arrow ${menuOpen.tthh ? 'open' : ''}`}>▾</span>
                </>
              )}
            </div>
            {menuOpen.tthh && !isCollapsed && (
              <ul className="submenu">
                <li>
                  <NavLink to="/listado-tthh/dashboard" className="sidebar-link">
                    <HiOutlineHome className="sidebar-icon" />
                    <span className="sidebar-text">Panel General</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/listado-tthh/informes" className="sidebar-link">
                    <HiOutlineClipboard className="sidebar-icon" />
                    <span className="sidebar-text">Generar Informes</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/listado-tthh/registro-solicitudes" className="sidebar-link">
                    <HiOutlineSearch className="sidebar-icon" />
                    <span className="sidebar-text">Revisión de Solicitudes</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        )}

        {/* 🔴 Menú para DTIC / Admin */}
        {dticRoles.includes(rol) && (
          <li className="sidebar-menu-item">
            <div
              className={`sidebar-link ${isActivePath('/dtic') ? 'active' : ''}`}
              onClick={(e) => toggleMenu('dtic', e)}
              title={isCollapsed ? 'Administración - Clic para ver opciones' : ''}
            >
              <HiOutlineCog className="sidebar-icon" />
              {!isCollapsed && (
                <>
                  <span className="sidebar-text">Administración del Sistema</span>
                  <span className={`dropdown-arrow ${menuOpen.dtic ? 'open' : ''}`}>▾</span>
                </>
              )}
            </div>
            {menuOpen.dtic && !isCollapsed && (
              <ul className="submenu">
                <li>
                  <NavLink to="/dtic/dashboard" className="sidebar-link">
                    <HiOutlineHome className="sidebar-icon" />
                    <span className="sidebar-text">Panel General</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dtic/informes" className="sidebar-link">
                    <HiOutlineTrendingUp className="sidebar-icon" />
                    <span className="sidebar-text">Generador de Reportes</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dtic/gestion-usuarios" className="sidebar-link">
                    <HiOutlineUser className="sidebar-icon" />
                    <span className="sidebar-text">Gestión de Usuarios</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dtic/tipo-permiso" className="sidebar-link">
                    <HiOutlineDocument className="sidebar-icon" />
                    <span className="sidebar-text">Tipos de Permiso</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        )}

      </ul>

      {/* Menú flotante para sidebar colapsado */}
      {floatingMenu.isOpen && isCollapsed && (
        <div 
          className="floating-menu"
          style={{
            position: 'fixed',
            top: floatingMenu.position.top,
            left: floatingMenu.position.left,
            zIndex: 1000
          }}
        >
          <div className="floating-menu-content">
            <h4 className="floating-menu-title">
              {floatingMenu.menu === 'permisos' && 'Mis Permisos'}
              {floatingMenu.menu === 'dashboard' && 'Gestión Directiva'}
              {floatingMenu.menu === 'tthh' && 'Talento Humano'}
              {floatingMenu.menu === 'dtic' && 'Administración del Sistema'}
            </h4>
            <ul className="floating-menu-list">
              {menuConfig[floatingMenu.menu]?.map((item, index) => (
                <li key={index}>
                  <button
                    className="floating-menu-item"
                    onClick={() => handleFloatingMenuClick(item.route)}
                  >
                    <item.icon className="floating-menu-icon" />
                    <span>{item.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
