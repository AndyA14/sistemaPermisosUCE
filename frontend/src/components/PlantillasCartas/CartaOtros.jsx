import React from 'react';
import CartaLayout from './CartaLayout';

/**
 * Carta general para justificar un motivo clasificado como "Otros".
 * Redacción formal y adaptable según lo que escriba el usuario.
 */
const CartaOtros = ({ perfil, form, archivo }) => {
  if (!perfil || !form) return null;

  const descripcion = form.descripcion?.trim();

  return (
    <CartaLayout fecha={form.fecha}>
      <div className="saludo">De mi consideración:</div>

      <div className="contenido-justificado">
        <p>
          Yo, <strong>{perfil.nombres} {perfil.apellidos}</strong>, portador(a) de la cédula de identidad N.° <strong>{perfil.ci}</strong>, me dirijo a usted de manera respetuosa para informar lo siguiente:
        </p>

        {descripcion ? (
          <p>
            <em>{descripcion.replace(/\.$/, '')}.</em>
          </p>
        ) : (
          <p>
            Presento esta comunicación para dejar constancia de una situación particular, correspondiente a la fecha {form.fecha}.
          </p>
        )}

        {archivo && (
          <p>
            Se adjunta un documento como respaldo adicional para su consideración.
          </p>
        )}

        <p>
          Agradezco su atención a la presente y quedo atento(a) para cualquier aclaración o documentación adicional que se requiera.
        </p>
      </div>

      <Firma perfil={perfil} />
    </CartaLayout>
  );
};

/**
 * Firma del solicitante con datos completos.
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

export default CartaOtros;
