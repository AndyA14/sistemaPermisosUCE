import React from 'react';
import CartaLayout from './CartaLayout';

/**
 * Carta formal para justificar una falta, con redacción clara y adaptada al subtipo y descripción.
 */
const CartaFalta = ({ perfil, form, archivo, tipoSeleccionado }) => {
  if (!perfil || !form) return null;

  // Formatea una fecha legible
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return null;
    const date = new Date(fechaStr + 'T00:00:00');
    return date.toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const fechaInicio = formatearFecha(form.fecha_inicio);
  const fechaFin = formatearFecha(form.fecha_fin);

  const textoFecha =
    fechaInicio && fechaFin
      ? fechaInicio === fechaFin
        ? fechaInicio
        : `el período comprendido entre el ${fechaInicio} y el ${fechaFin}`
      : '(fecha no especificada)';

  // Motivo de la falta, usando subtipo y/o descripción
  const textoFalta = obtenerTextoTipoFalta(form.subtipo, archivo, tipoSeleccionado);
  const descripcion = form.descripcion?.trim();

  return (
    <CartaLayout fecha={form.fecha_inicio}>
      <div className="saludo">De mi consideración:</div>

      <div className="contenido-justificado">
        <p>
          Yo, <strong>{perfil.nombres} {perfil.apellidos}</strong>, portador(a) de la cédula de identidad N.° <strong>{perfil.ci}</strong>, me dirijo a usted respetuosamente con el fin de justificar una <strong>falta</strong> correspondiente a {textoFecha}.
        </p>

        {(descripcion || textoFalta) && (
          <p>
            Dicha inasistencia se debió a <em>{formatearMotivo(textoFalta, descripcion)}</em>.
          </p>
        )}

        <p>
          Solicito se considere la presente justificación y quedo atento(a) para proporcionar documentación adicional si fuese requerida.
        </p>
      </div>

      <p className="agradecimiento-derecha">
        Agradezco su comprensión y colaboración.
      </p>

      <Firma perfil={perfil} />
    </CartaLayout>
  );
};

/**
 * Devuelve un texto amigable para el subtipo, considerando si hay respaldo.
 */
const obtenerTextoTipoFalta = (subtipo, archivo, tipoSeleccionado) => {
  const etiqueta = tipoSeleccionado?.sub_tipos?.find(s => s.value === subtipo)?.label || subtipo;

  if (!etiqueta) return '';

  switch (subtipo) {
    case 'cita_medica':
    case 'reposo_medico':
      return archivo
        ? `${etiqueta.toLowerCase()} (con respaldo adjunto)`
        : etiqueta.toLowerCase();
    default:
      return etiqueta.toLowerCase();
  }
};

/**
 * Combina subtipo y descripción para un texto claro.
 */
const formatearMotivo = (etiqueta = '', descripcion = '') => {
  if (etiqueta && descripcion) {
    return `${etiqueta}. ${descripcion.replace(/\.$/, '')}.`;
  }
  return (etiqueta || descripcion || 'motivos personales').replace(/\.$/, '') + '.';
};

/**
 * Firma del solicitante con todos sus datos.
 */
const Firma = ({ perfil }) => (
  <div className="firma-derecha">
    <p>Atentamente,</p>
    <p><strong>{perfil.nombres} {perfil.apellidos}</strong></p>
    <p>{perfil.cargo || 'Usuario'}</p>
    <p>C.I.: {perfil.ci}</p>
    <p>Correo: {perfil.correo}</p>
    <p>Teléfono: {perfil.telefono}</p>
    <p>Dirección: {perfil.direccion}</p>
  </div>
);

export default CartaFalta;
