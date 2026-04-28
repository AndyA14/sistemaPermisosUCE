import React from 'react';
import CartaLayout from './CartaLayout';

const CartaSeguimientoPermiso = ({ permiso }) => {
  if (!permiso) return null;

  const {
    usuario,
    tipo,
    descripcion,
    estado_general,
    observacion_tthh,
    fecha_revision_tthh,
    respuesta_director,
    fecha_revision_director,
    fecha_solicitud,
    fecha_inicio,
    fecha_fin,
    hora_inicio,
    hora_fin,
    carga_vacaciones,
  } = permiso;

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleString('es-EC', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <CartaLayout fechaSolicitud={fecha_solicitud}>
      <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Seguimiento de Solicitud de Permiso ({tipo?.nombre || 'Desconocido'}{tipo?.sub_tipo ? ` - ${tipo.sub_tipo}` : ''})
      </h3>

      {/* 🚨 PROTECCIÓN APLICADA AQUÍ 🚨 */}
      <p>
        <strong>Solicitante:</strong> {usuario?.nombres || 'Usuario'} {usuario?.apellidos || 'Desconocido'} (<strong>CI:</strong> {usuario?.ci || 'N/A'})
      </p>
      
      <p><strong>Tipo de Permiso:</strong> {tipo?.nombre || 'Desconocido'}{tipo?.sub_tipo ? ` - ${tipo.sub_tipo}` : ''}</p>
      <p><strong>Fecha/Fechas:</strong> {fecha_inicio || '—'} {fecha_inicio !== fecha_fin ? `hasta ${fecha_fin || '—'}` : ''}</p>
      <p><strong>Horas:</strong> {hora_inicio || '—'} a {hora_fin || '—'}</p>
      <p><strong>Motivo:</strong> <em>{descripcion || '—'}</em></p>
      <p><strong>Estado General:</strong> {estado_general?.toUpperCase() || 'DESCONOCIDO'}</p>
      <p><strong>Carga a Vacaciones:</strong> {carga_vacaciones ? 'Sí' : 'No'}</p>

      <hr />

      <h4>Revisión Talento Humano</h4>
      <p><strong>Estado de Revisión:</strong> {permiso?.revisado_tthh ? '✔️ Revisado' : '⏳ Pendiente'}</p>
      <p><strong>Fecha de Revisión:</strong> {formatFecha(fecha_revision_tthh)}</p>
      <p><strong>Observación:</strong> <em>{observacion_tthh || '—'}</em></p>

      <h4>Revisión Dirección</h4>
      <p><strong>Estado de Revisión:</strong> {
        permiso?.estado_director === true 
          ? '✔️ Revisado' 
          : permiso?.estado_director === false 
            ? '❌ Denegado (revisado)' 
            : '⏳ Pendiente'
      }</p>
      <p><strong>Fecha de Revisión:</strong> {formatFecha(fecha_revision_director)}</p>
      <p><strong>Respuesta del Director:</strong> <em>{respuesta_director || '—'}</em></p>

      <hr />

      <p className="agradecimiento-derecha">Esta información es una vista del seguimiento completo de tu solicitud.</p>
    </CartaLayout>
  );
};

export default CartaSeguimientoPermiso;