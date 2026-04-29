import React from 'react';
import CartaLayout from './CartaLayout';

const CartaOtros = ({ perfil, form, archivo }) => {
  if (!perfil) return null;

  const fechaMostrada = form?.fecha || '________';
  const descripcion = form?.descripcion?.trim();

  return (
    <CartaLayout fecha={fechaMostrada}>
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
          <p style={{ color: '#94a3b8' }}>
            [Aquí aparecerá la descripción del motivo que usted redacte...]
          </p>
        )}

        {archivo && (
          <p style={{ color: '#27ae60', fontWeight: 'bold' }}>
            ✓ Se adjunta un documento como respaldo adicional para su consideración.
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

const Firma = ({ perfil }) => (
  <div className="firma-derecha">
    <p>Atentamente,</p>
    <p style={{ marginTop: '2.5rem' }}><strong>{perfil.nombres} {perfil.apellidos}</strong></p>
    <p>{perfil.rol ? (perfil.rol.charAt(0).toUpperCase() + perfil.rol.slice(1)) : 'Usuario'}</p>
    <p>C.I.: {perfil.ci}</p>
    <p>Correo: {perfil.correo}</p>
    <p>Teléfono: {perfil.telefono}</p>
    <p>Dirección: {perfil.direccion || 'Quito'}</p>
  </div>
);

export default CartaOtros;