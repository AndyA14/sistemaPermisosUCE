// controllers/mail.controller.js
const mailService = require('../service/mail.service');

/**
 * Controlador para obtener correos por alias.
 */
async function obtenerCorreosPorAlias(req, res) {
  const alias = req.params.alias;
  if (!alias) {
    return res.status(400).json({ error: 'Falta el parámetro alias' });
  }

  try {
    const correos = await mailService.obtenerCorreosPorAlias(alias);
    res.json({
      alias,
      total: correos.length,
      correos,
    });
  } catch (error) {
    console.error('Error en obtenerCorreosPorAlias:', error);
    res.status(500).json({ error: 'Error al leer correos' });
  }
}

/**
 * Controlador para obtener correos unificados con permisos.
 */
async function getCorreosUnificadosTTHH(req, res) {
  try {
    const alias = req.query.alias || 'director';
    const resultado = await mailService.obtenerCorreosUnificadosTTHH(alias);
    res.json(resultado);
  } catch (error) {
    console.error('Error en getCorreosUnificados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

/**
 * Controlador para obtener correos unificados con permisos.
 */
async function getCorreosUnificadosDirector(req, res) {
  try {
    const alias = req.query.alias || 'director';
    const resultado = await mailService.obtenerCorreosUnificadosDirector(alias);
    res.json(resultado);
  } catch (error) {
    console.error('Error en getCorreosUnificados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  obtenerCorreosPorAlias,
  getCorreosUnificadosTTHH,
  getCorreosUnificadosDirector,
};
