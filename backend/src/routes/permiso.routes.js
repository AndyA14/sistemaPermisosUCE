const express = require('express');
const { verificarToken } = require('../middleware/auth');
const permisoController = require('../controller/permiso.controller');
const upload = require('../middleware/upload');
const { esDirector, esAdministrativo, esAll, esTHHCs } = require('../middleware/roles');

const router = express.Router();


router.post('/', verificarToken, esAll, upload.single('documento'), permisoController.crearPermiso);

router.patch('/:id', verificarToken, esAll, permisoController.editarPermiso);

router.patch('/:id/autorizar', verificarToken, esDirector, permisoController.autorizarPermiso);

router.patch('/:id/denegar', verificarToken, esDirector, permisoController.denegarPermiso);

router.get('/filtro', verificarToken, esAdministrativo, permisoController.filtrarPermisos);

router.post('/:id/documento', verificarToken, esAll, upload.single('documento'), permisoController.subirDocumento);

router.put('/:id/revisar-tthh', verificarToken, esTHHCs, permisoController.revisarPorTTHH);

module.exports = router;
