// controllers/tipoPermiso.controller.js
const tipoPermisoService = require('../service/tipoPermiso.service');

/**
 * Listar todos los tipos de permiso
 */
async function listarTiposPermiso(req, res) {
  try {
    const tipos = await tipoPermisoService.listarTiposPermiso();
    res.json(tipos);
  } catch (err) {
    console.error('❌ Error listarTiposPermiso:', err);
    res.status(500).json({ error: 'Error al listar tipos de permiso' });
  }
}

/**
 * Obtener tipo de permiso por ID
 */
async function obtenerTipoPermisoPorId(req, res) {
  try {
    const { id } = req.params;
    const tipo = await tipoPermisoService.obtenerTipoPermisoPorId(parseInt(id));
    res.json(tipo);
  } catch (err) {
    console.error('❌ Error obtenerTipoPermisoPorId:', err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * Crear tipo de permiso
 */
async function crearTipoPermiso(req, res) {
  try {
    const tipo = await tipoPermisoService.crearTipoPermiso(req.body);
    res.status(201).json(tipo);
  } catch (err) {
    console.error('❌ Error crearTipoPermiso:', err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * Actualizar tipo de permiso
 */
async function actualizarTipoPermiso(req, res) {
  try {
    const { id } = req.params;
    const tipo = await tipoPermisoService.actualizarTipoPermiso(parseInt(id), req.body);
    res.json(tipo);
  } catch (err) {
    console.error('❌ Error actualizarTipoPermiso:', err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

/**
 * Eliminar tipo de permiso
 */
async function eliminarTipoPermiso(req, res) {
  try {
    const { id } = req.params;
    await tipoPermisoService.eliminarTipoPermiso(parseInt(id));
    res.json({ mensaje: '🗑️ Tipo de permiso eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error eliminarTipoPermiso:', err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

module.exports = {
  listarTiposPermiso,
  obtenerTipoPermisoPorId,
  crearTipoPermiso,
  actualizarTipoPermiso,
  eliminarTipoPermiso,
};
