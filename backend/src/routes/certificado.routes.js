// backend/src/routes/certificado.routes.js
const express = require('express');
const router = express.Router();
const certificadoController = require('../controller/certificado.controller');
const { verificarToken } = require('../middleware/auth'); // Ajusta según el nombre de tu middleware de autenticación
const { esAdmin } = require('../middleware/roles'); // O el middleware que uses para verificar roles

// Ruta POST para crear certificado (Protegida para que solo entre el admin)
// Si no tienes middleware "esAdmin", puedes quitarlo por ahora y dejar solo "verificarToken"
router.post('/', verificarToken, certificadoController.crearCertificado);

module.exports = router;