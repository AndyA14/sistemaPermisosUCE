const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { obtenerCorreosPorAlias, getCorreosUnificadosTTHH, getCorreosUnificadosDirector } = require('../controller/mail.controller');
const { esAdministrativo } = require('../middleware/roles');

/**
 * @swagger
 * tags:
 *   name: Correos
 *   description: Endpoints relacionados con la lectura y unificación de correos
 */

/**
 * @swagger
 * /api/correos/{alias}:
 *   get:
 *     summary: Obtener correos por alias
 *     tags: [Correos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: alias
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Alias del buzón a consultar (ej. "director")
 *     responses:
 *       200:
 *         description: Lista de correos encontrados
 *       400:
 *         description: Falta parámetro alias
 *       500:
 *         description: Error al leer correos
 */
router.get('/:alias', verificarToken, esAdministrativo, obtenerCorreosPorAlias);

router.get('/obtener/unificado/tthh', verificarToken, esAdministrativo, getCorreosUnificadosTTHH);

router.get('/obtener/unificado/director', verificarToken, esAdministrativo, getCorreosUnificadosDirector);

module.exports = router;
