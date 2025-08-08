import React from 'react';

const CartaLayout = ({ children, fechaSolicitud }) => {
  const fechaFormateada = fechaSolicitud
  ? new Date(`${fechaSolicitud}T00:00:00`).toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  : '';

  return (
    <div className="carta-layout">
      <header className="carta-encabezado">
        <img
          src="/logoIAI.png"
          alt="Logo Instituto"
          className="logo-instituto"
          style={{ width: 80, height: 80, marginBottom: '1rem' }}
        />
        <p><strong>INSTITUTO ACADÉMICO DE IDIOMAS</strong></p>
        <p><strong>UNIVERSIDAD CENTRAL DEL ECUADOR</strong></p>
      </header>
      <div style={{ textAlign: 'right', marginBottom: '1rem', fontStyle: 'italic' }}>
        Quito, {fechaFormateada}
      </div>
      <section className="carta-contenido">{children}</section>
    </div>
  );
};

export default CartaLayout;
