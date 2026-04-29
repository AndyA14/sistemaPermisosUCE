import React from 'react';
import CartaLayout from './CartaLayout';

const CartaSeguimientoPermiso = ({ permiso }) => {
  if (!permiso) return null;

  const {
    usuario,
    tipo,
    descripcion,
    fecha_solicitud,
    fecha_inicio,
    fecha_fin,
    hora_inicio,
    hora_fin,
    estado_general,
  } = permiso;

  // Formateo de fechas para el párrafo (Ej: 26 de febrero de 2026)
  const fechaOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  
  // Añadimos 'T12:00:00' para evitar desfases de zona horaria al formatear
  const fInicioStr = fecha_inicio ? new Date(`${fecha_inicio}T12:00:00`).toLocaleDateString('es-EC', fechaOptions) : '';
  const fFinStr = fecha_fin ? new Date(`${fecha_fin}T12:00:00`).toLocaleDateString('es-EC', fechaOptions) : '';
  
  let periodoTexto = '';
  if (fecha_inicio && fecha_fin && fecha_inicio !== fecha_fin) {
      periodoTexto = `el período comprendido entre el ${fInicioStr} y el ${fFinStr}`;
  } else if (fecha_inicio) {
      periodoTexto = `el día ${fInicioStr}`;
  }

  let horasTexto = '';
  if (hora_inicio && hora_fin) {
      horasTexto = `, en el horario de ${hora_inicio} a ${hora_fin}`;
  }

  return (
    <CartaLayout fechaSolicitud={fecha_solicitud}>
      {/* DESTINATARIO */}
      <div style={{ marginBottom: '2rem', lineHeight: '1.5' }}>
        <p style={{ margin: 0 }}><strong>Señor:</strong></p>
        <p style={{ margin: 0 }}>Ph.D. (c) Wilson Patricio Chilouiza Vásquez</p>
        <p style={{ margin: 0 }}><strong>DIRECTOR DEL INSTITUTO ACADÉMICO DE IDIOMAS</strong></p>
        <p style={{ margin: 0 }}>Presente.-</p>
      </div>

      {/* SALUDO */}
      <p style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>De mi consideración:</p>

      {/* PÁRRAFO 1: Solicitud */}
      <p style={{ textAlign: 'justify', marginBottom: '1.5rem', lineHeight: '1.6' }}>
        Yo, <strong>{usuario?.nombres} {usuario?.apellidos}</strong>, portador(a) de la cédula de identidad N.º <strong>{usuario?.ci}</strong>, me dirijo a usted respetuosamente con el fin de justificar un(a) <strong>{tipo?.nombre?.toLowerCase() || 'permiso'}</strong> correspondiente a {periodoTexto}{horasTexto}.
      </p>

      {/* PÁRRAFO 2: Motivo */}
      <p style={{ textAlign: 'justify', marginBottom: '1.5rem', lineHeight: '1.6' }}>
        Dicha inasistencia se debió a <em>{tipo?.sub_tipo ? tipo.sub_tipo.toLowerCase() : 'motivos personales'}</em>. {descripcion ? `${descripcion}` : ''}
      </p>

      {/* PÁRRAFO 3: Cierre */}
      <p style={{ textAlign: 'justify', marginBottom: '1.5rem', lineHeight: '1.6' }}>
        Solicito se considere la presente justificación y quedo atento(a) para proporcionar documentación adicional si fuese requerida.
      </p>

      <p style={{ marginBottom: '3rem', fontStyle: 'italic' }}>
        Agradezco su comprensión y colaboración.
      </p>

      {/* FIRMA Y DATOS DEL SOLICITANTE */}
      <div style={{ lineHeight: '1.5' }}>
        <p style={{ margin: 0 }}>Atentamente,</p>
        <p style={{ margin: 0, marginTop: '2.5rem' }}><strong>{usuario?.nombres} {usuario?.apellidos}</strong></p>
        <p style={{ margin: 0 }}>{usuario?.rol ? usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1) : 'Usuario'}</p>
        <p style={{ margin: 0 }}>C.I.: {usuario?.ci}</p>
        <p style={{ margin: 0 }}>Correo: {usuario?.correo}</p>
        <p style={{ margin: 0 }}>Teléfono: {usuario?.telefono}</p>
        <p style={{ margin: 0 }}>Dirección: {usuario?.direccion || 'Quito'}</p>
      </div>

      {/* MINI SELLO DE ESTADO (Para no perder la trazabilidad) */}
      <div style={{ 
        marginTop: '3rem', 
        borderTop: '1px solid #e2e8f0', 
        paddingTop: '1rem', 
        fontSize: '0.85rem', 
        color: '#64748b',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span><strong>Estado en Sistema:</strong> {estado_general?.toUpperCase()}</span>
        <span><em>Documento digital generado por el Sistema de Permisos</em></span>
      </div>
    </CartaLayout>
  );
};

export default CartaSeguimientoPermiso;