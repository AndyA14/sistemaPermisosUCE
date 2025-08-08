// services/tipoPermiso.service.js
const TipoPermisoRepository = require('../repository/TipoPermisoRepository');

/**
 * Obtener todos los tipos de permiso
 */
async function listarTiposPermiso() {
  return await TipoPermisoRepository.listarTodos();
}

/**
 * Obtener tipo de permiso por ID
 * @param {number} id
 */
async function obtenerTipoPermisoPorId(id) {
  const tipo = await TipoPermisoRepository.obtenerPorId(id);
  if (!tipo) {
    const error = new Error('Tipo de permiso no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return tipo;
}

/**
 * Crear un nuevo tipo de permiso
 * @param {Object} data
 */
async function crearTipoPermiso(data) {
  const { nombre, sub_tipo } = data;

  const existente = await TipoPermisoRepository.obtenerPorNombreYSubtipo(nombre, sub_tipo);
  if (existente) {
    const error = new Error('Ya existe un tipo de permiso con ese nombre y subtipo');
    error.statusCode = 400;
    throw error;
  }

  return await TipoPermisoRepository.crear(data);
}

/**
 * Actualizar un tipo de permiso
 * @param {number} id
 * @param {Object} cambios
 */
async function actualizarTipoPermiso(id, cambios) {
  const tipo = await TipoPermisoRepository.obtenerPorId(id);
  if (!tipo) {
    const error = new Error('Tipo de permiso no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return await TipoPermisoRepository.actualizar(id, cambios);
}

/**
 * Eliminar un tipo de permiso
 * @param {number} id
 */
async function eliminarTipoPermiso(id) {
  const tipo = await TipoPermisoRepository.obtenerPorId(id);
  if (!tipo) {
    const error = new Error('Tipo de permiso no encontrado');
    error.statusCode = 404;
    throw error;
  }

  await TipoPermisoRepository.eliminar(id);
}

module.exports = {
  listarTiposPermiso,
  obtenerTipoPermisoPorId,
  crearTipoPermiso,
  actualizarTipoPermiso,
  eliminarTipoPermiso,
};
