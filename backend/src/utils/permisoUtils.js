const { AppDataSource } = require('../config/database');
const TipoPermiso = require('../entity/TipoPermiso');

/**
 * Valida que la fecha de inicio no sea posterior a la fecha de fin
 * @throws Error si fecha_inicio > fecha_fin
 */
function validarFechas(fecha_inicio, fecha_fin) {
  if (fecha_fin && fecha_inicio > fecha_fin) {
    throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
  }
}

/**
 * Valida que los campos de hora estén presentes para ciertos tipos
 * @throws Error si el tipo requiere horas y no se envían
 */
function validarHoras(tipoNombre, hora_inicio, hora_fin) {
  const requiereHoras = ['atraso', 'sin timbrar'];
  if (requiereHoras.includes(tipoNombre) && (!hora_inicio || !hora_fin)) {
    throw new Error('Atrasos y Sin Timbrar requieren hora de inicio y fin');
  }
}

/**
 * Valida que exista documento adjunto para ciertos tipos
 * @throws Error si el tipo requiere documentos y no hay ninguno
 */
function validarDocumentoAdjunto(tipoNombre, documentos) {
  if (tipoNombre === 'certificado médico' && (!documentos || documentos.length === 0)) {
    throw new Error('Certificado médico requiere documento adjunto');
  }
}

/**
 * Carga el tipo de permiso desde la base de datos y aplica validaciones
 * @param {object} permiso - Permiso con datos parciales (incluye .tipo.id)
 * @returns {Promise<object>} - Permiso con tipo completo y validado
 * @throws Error si falla alguna validación
 */
async function prepararPermiso(permiso) {
  const tipoRepo = AppDataSource.getRepository(TipoPermiso);

  // Cargar tipo completo
  const tipo = await tipoRepo.findOneBy({ id: permiso.tipo.id });
  if (!tipo) throw new Error('Tipo de permiso inválido');

  permiso.tipo = tipo;
  const tipoNombre = tipo.nombre.toLowerCase();

  // Validaciones
  validarFechas(permiso.fecha_inicio, permiso.fecha_fin);
  validarHoras(tipoNombre, permiso.hora_inicio, permiso.hora_fin);
  validarDocumentoAdjunto(tipoNombre, permiso.documentos);

  // Reglas adicionales
  permiso.tipo.carga_vacaciones = (tipoNombre === 'atraso');

  return permiso;
}

/**
 * Marca campos de auditoría en un permiso
 * @param {object} permiso - Permiso modificado
 * @param {string} usuario - Username que modificó
 */
function marcarModificacion(permiso, usuario) {
  permiso.modificado_por = usuario;
  permiso.fecha_modificacion = new Date();
}

module.exports = {
  prepararPermiso,
  marcarModificacion,
  validarFechas,
  validarHoras,
  validarDocumentoAdjunto,
};
