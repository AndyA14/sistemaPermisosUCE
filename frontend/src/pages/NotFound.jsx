import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <div className="notfound-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="4" fill="none" />
            <line x1="20" y1="20" x2="44" y2="44" stroke="currentColor" strokeWidth="4" />
            <line x1="44" y1="20" x2="20" y2="44" stroke="currentColor" strokeWidth="4" />
          </svg>
        </div>
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">Página no encontrada</h2>
        <p className="notfound-message">
          La ruta que estás intentando acceder no existe o ha sido movida.
        </p>
        <Link to="/" className="notfound-button">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
