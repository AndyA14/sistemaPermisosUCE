import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Unauthorized.css';

function Unauthorized() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/'); // Cambia la ruta si necesitas ir a /login u otra
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <h2 className="unauthorized-title">Acceso no autorizado</h2>
        <p className="unauthorized-message">
          No tienes permisos para acceder a esta sección.
        </p>
        <button className="unauthorized-button" onClick={handleBack}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default Unauthorized;
