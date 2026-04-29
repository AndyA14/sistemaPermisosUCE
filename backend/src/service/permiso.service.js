// services/permiso.service.js
const { AppDataSource } = require('../config/database');
const Permiso = require('../entity/Permiso');
const DocumentoPermiso = require('../entity/DocumentoPermiso');
const Usuario = require('../entity/Usuario');
const generarPDF = require('../utils/generarPDF');
const { enviarCorreoP } = require('./mail.permiso.service');
const { prepararPermiso, marcarModificacion } = require('../utils/permisoUtils');
const mailService = require('./mail.service'); // ✅ NUEVO
const path = require('path');

const permisoRepo = AppDataSource.getRepository(Permiso);
const usuarioRepo = AppDataSource.getRepository(Usuario);
const docRepo = AppDataSource.getRepository(DocumentoPermiso);

async function crearPermiso({ usuarioId, body, file }) {
  const usuario = await usuarioRepo.findOneBy({ id: usuarioId });
  if (!usuario) throw new Error('Usuario no encontrado');

  const { htmlCorreo, tipoDocumento, ...data } = body;

  const permiso = permisoRepo.create({
    ...data,
    usuario: { id: usuarioId },
    tipo: data.tipo_id ? { id: parseInt(data.tipo_id) } : null,
    estado: 'pendiente',
  });

  const documentos = [];

  if (file) {
    const doc = docRepo.create({
      url: `/uploads/documentos/${file.filename}`,
      tipo: tipoDocumento || 'Adjunto',
    });
    documentos.push(doc);
  }

  const fecha = new Date().toISOString().split('T')[0];
  const timestamp = Date.now();
  const tipoTexto = body.tipo_nombre || 'Permiso';

  const nombrePDF = `${usuario.apellidos}_${usuario.nombres}_${fecha}_${timestamp}_${tipoTexto}.pdf`
    .replace(/\s+/g, '_');

  const pdfUrl = await generarPDF(htmlCorreo, nombrePDF);

  const pdfDoc = docRepo.create({
    url: pdfUrl,
    tipo: 'Generado PDF',
  });
  documentos.push(pdfDoc);

  const attachments = documentos
    .filter(doc => doc.tipo !== 'Generado PDF')
    .map(doc => ({
      filename: path.basename(doc.url),
      path: path.join(process.cwd(), doc.url),
    }));

  try {
    await enviarCorreoP({
      subject: `Solicitud de permiso de ${usuario.apellidos} ${usuario.nombres}`,
      html: htmlCorreo,
      attachments,
    });
  } catch (err) {
    console.error('Error al enviar correo:', err);
    throw new Error('No se pudo enviar el correo. Permiso no creado.');
  }

  const nuevoPermiso = await permisoRepo.save(permiso);

  for (const doc of documentos) {
    doc.permiso = { id: nuevoPermiso.id };
    await docRepo.save(doc);
  }

  return nuevoPermiso;
}

async function modificarEstadoPermiso({ permisoId, estado, observacion, username, carga_vacaciones }) {
  const permiso = await permisoRepo.findOne({
    where: { id: permisoId },
    relations: ['usuario', 'tipo', 'documentos'],
  });

  if (!permiso || permiso.estado_general !== 'en_revision') {
    throw new Error('Permiso inválido o ya revisado');
  }

  permiso.estado_general = estado; // Guardará 'autorizado' o 'denegado'
  permiso.carga_vacaciones = carga_vacaciones ?? false;
  permiso.respuesta_director = observacion || null;
  permiso.fecha_revision_director = new Date();
  permiso.estado_director = true;

  marcarModificacion(permiso, username);
  const permisoActualizado = await permisoRepo.save(permiso);

  // ✅ NUEVO: Notificar al solicitante el veredicto final
  try {
    // Validamos qué campo de correo usa tu entidad Usuario (suele ser 'correo' o 'email')
    const correoSolicitante = permiso.usuario.correo || permiso.usuario.email; 
    
    if (correoSolicitante) {
      const estadoTexto = estado === 'autorizado' ? 'APROBADA ✅' : 'DENEGADA ❌';
      const color = estado === 'autorizado' ? '#28a745' : '#dc3545';

      await mailService.enviarCorreo({
        to: correoSolicitante,
        subject: `Resolución de tu Permiso: ${estadoTexto}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: ${color}">Tu solicitud de permiso ha sido ${estadoTexto}</h2>
            <p>Hola <b>${permiso.usuario.nombres} ${permiso.usuario.apellidos}</b>,</p>
            <p>La Dirección ha emitido una resolución para tu solicitud de permiso.</p>
            <ul>
              <li><b>Estado Final:</b> <span style="color: ${color}; font-weight: bold;">${estadoTexto}</span></li>
              <li><b>Observación:</b> ${permiso.respuesta_director || 'Ninguna'}</li>
            </ul>
            <p>Puedes revisar los detalles completos ingresando al Sistema de Permisos del IAI.</p>
          </div>
        `
      });
      console.log(`✅ Correo de resolución (${estado}) enviado al solicitante.`);
    } else {
      console.warn('⚠️ No se encontró el correo del solicitante para notificarle.');
    }
  } catch (error) {
    console.error('❌ Error al notificar al solicitante:', error);
  }

  return permisoActualizado;
}

