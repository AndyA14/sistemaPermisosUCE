// components/PlantillasCartas/CartaLayout.jsx
import React from 'react';

const CartaLayout = ({ children }) => (
  <div className="modal-contenido1">
    <div className="carta-encabezado">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlG2ZniQvzJjbix-fZIaIFJ-gfn3bm6fhHkg&s"
        alt="Logo Instituto"
        className="logo-instituto"
        style={{ width: 90, height: 90 }}
      />
      <p><strong>INSTITUTO ACADÉMICO DE IDIOMAS</strong></p>
      <p><strong>UNIVERSIDAD CENTRAL DEL ECUADOR</strong></p>
    </div>

    <p className="fecha-derecha">
        Quito,{' '}
        {new Date().toLocaleDateString('es-EC', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })}
    </p>

    <div className="destinatario-derecha">
      <p><strong>Señor:</strong></p>
      <p>Ph.D. (c) Wilson Patricio Chiluiza Vásquez</p>
      <p><strong>DIRECTOR DEL INSTITUTO ACADÉMICO DE IDIOMAS</strong></p>
      <p>Presente.-</p>
    </div>

    {children}
  </div>
);

export default CartaLayout;
