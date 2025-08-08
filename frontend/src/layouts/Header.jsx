import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineMenu, HiOutlineSun, HiOutlineMoon, HiOutlineDesktopComputer } from 'react-icons/hi';
import { logoutUsuario } from '../utils/auth';
import { getCurrentTheme, getEffectiveTheme, setTheme, THEMES } from '../utils/theme';
import '../styles/layouts/Header.css';

function Header({ toggleSidebar, isSidebarCollapsed }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(getCurrentTheme());
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Alterna visibilidad del menú
  const toggleMenu = () => setMenuOpen(prev => !prev);

  // Cerrar menú si se hace click fuera (mejora UX)
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Actualizar estado del tema cuando cambie externamente
  useEffect(() => {
    const updateTheme = () => {
      setCurrentTheme(getCurrentTheme());
    };
    
    // Escuchar cambios en localStorage para sincronizar entre pestañas
    window.addEventListener('storage', updateTheme);
    return () => window.removeEventListener('storage', updateTheme);
  }, []);

  const handleLogout = () => {
    logoutUsuario();
    navigate('/login');
  };

  // Manejar cambio de tema
  const handleThemeChange = (theme) => {
    setTheme(theme);
    setCurrentTheme(theme);
    setMenuOpen(false);
  };

  // Obtener icono del tema actual
  const getThemeIcon = () => {
    const effective = getEffectiveTheme();
    switch (effective) {
      case THEMES.DARK:
        return <HiOutlineMoon className="theme-icon" />;
      case THEMES.LIGHT:
        return <HiOutlineSun className="theme-icon" />;
      default:
        return <HiOutlineSun className="theme-icon" />;
    }
  }


  return (
    <header className="layout-header">
      <div className="header-left">
        <button 
          className="sidebar-toggle-btn" 
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          <HiOutlineMenu className={`toggle-icon ${isSidebarCollapsed ? 'collapsed' : ''}`} />
        </button>
        <img src="/logoIAI.png" alt="Logo del sistema" className="app-icon" />
        <h1 className="layout-header-title">Sistema de Permisos para Personal</h1>
      </div>

      <div className="header-right" ref={menuRef}>
        <button
          className="menu-button"
          onClick={toggleMenu}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-label="Menú de usuario"
        >
          ☰
        </button>

        <button
          className="theme-toggle-btn"
          onClick={() => handleThemeChange(getEffectiveTheme() === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT)}
          aria-label="Cambiar tema"
          title={`Cambiar a modo ${getEffectiveTheme() === THEMES.LIGHT ? 'oscuro' : 'claro'}`}
        >
          {getThemeIcon()}
        </button>

        {menuOpen && (
          <ul className="dropdown-menu" role="menu">
            <li className="theme-submenu" role="none">
              <span className="submenu-label">Tema</span>
              <div className="theme-options">
                <button
                  onClick={() => handleThemeChange(THEMES.LIGHT)}
                  className={`theme-option ${currentTheme === THEMES.LIGHT ? 'active' : ''}`}
                  role="menuitem"
                  title="Modo claro"
                >
                  <HiOutlineSun />
                  <span>Claro</span>
                </button>
                <button
                  onClick={() => handleThemeChange(THEMES.DARK)}
                  className={`theme-option ${currentTheme === THEMES.DARK ? 'active' : ''}`}
                  role="menuitem"
                  title="Modo oscuro"
                >
                  <HiOutlineMoon />
                  <span>Oscuro</span>
                </button>
                <button
                  onClick={() => handleThemeChange(THEMES.SYSTEM)}
                  className={`theme-option ${currentTheme === THEMES.SYSTEM ? 'active' : ''}`}
                  role="menuitem"
                  title="Seguir sistema"
                >
                  <HiOutlineDesktopComputer />
                  <span>Sistema</span>
                </button>
              </div>
            </li>
            <li role="none">
              <Link to="/perfil" onClick={() => setMenuOpen(false)} role="menuitem" tabIndex={0}>
                Perfil
              </Link>
            </li>
            <li role="none">
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="logout-btn"
                role="menuitem"
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        )}
      </div>
    </header>
  );
}

export default Header;
