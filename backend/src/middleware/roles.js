/**
 * Middleware para verificar que el usuario tenga alguno de los roles permitidos.
 * @param  {...string} rolesPermitidos Roles que tienen acceso.
 */
const verificarRoles = (...rolesPermitidos) => (req, res, next) => {
  const rol = req.usuario?.rol;

  if (!rol || !rolesPermitidos.includes(rol)) {
    return res.status(403).json({
      mensaje: `Acceso denegado: requiere rol ${rolesPermitidos.join(' o ')}`,
    });
  }

  next();
};

// Middlewares específicos para roles comunes
const esAdministrativo = verificarRoles('admin', 'dti', 'tthh', 'director',);
const esDTICs = verificarRoles('admin', 'dti');
const esTHHCs = verificarRoles('admin', 'tthh');
const esDirector = verificarRoles('admin', 'director');
const esAll= verificarRoles('admin', 'dti', 'tthh', 'director', 'docente');
module.exports = {
  verificarRoles,
  esAdministrativo,
  esDirector,
  esAll,
  esDTICs,
  esTHHCs
};
