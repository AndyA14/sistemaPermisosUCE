// src/routes/PrivateRoute.jsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { isAuthenticated, getRol } from '../utils/auth';

const ProtectedRoutes = ({ roles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  const rolUsuario = getRol();
  if (roles && !roles.includes(rolUsuario)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
