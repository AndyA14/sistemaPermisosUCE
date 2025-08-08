const express = require('express');
const router = express.Router();

const { verificarToken } = require('../middleware/auth');
const { esAll } = require('../middleware/roles');

// Controladores
const {
  listarTiposPermiso,
  obtenerTipoPermisoPorId,
  crearTipoPermiso,
  actualizarTipoPermiso,
  eliminarTipoPermiso,
} = require('../controller/tipoPermiso.controller');

// 🔐 Middleware de autenticación y roles
const middlewares = [verificarToken, esAll];

/**
 * @swagger
 * tags:
 *   name: TiposPermiso
 *   description: Gestión de tipos de permiso
 */

/**
 * @swagger
 * /api/tipos-permiso:
 *   get:
 *     summary: Obtener todos los tipos de permiso
 *     tags: [TiposPermiso]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de permiso
 */
router.get('/', middlewares, listarTiposPermiso);

/**
 * @swagger
 * /api/tipos-permiso/{id}:
 *   get:
 *     summary: Obtener tipo de permiso por ID
 *     tags: [TiposPermiso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del tipo de permiso
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de permiso encontrado
 *       404:
 *         description: Tipo no encontrado
 */
router.get('/:id', middlewares, obtenerTipoPermisoPorId);

/**
 * @swagger
 * /api/tipos-permiso:
 *   post:
 *     summary: Crear un nuevo tipo de permiso
 *     tags: [TiposPermiso]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               carga_vacaciones:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Tipo creado exitosamente
 */
router.post('/', middlewares, crearTipoPermiso);

/**
 * @swagger
 * /api/tipos-permiso/{id}:
 *   put:
 *     summary: Actualizar un tipo de permiso existente
 *     tags: [TiposPermiso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de permiso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               carga_vacaciones:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tipo actualizado exitosamente
 */
router.put('/:id', middlewares, actualizarTipoPermiso);

/**
 * @swagger
 * /api/tipos-permiso/{id}:
 *   delete:
 *     summary: Eliminar un tipo de permiso
 *     tags: [TiposPermiso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del tipo de permiso
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo eliminado correctamente
 *       404:
 *         description: Tipo no encontrado
 */
router.delete('/:id', middlewares, eliminarTipoPermiso);

module.exports = router;
