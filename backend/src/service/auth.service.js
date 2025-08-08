const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioRepo = require('../repository/UsuarioRepository');
const tokenRepo = require('../repository/PasswordResetTokenRepository');
const { enviarResetPassword, enviarConfirmacionCambioPassword } = require('./emailTemplates.service');

const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey';
const URL_FRONT = process.env.URL_FRONTEND;

/**
 * Login: valida credenciales y retorna token + usuario
 */
async function login(username, contrasena) {
  const usuario = await usuarioRepo.obtenerPorUsername(username);
  if (!usuario || !usuario.estado) {
    throw new Error('Usuario no encontrado');
  }

  const passwordValido = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!passwordValido) {
    throw new Error('Contraseña incorrecta');
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      username: usuario.username,
      rol: usuario.rol,
    },
    SECRET_KEY,
    { expiresIn: '7h' }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      rol: usuario.rol,
    }
  };
}

/**
 * Envía email de recuperación si el correo es válido
 */
async function solicitarReset(correo) {
  const usuario = await usuarioRepo.obtenerPorCorreo(correo);
  if (!usuario) return; // No se revela existencia

  const token = jwt.sign({ userId: usuario.id }, SECRET_KEY, { expiresIn: 1800 });
  const expiracion = new Date(Date.now() + 30 * 60 * 1000);

  await tokenRepo.crear({
    token,
    expiresAt: expiracion,
    usuario,
  });

  const urlReset = `${URL_FRONT}/reset-password/${token}`;
  await enviarResetPassword({ to: usuario.correo, urlReset });
}

/**
 * Cambia la contraseña a través de token válido
 */
async function resetPassword(token, nuevaContrasena) {
  const payload = jwt.verify(token, SECRET_KEY);
  const resetToken = await tokenRepo.buscarTokenValido(token);

  if (!resetToken) throw new Error('Token inválido o expirado');
  if (resetToken.expiresAt < new Date()) throw new Error('Token expirado');
  if (resetToken.used) throw new Error('Este enlace ya fue utilizado');

  const usuario = await usuarioRepo.obtenerPorId(payload.userId);
  if (!usuario) throw new Error('Usuario no encontrado');

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(nuevaContrasena, salt);
  await usuarioRepo.actualizar(usuario.id, { contrasena: hash });

  await tokenRepo.actualizar(resetToken.id, { used: true });
  await enviarConfirmacionCambioPassword({ to: usuario.correo });
}

module.exports = {
  login,
  solicitarReset,
  resetPassword,
};