async function editarPermiso({ permisoId, cambios, username }) {
  const permiso = await permisoRepo.findOne({
    where: { id: permisoId },
    relations: ['usuario', 'tipo', 'documentos'],
  });

  if (!permiso) throw new Error('Permiso no encontrado');
  if (permiso.estado !== 'pendiente') throw new Error('No se puede modificar un permiso ya revisado');

  permisoRepo.merge(permiso, cambios);
  await prepararPermiso(permiso);
  marcarModificacion(permiso, username);

  return await permisoRepo.save(permiso);
}

async function filtrarPermisos({ usuario_id, estado_general }) {
  const query = permisoRepo.createQueryBuilder('permiso')
    .leftJoinAndSelect('permiso.usuario', 'usuario')
    .leftJoinAndSelect('permiso.tipo', 'tipo');

  if (usuario_id) {
    query.andWhere('usuario.id = :usuario_id', { usuario_id: parseInt(usuario_id) });
  }

  if (estado_general) {
    query.andWhere('permiso.estado_general = :estado_general', { estado_general });
  }

  return await query.getMany();
}

async function subirDocumento({ permisoId, fileUrl, tipo }) {
  const doc = docRepo.create({
    permiso: { id: permisoId },
    url: fileUrl,
    tipo,
  });

  return await docRepo.save(doc);
}

async function revisarPorTTHH({ permisoId, observacion, username }) {
  // ✅ Incluye documentos para enviar PDF
  const permiso = await permisoRepo.findOne({
    where: { id: permisoId },
    relations: ['usuario', 'tipo', 'documentos'],
  });

  if (!permiso) throw new Error('Permiso no encontrado');

  if (permiso.estado_general !== 'pendiente') {
    throw new Error('Solo se pueden revisar permisos pendientes');
  }

  permiso.observacion_tthh =
    typeof observacion === 'string' && observacion.trim() !== ''
      ? observacion.trim()
      : null;

  permiso.revisado_tthh = true;
  permiso.fecha_revision_tthh = new Date();
  permiso.estado_general = 'en_revision';

  marcarModificacion(permiso, username);

  const permisoActualizado = await permisoRepo.save(permiso);

  // ✅ Preparar adjuntos (incluye PDF)
  let attachments = [];
  if (permiso.documentos && permiso.documentos.length > 0) {
    attachments = permiso.documentos.map(doc => ({
      filename: path.basename(doc.url),
      path: path.join(process.cwd(), doc.url),
    }));
  }

  // ✅ Enviar correo al Director
  // ✅ Enviar correo al Director
  try {
    await mailService.enviarCorreo({
      to: process.env.EMAIL_DIRECTOR,
      subject: `Revisión Pendiente: Permiso de ${permiso.usuario.nombres} ${permiso.usuario.apellidos}`,
      html: `
        <h2>Solicitud de Permiso Revisada por TTHH</h2>
        <p>El permiso del funcionario <b>${permiso.usuario.nombres} ${permiso.usuario.apellidos}</b> ha pasado la validación inicial.</p>
        <p><b>Cédula:</b> ${permiso.usuario.ci}</p>
        <p><b>Fecha:</b> ${permiso.fecha_solicitud ? new Date(permiso.fecha_solicitud).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)}</p>
        <p><b>Observación de TTHH:</b> ${permiso.observacion_tthh || 'Ninguna'}</p>
        <p>Por favor, ingrese al sistema para su aprobación final.</p>
      `,
      attachments,
    });

    console.log('✅ Correo reenviado al Director exitosamente.');
  } catch (error) {
    console.error('❌ Error al notificar al Director:', error);
    // No se interrumpe el flujo si falla el correo
  }

  return permisoActualizado;
}

async function obtenerPermisoPorId(id) {
  return await permisoRepo.findOne({
    where: { id },
    relations: ['usuario'],
  });
}

module.exports = {
  crearPermiso,
  modificarEstadoPermiso,
  editarPermiso,
  filtrarPermisos,
  subirDocumento,
  revisarPorTTHH,
  obtenerPermisoPorId,
};