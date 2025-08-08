// utils/renderEstado.js
import React from 'react';

/**
 * Devuelve un span con clase estilizada según el estado.
 * @param {string} estado_general - El estado del permiso
 * @returns {JSX.Element} Elemento <span> estilizado
 */
export function renderEstado(estado_general) {
  if (!estado_general) {
    return <span className="estado estado-otro">Desconocido</span>;
  }

  let clase = '';
  let texto = '';

  switch (estado_general.toLowerCase()) {
    case 'pendiente':
      clase = 'estado-pendiente';
      texto = 'Pendiente';
      break;
    case 'autorizado':
    case 'aprobado':
      clase = 'estado-aprobado';
      texto = 'Aprobado';
      break;
    case 'en_revision':
    case 'en revisión':
      clase = 'estado-en-revision';
      texto = 'En Revisión';
      break;
    case 'denegado':
    case 'rechazado':
      clase = 'estado-rechazado';
      texto = 'Rechazado';
      break;
    default:
      clase = 'estado-otro';
      texto = estado_general;
  }

  return <span className={`estado ${clase}`}>{texto}</span>;
}
