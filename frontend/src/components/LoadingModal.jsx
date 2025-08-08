import React from 'react';
import '../styles/LoadingModal.css';

/**
 * Componente que muestra un modal de carga
 * @param {boolean} visible - true para mostrar el modal
 */
function LoadingModal({ visible }) {
  if (!visible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="spinner" />
        <p>Cargando...</p>
      </div>
    </div>
  );
}

export default LoadingModal;
