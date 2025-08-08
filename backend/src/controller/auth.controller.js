const authService = require('../service/auth.service');

async function login(req, res) {
  const { username, contrasena } = req.body;
  try {
    const result = await authService.login(username, contrasena);
    res.json(result);
  } catch (err) {
    res.status(401).json({ mensaje: err.message });
  }
}

async function solicitarReset(req, res) {
  const { correo } = req.body;
  try {
    await authService.solicitarReset(correo);
    res.json({ mensaje: 'Si el correo existe, se ha enviado un enlace de recuperación' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en el proceso de recuperación' });
  }
}

async function resetPassword(req, res) {
  const { token, nuevaContrasena } = req.body;
  try {
    await authService.resetPassword(token, nuevaContrasena);
    res.json({ mensaje: 'Contraseña restablecida correctamente' });
  } catch (err) {
    res.status(400).json({ mensaje: err.message });
  }
}

module.exports = {
  login,
  solicitarReset,
  resetPassword,
};
