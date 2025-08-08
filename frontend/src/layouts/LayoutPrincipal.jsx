// LayoutPrincipal.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { getRol } from '../utils/auth';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import '../styles/layouts/LayoutPrincipal.css';

function LayoutPrincipal() {
  const rol = getRol();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="layout-principal">
      <Header toggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
      <div className="layout-content">
        <Sidebar rol={rol} isCollapsed={isSidebarCollapsed} />
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default LayoutPrincipal;
