import React from 'react';
import CartaLayout from './CartaLayout';

/**
 * Carta formal para justificar
 * la omisión de timbrado.
 */
const CartaSinTimbrar = ({
  perfil,
  form,
  tipoSeleccionado,
  nombreAdjunto, // ← agregado
}) => {
  if (!perfil || !form) return null;

  const textoMotivo = construirTextoMotivo(
    form,
    tipoSeleccionado
  );

  const descripcion = form.descripcion?.trim();

  return (
    // ← nombreAdjunto enviado al layout
    <CartaLayout
      fecha={form.fecha}
      nombreAdjunto={nombreAdjunto}
    >
      <div className="saludo">
        De mi consideración:
      </div>

      <div className="contenido-justificado">
        <p>
          Yo, <strong>{perfil.nombres} {perfil.apellidos}</strong>,
          portador(a) de la cédula de identidad N.°
          <strong> {perfil.ci}</strong>,
          me dirijo a usted con el propósito de justificar que el día
          <strong> {form.fecha}</strong> {textoMotivo}
        </p>

        {descripcion && (
          <p>
            Lo anterior se debió a la siguiente razón:{' '}
            <em>
              {descripcion.replace(/\.$/, '')}.
            </em>
          </p>
        )}

        <p>
          Presento esta justificación de manera responsable y me comprometo
          a evitar futuras omisiones en los registros correspondientes.
        </p>
      </div>

      <p className="agradecimiento-derecha">
        Agradezco su comprensión y quedo atento(a) a cualquier requerimiento
        adicional.
      </p>

      <Firma perfil={perfil} />
    </CartaLayout>
  );
};

/**
 * Genera texto explicativo
 * según el tipo de timbrado omitido.
 */
const construirTextoMotivo = (
  form,
  tipoSeleccionado
) => {
  const labelEntrada =
    tipoSeleccionado?.sub_tipos?.find(
      (s) => s.value === 'entrada'
    )?.label || 'Entrada';

  const labelSalida =
    tipoSeleccionado?.sub_tipos?.find(
      (s) => s.value === 'salida'
    )?.label || 'Salida';

  let texto = '';

  if (form.no_entrada && form.no_salida) {
    texto =
      `no se registró el timbrado correspondiente ` +
      `tanto a la ${labelEntrada.toLowerCase()} ` +
      `como a la ${labelSalida.toLowerCase()}`;
  } else if (form.no_entrada) {
    texto =
      `no se registró el timbrado correspondiente ` +
      `a la ${labelEntrada.toLowerCase()}`;
  } else if (form.no_salida) {
    texto =
      `no se registró el timbrado correspondiente ` +
      `a la ${labelSalida.toLowerCase()}`;
  } else {
    texto =
      'se presentó una irregularidad en el registro de timbrado';
  }

  /**
   * Añadir horario si aplica
   */
  if (
    form.no_entrada &&
    !form.no_salida &&
    form.hora_inicio
  ) {
    texto +=
      `, siendo la hora de ingreso registrada ` +
      `a las ${form.hora_inicio}`;
  } else if (
    !form.no_entrada &&
    form.no_salida &&
    form.hora_fin
  ) {
    texto +=
      `, siendo la hora de salida registrada ` +
      `a las ${form.hora_fin}`;
  } else if (
    form.no_entrada &&
    form.no_salida &&
    form.hora_inicio &&
    form.hora_fin
  ) {
    texto +=
      `, con un horario comprendido entre ` +
      `las ${form.hora_inicio} y las ${form.hora_fin}`;
  }

  return texto + '.';
};

/**
 * Firma del solicitante.
 */
const Firma = ({ perfil }) => (
  <div className="firma-derecha">
    <p>Atentamente,</p>

    <p>
      <strong>
        {perfil.nombres} {perfil.apellidos}
      </strong>
    </p>

    <p>{perfil.cargo || 'Usuario'}</p>

    <p>C.I.: {perfil.ci}</p>

    <p>Correo: {perfil.correo}</p>

    <p>Teléfono: {perfil.telefono}</p>

    <p>Dirección: {perfil.direccion}</p>
  </div>
);

export default CartaSinTimbrar;