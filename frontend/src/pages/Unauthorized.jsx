import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Unauthorized.css';

function Unauthorized() {
  const navigate = useNavigate();

  const handleHome = () => navigate('/');

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-card__icons">
          <div className="unauthorized-card__icon-lock">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 2a6 6 0 0 0-6 6v4H5v10h14V12h-1V8a6 6 0 0 0-6-6zm0 2a4 4 0 0 1 4 4v4H8V8a4 4 0 0 1 4-4zm-1 7h2v4h-2v-4z"/>
            </svg>
          </div>
          <div className="unauthorized-card__icon-warning">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v2h2v-2zm0-8h-2v6h2v-6z"/>
            </svg>
          </div>
        </div>

        <h2 className="unauthorized-card__title">Acceso No Autorizado</h2>
        <p className="unauthorized-card__message">
          No tienes permisos para acceder a esta sección.
        </p>
        <p className="unauthorized-card__info">
          Si crees que esto es un error, contacta con el administrador de tu sistema
          o verifica tus credenciales.
        </p>

        <div className="unauthorized-card__buttons">
          <button className="unauthorized-card__button secondary" onClick={handleHome}>
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
