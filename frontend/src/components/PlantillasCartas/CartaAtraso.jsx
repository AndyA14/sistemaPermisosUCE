import React from 'react';
import CartaLayout from './CartaLayout';

/**
 * Carta formal para justificar un atraso, con redacción adaptada al motivo registrado.
 */
const CartaAtraso = ({ perfil, form, tipoSeleccionado }) => {
  if (!perfil || !form) return null;

  const fechaLegible = form.fecha
    ? new Date(`${form.fecha}T00:00:00`).toLocaleDateString('es-EC', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '(fecha no especificada)';

  const textoMotivo = generarTextoMotivo(form.subtipo, form.descripcion, tipoSeleccionado);

  return (
    <CartaLayout fecha={form.fecha}>
      <div className="saludo">De mi consideración:</div>

      <div className="contenido-justificado">
        <p>
          Yo, <strong>{perfil.nombres} {perfil.apellidos}</strong>, portador(a) de la cédula de identidad N.° <strong>{perfil.ci}</strong>, me dirijo a usted de manera respetuosa con el fin de justificar un <strong>atraso</strong> ocurrido el día <strong>{fechaLegible}</strong>, habiendo registrado mi ingreso a las <strong>{form.hora_inicio || '00:00'}</strong>.
        </p>

        {textoMotivo && (
          <p>
            El motivo de dicho retraso se debe a <em>{textoMotivo}</em>.
          </p>
        )}

        <p>
          Ofrezco disculpas por los inconvenientes que este retraso pudiera haber ocasionado y me comprometo a tomar las medidas necesarias para evitar que se repita en el futuro.
        </p>
      </div>

      <p className="agradecimiento-derecha">
        Agradezco su comprensión y quedo atento(a) a cualquier observación que se considere pertinente.
      </p>

      <Firma perfil={perfil} />
    </CartaLayout>
  );
};

/**
 * Genera el texto formal del motivo combinando subtipo y/o descripción según disponibilidad.
 */
const generarTextoMotivo = (subtipo = '', descripcion = '', tipoSeleccionado) => {
  const etiqueta = tipoSeleccionado?.sub_tipos?.find(s => s.value === subtipo)?.label || '';

  if (descripcion && descripcion.trim().length > 0) {
    // Si hay descripción, usarla directamente
    return descripcion.trim().replace(/\.$/, '') + '.';
  }

  // Si no hay descripción, usar etiqueta o texto por defecto
  return etiqueta ? etiqueta.toLowerCase() : 'motivos personales';
};

/**
 * Firma con los datos completos del solicitante.
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

export default CartaAtraso;
