// services/permiso.service.js
const { AppDataSource } = require('../config/database');
const Permiso = require('../entity/Permiso');
const DocumentoPermiso = require('../entity/DocumentoPermiso');
const Usuario = require('../entity/Usuario');
const generarPDF = require('../utils/generarPDF');
const { enviarCorreoP } = require('./mail.permiso.service');
const { prepararPermiso, marcarModificacion } = require('../utils/permisoUtils');
const path = require('path');

const permisoRepo = AppDataSource.getRepository(Permiso);
const usuarioRepo = AppDataSource.getRepository(Usuario);
const docRepo = AppDataSource.getRepository(DocumentoPermiso);

async function crearPermiso({ usuarioId, body, file }) {
  const usuario = await usuarioRepo.findOneBy({ id: usuarioId });
  if (!usuario) throw new Error('Usuario no encontrado');

  const { htmlCorreo, tipoDocumento, ...data } = body;

  // Crear instancia de permiso (no guardar aún)
  const permiso = permisoRepo.create({
    ...data,
    usuario: { id: usuarioId },
    tipo: data.tipo_id ? { id: parseInt(data.tipo_id) } : null,
    estado: 'pendiente',
  });

  // Generar documentos
  const documentos = [];

  // Documento adjunto manual (si hay)
  if (file) {
    const doc = docRepo.create({
      url: `/uploads/documentos/${file.filename}`,
      tipo: tipoDocumento || 'Adjunto',
    });
    documentos.push(doc); // aún no guardamos
  }

  // Generar nombre de PDF único
  const fecha = new Date().toISOString().split('T')[0];
  const timestamp = Date.now();
  const tipoTexto = body.tipo_nombre || 'Permiso';
  const nombrePDF = `${usuario.apellidos}_${usuario.nombres}_${fecha}_${timestamp}_${tipoTexto}.pdf`
    .replace(/\s+/g, '_');

  // Generar PDF
  const pdfUrl = await generarPDF(htmlCorreo, nombrePDF);
  const pdfDoc = docRepo.create({
    url: pdfUrl,
    tipo: 'Generado PDF',
  });
  documentos.push(pdfDoc);

  // Preparar adjuntos para el correo (sin el PDF generado)
  const attachments = documentos
    .filter(doc => doc.tipo !== 'Generado PDF')
    .map(doc => ({
      filename: path.basename(doc.url),
      path: path.join(process.cwd(), doc.url),
    }));

  // Intentar enviar correo antes de guardar en la BD
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

  // Si todo fue exitoso, guardar permiso y documentos
  const nuevoPermiso = await permisoRepo.save(permiso);
  for (const doc of documentos) {
    doc.permiso = { id: nuevoPermiso.id };
    await docRepo.save(doc);
  }

  return nuevoPermiso;
}

async function modificarEstadoPermiso({ permisoId, estado, observacion, username, carga_vacaciones }) {
  // Buscar permiso con relaciones para tener todos los datos necesarios
  const permiso = await permisoRepo.findOne({
    where: { id: permisoId },
    relations: ['usuario', 'tipo', 'documentos'],
  });

  // Validar que permiso exista y esté en estado 'en_revision'
  if (!permiso || permiso.estado_general !== 'en_revision') {
    throw new Error('Permiso inválido o ya revisado');
  }

  // Actualizar campos según parámetros
  permiso.estado_general = estado; // Se actualiza el estado general
  permiso.carga_vacaciones = carga_vacaciones ?? false;
  permiso.respuesta_director = observacion || null;
  permiso.fecha_revision_director = new Date();
  permiso.estado_director = true;

  // Registrar usuario que modifica el permiso
  marcarModificacion(permiso, username);

  // Guardar y retornar el permiso actualizado (con relaciones cargadas)
  return await permisoRepo.save(permiso);
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

  if (usuario_id) query.andWhere('usuario.id = :usuario_id', { usuario_id: parseInt(usuario_id) });
  if (estado_general) query.andWhere('permiso.estado = :estado_general', { estado_general });

  return await query.getMany();
}

async function subirDocumento({ permisoId, fileUrl, tipo }) {
  const doc = docRepo.create({ permiso: { id: permisoId }, url: fileUrl, tipo });
  return await docRepo.save(doc);
}

async function revisarPorTTHH({ permisoId, observacion, username }) {
  // Buscar permiso por ID con relaciones necesarias
  const permiso = await permisoRepo.findOne({
    where: { id: permisoId },
    relations: ['usuario', 'tipo'],
  });

  if (!permiso) throw new Error('Permiso no encontrado');

  // Solo permisos con estado pendiente pueden ser revisados
  if (permiso.estado_general !== 'pendiente') {
    throw new Error('Solo se pueden revisar permisos pendientes');
  }

  // Si observacion no es string o es vacío, se guarda null
  permiso.observacion_tthh = typeof observacion === 'string' && observacion.trim() !== ''
    ? observacion.trim()
    : null;

  permiso.revisado_tthh = true;
  permiso.fecha_revision_tthh = new Date();
  permiso.estado_general = 'en_revision'; // mantener guion bajo para consistencia en BD

  // Marca usuario y fecha de modificación
  marcarModificacion(permiso, username);

  // Guarda y retorna el permiso actualizado
  return await permisoRepo.save(permiso);
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
