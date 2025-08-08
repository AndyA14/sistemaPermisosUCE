const express = require('express');
const router = express.Router();
const {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  activarUsuario,
  obtenerPerfil,
  cambiarContrasena
} = require('../controller/usuario.controller');

const { verificarToken } = require('../middleware/auth');
const { esDTICs, esAll } = require('../middleware/roles');

// PERFIL autenticado
router.get('/usuario/perfil', verificarToken, obtenerPerfil);

// CRUD
router.get('/usuario', verificarToken, esDTICs, listarUsuarios);
router.get('/usuario/:id', verificarToken, esDTICs, obtenerUsuario);
router.post('/usuario', verificarToken, esDTICs, crearUsuario);
router.put('/usuario/:id', verificarToken, esDTICs, actualizarUsuario);

// Activar/Desactivar
router.patch('/usuario/:id/desactivar', verificarToken, esDTICs, desactivarUsuario);
router.patch('/usuario/:id/activar', verificarToken, esDTICs, activarUsuario);

// Cambiar contraseña
router.post('/usuario/cambiar-contrasena', verificarToken, esAll, cambiarContrasena);

module.exports = router;
