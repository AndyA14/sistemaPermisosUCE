import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import SolicitarReset from './pages/SolicitarReset';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

import LayoutPrincipal from './layouts/LayoutPrincipal';
import PrivateRoute from './routes/PrivateRoute';
import { isAuthenticated, getRol } from './utils/auth';

// Componentes por rol
import MisSolicitudes from './components/Usuarios/MisSolicitudes';
import PermisosForm from './components/Usuarios/PermisosForm';

import SolicitudesDirector from './components/Director/SolicitudesDirector.jsx';

import DashboardTTHH from './components/Usuarios/Dashboard.jsx';
import RegistroSolicitudes from './components/TTHH/RegistroSolicitudes';
import SolicitudesTTHH from './components/TTHH/SolicitudesTTHH';

import ReportesDTIC from './components/DTIC/ReportesDTIC.jsx';
import GestionUsuarios from './components/DTIC/GestionUsuarios';
import TipoPermisoGestion from './components/DTIC/TipoPermisoGestion';
import GenerarCertificado from './components/Admin/GenerarCertificado'; // Ajusta la carpeta según dónde lo guardaste

// Comunes
import VistaEvidencia from './components/Usuarios/Evidencia/VistaEvidencia';
import Perfil from './pages/Perfil';

// IMPORTACIÓN DEL CONTENEDOR DE NOTIFICACIONES MAESTRO
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';

// Componente para redireccionar según rol después de login
const DefaultRoute = () => {
  if (!isAuthenticated()) return <Navigate to="/login" />;
  const rol = getRol();
  console.log('Rol detectado:', rol); // 👈🏼 esto te ayuda a ver si hay un problema

  switch (rol) {
    case 'docente':
      return <Navigate to="/permisos/ver" />;
    case 'director':
      return <Navigate to="/dashboard/resumen" />;
    case 'tthh':
      return <Navigate to="/listado-tthh/dashboard" />;
    case 'dti':
      return <Navigate to="/dtic/dashboard" />;
    case 'admin':
      return <Navigate to="/permisos/ver" />;
    default:
      return <Navigate to="/unauthorized" />;
  }
};


// Wrapper para proteger rutas por rol
const ProtectedRoutes = ({ roles, children }) => (
  <PrivateRoute roles={roles}>{children}</PrivateRoute>
);

function App() {
  return (
    <>
      {/* 
        CONTENEDOR MAESTRO DE NOTIFICACIONES
        Puesto aquí atrapa las de TODA la aplicación.
        El marginTop de 65px hace que baje lo suficiente para no tapar 
        el botón de perfil ni el modo oscuro de la barra azul.
      */}
      <ToastContainer 
        position="top-right" 
        autoClose={3500} 
        hideProgressBar={false} 
        theme="colored" 
        style={{ marginTop: '65px' }} 
      />

      <Router>
        <Routes>

          {/* Rutas públicas */}
          <Route path="/" element={<Navigate to="/inicio" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/solicitar-reset" element={<SolicitarReset />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/inicio" element={<DefaultRoute />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Rutas protegidas dentro del layout principal */}
          <Route path="/" element={<LayoutPrincipal />}>

            {/* 🔐 Rutas compartidas para TODOS los roles */}
            <Route element={<ProtectedRoutes roles={['docente', 'director', 'tthh', 'dti', 'admin']} />}>
              <Route path="permisos/ver" element={<MisSolicitudes />} />
              <Route path="permisos/crear" element={<PermisosForm />} />
              <Route path="perfil" element={<Perfil />} />
              <Route path="/uploads/documentos/:nombreArchivo" element={<VistaEvidencia />} />
            </Route>

            <Route element={<ProtectedRoutes roles={['tthh', 'admin']} />}>
              <Route path="listado-tthh/dashboard" element={<DashboardTTHH />} />
              <Route path="listado-tthh/informes" element={<RegistroSolicitudes />} />
              <Route path="listado-tthh/registro-solicitudes" element={<SolicitudesTTHH />} />
            </Route>

            <Route element={<ProtectedRoutes roles={['dti', 'admin']} />}>
              <Route path="dtic/dashboard" element={<DashboardTTHH />} />
              <Route path="dtic/informes" element={<ReportesDTIC />} />
              <Route path="dtic/gestion-usuarios" element={<GestionUsuarios />} />
              <Route path="dtic/tipo-permiso" element={<TipoPermisoGestion />} />
            </Route>

            {/* 🎯 Rutas por rol específicas */}
            <Route element={<ProtectedRoutes roles={['director', 'admin']} />}>
              <Route path="dashboard/resumen" element={<DashboardTTHH />} />
              <Route path="dashboard/dashboard" element={<SolicitudesDirector />} />
            </Route>

            {/* 👑 Rutas exclusivas del Administrador */}
            <Route element={<ProtectedRoutes roles={['admin']} />}>
              <Route path="admin/generar-certificado" element={<GenerarCertificado />} />
            </Route>

          </Route>

          {/* Página no encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;