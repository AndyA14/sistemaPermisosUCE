const express = require('express');
const router = express.Router();
const controller = require('../controller/informes.controller');
const { verificarToken } = require('../middleware/auth');
const { esAdministrativo, esAll } = require('../middleware/roles');

/**
 * @swagger
 * tags:
 *   name: Informes
 *   description: Endpoints para informes y estadísticas
 */

/**
 * @swagger
 * /api/dashboard/buscar:
 *   get:
 *     summary: Buscar usuarios por nombre
 *     tags: [Informes]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         required: true
 *         description: Parte del nombre o apellido del usuario
 *     responses:
 *       200:
 *         description: Lista de usuarios coincidentes
 */
router.get('/buscar', verificarToken, esAdministrativo, controller.buscarusuarios);

/**
 * @swagger
 * /api/dashboard/generar-informe:
 *   get:
 *     summary: Generar ZIP con permisos y documentos filtrados
 *     tags: [Informes]
 *     parameters:
 *       - in: query
 *         name: mes
 *         schema:
 *           type: integer
 *       - in: query
 *         name: anio
 *         schema:
 *           type: integer
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Archivo ZIP generado
 */
router.get('/generar-informe', verificarToken, esAdministrativo, controller.generarInforme);

/**
 * @swagger
 * /api/dashboard/mis-permisos:
 *   get:
 *     summary: Obtener permisos del usuario autenticado
 *     tags: [Informes]
 *     responses:
 *       200:
 *         description: Lista de permisos
 */
router.get('/mis-permisos', verificarToken, esAll, controller.misPermisos);

/**
 * @swagger
 * /api/dashboard/permisos/por-tipo:
 *   get:
 *     summary: Estadísticas de permisos por tipo
 *     tags: [Informes]
 *     responses:
 *       200:
 *         description: Lista de tipos con conteo
 */
router.get('/permisos/por-tipo', verificarToken, esAdministrativo, controller.permisosPorTipo);

/**
 * @swagger
 * /api/dashboard/permisos/top-usuarios:
 *   get:
 *     summary: Top usuarios con más permisos
 *     tags: [Informes]
 *     responses:
 *       200:
 *         description: Lista de usuarios y número de permisos
 */
router.get('/permisos/top-usuarios', verificarToken, esAdministrativo, controller.topusuarios);

/**
 * @swagger
 * /api/dashboard/permisos/por-mes:
 *   get:
 *     summary: Resumen mensual de permisos autorizados y denegados
 *     tags: [Informes]
 *     responses:
 *       200:
 *         description: Lista por mes y estado
 */
router.get('/permisos/por-mes', verificarToken, esAdministrativo, controller.permisosPorMes);

/**
 * @swagger
 * /api/dashboard/permisos/ultimos:
 *   get:
 *     summary: Últimos 10 permisos registrados
 *     tags: [Informes]
 *     responses:
 *       200:
 *         description: Lista de los últimos permisos
 */
router.get('/permisos/ultimos', verificarToken, esAdministrativo, controller.ultimosPermisos);

/**
 * @swagger
 * /api/dashboard/resumen-general:
 *   get:
 *     summary: Contadores generales del sistema
 *     tags: [Informes]
 *     responses:
 *       200:
 *         description: Total de usuarios y permisos por estado
 */
router.get('/resumen-general', verificarToken, esAdministrativo, controller.resumenGeneral);

module.exports = router;
