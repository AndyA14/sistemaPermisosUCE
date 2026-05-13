import React from 'react';

const CartaLayout = ({ children, nombreAdjunto, fechaSolicitud }) => (
  <div className="modal-contenido1">
    
    {/* 🌟 MAGIA CSS: Compactamos todo para forzar 1 sola página */}
    <style>{`
      .modal-contenido1 {
        font-size: 11pt !important;
        line-height: 1.3 !important;
      }
      .modal-contenido1 p {
        margin-bottom: 0.5rem !important; /* Reducimos el espacio entre párrafos */
      }
      .destinatario-derecha p, .firma-derecha p {
        margin-bottom: 0.1rem !important; /* Juntamos las líneas de nombres y cargos */
      }
      .carta-encabezado img {
        width: 70px !important;
        height: 70px !important;
        margin-bottom: 0.2rem !important;
      }
      .carta-encabezado p {
        margin: 0 !important;
      }
    `}</style>

    <div className="carta-encabezado" style={{ textAlign: 'center', marginBottom: '1rem' }}>
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlG2ZniQvzJjbix-fZIaIFJ-gfn3bm6fhHkg&s"
        alt="Logo Instituto"
        className="logo-instituto"
      />
      <p><strong>INSTITUTO ACADÉMICO DE IDIOMAS</strong></p>
      <p><strong>UNIVERSIDAD CENTRAL DEL ECUADOR</strong></p>
    </div>

    <p className="fecha-derecha" style={{ textAlign: 'right', marginBottom: '1rem' }}>
        Quito,{' '}
        {fechaSolicitud 
          ? new Date(`${fechaSolicitud}T12:00:00`).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })
          : new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })
        }
    </p>

    <div className="destinatario-derecha" style={{ marginBottom: '1rem' }}>
      <p><strong>Señor:</strong></p>
      <p>Ph.D. (c) Wilson Patricio Chilouiza Vásquez</p>
      <p><strong>DIRECTOR DEL INSTITUTO ACADÉMICO DE IDIOMAS</strong></p>
      <p>Presente.-</p>
    </div>

    {/* Aquí va el contenido de la carta (saludo, cuerpo, firma) */}
    {children}

    {/* 🌟 AQUÍ ESTÁ EL BLOQUE DEL ANEXO QUE FALTABA */}
    {nombreAdjunto && (
      <div style={{ marginTop: '15px', fontSize: '10pt', fontFamily: '"Times New Roman", Times, serif', textAlign: 'left', color: '#2c3e50' }}>
        <p style={{ margin: 0 }}><strong>- Anexo:</strong></p>
        <p style={{ margin: 0, marginLeft: '20px' }}>Adjunto: <em>{nombreAdjunto}</em></p>
      </div>
    )}
  </div>
);

export default CartaLayout;