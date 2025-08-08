// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();

// Importamos los controladores de autenticación
const { login, solicitarReset, resetPassword } = require('../controller/auth.controller');

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Rutas para autenticación y manejo de contraseñas
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       description: Credenciales del usuario
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: usuario123
 *               password:
 *                 type: string
 *                 example: contraseñaSegura
 *     responses:
 *       200:
 *         description: Login exitoso con token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/auth/login', login);

/**
 * @swagger
 * /api/auth/solicitar-reset:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       description: Email del usuario para enviar enlace de reseteo
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *     responses:
 *       200:
 *         description: Correo de restablecimiento enviado
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/auth/solicitar-reset', solicitarReset);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Cambiar contraseña usando token
 *     tags: [Autenticación]
 *     requestBody:
 *       description: Token de restablecimiento y nueva contraseña
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - nuevaPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token enviado por correo para validar
 *               nuevaPassword:
 *                 type: string
 *                 description: Nueva contraseña del usuario
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/auth/reset-password', resetPassword);

module.exports = router;
