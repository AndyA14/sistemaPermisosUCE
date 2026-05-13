import React from 'react';
import CartaLayout from '../CartaLayout';

const CartaSeguimientoPermiso = ({ permiso, nombreAdjunto }) => {
  if (!permiso) return null;

  // 🌟 AUTODESCUBRIMIENTO INFALIBLE DEL ADJUNTO
  let nombreDelAdjuntoFinal = nombreAdjunto;

  // 1️⃣ Buscamos en el arreglo "documentos"
  if (!nombreDelAdjuntoFinal && permiso.documentos && Array.isArray(permiso.documentos)) {
    const docEvidencia = permiso.documentos.find(d => 
      d.tipo === 'Adjunto' || 
      d.tipo === 'Evidencia' || 
      (d.url && !d.url.toLowerCase().includes('_autorizado') && !d.url.toLowerCase().includes('_denegado') && d.tipo !== 'Generado PDF' && d.tipo !== 'Respuesta PDF')
    );
    if (docEvidencia) {
      const rutaExtraida = docEvidencia.url || docEvidencia.ruta || docEvidencia.fileUrl;
      if (rutaExtraida) {
        nombreDelAdjuntoFinal = rutaExtraida.split('/').pop();
      }
    }
  }

  // 2️⃣ Plan B: Si no hay arreglo, buscamos en la variable directa
  if (!nombreDelAdjuntoFinal) {
    const rutaDirecta = permiso.documento || permiso.url_documento;
    if (rutaDirecta) {
      nombreDelAdjuntoFinal = rutaDirecta.split('/').pop();
    }
  }

  // 🌟 NUEVO BLOQUE: LIMPIEZA DE NOMBRE (Frontend Magic)
  let nombreElegante = nombreDelAdjuntoFinal;
  if (nombreDelAdjuntoFinal && permiso.usuario) {
    const partes = nombreDelAdjuntoFinal.split('.');
    const extension = partes.length > 1 ? partes.pop() : 'pdf';
    const apellido = permiso.usuario.apellidos ? permiso.usuario.apellidos.split(' ')[0] : 'Docente';
    const tipoPermiso = permiso.tipo?.nombre ? permiso.tipo.nombre.replace(/\s+/g, '_') : 'Permiso';
    nombreElegante = `Evidencia_${tipoPermiso}_${apellido}.${extension}`;
  }

  // 🔹 Desestructuración de variables del permiso
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

  const fechaOptions = { year: 'numeric', month: 'long', day: 'numeric' };
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
    <CartaLayout fechaSolicitud={fecha_solicitud} nombreAdjunto={nombreElegante}>
      
      {/* SALUDO */}
      <p style={{ fontWeight: 'bold', marginBottom: '0.8rem' }}>De mi consideración:</p>

      {/* PÁRRAFO 1 */}
      <p style={{ textAlign: 'justify', marginBottom: '0.8rem' }}>
        Yo, <strong>{usuario?.nombres} {usuario?.apellidos}</strong>, portador(a) de la cédula de identidad N.º <strong>{usuario?.ci}</strong>, me dirijo a usted respetuosamente con el fin de justificar un(a) <strong>{tipo?.nombre?.toLowerCase() || 'permiso'}</strong> correspondiente a {periodoTexto}{horasTexto}.
      </p>

      {/* PÁRRAFO 2 */}
      <p style={{ textAlign: 'justify', marginBottom: '0.8rem' }}>
        Dicha inasistencia se debió a <em>{tipo?.sub_tipo ? tipo.sub_tipo.toLowerCase() : 'motivos personales'}</em>. {descripcion ? `${descripcion}` : ''}
      </p>

      {/* PÁRRAFO 3 */}
      <p style={{ textAlign: 'justify', marginBottom: '0.8rem' }}>
        Solicito se considere la presente justificación y quedo atento(a) para proporcionar documentación adicional si fuese requerida.
      </p>

      {/* AGRADECIMIENTO */}
      <p style={{ marginBottom: '1.5rem', fontStyle: 'italic' }}>
        Agradezco su comprensión y colaboración.
      </p>

      {/* FIRMA Y DATOS DEL SOLICITANTE */}
      <div className="firma-derecha">
        <p>Atentamente,</p>
        <p style={{ marginTop: '1.5rem' }}><strong>{usuario?.nombres} {usuario?.apellidos}</strong></p>
        <p>{usuario?.rol ? usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1) : 'Usuario'}</p>
        <p>C.I.: {usuario?.ci}</p>
        <p>Correo: {usuario?.correo}</p>
        <p>Teléfono: {usuario?.telefono}</p>
        <p>Dirección: {usuario?.direccion || 'Quito'}</p>
      </div>

      {/* SELLO DE ESTADO */}
      <div style={{ 
        marginTop: '1rem', 
        borderTop: '1px solid #e2e8f0', 
        paddingTop: '0.5rem', 
        fontSize: '0.8rem', 
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