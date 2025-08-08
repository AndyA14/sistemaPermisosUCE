// src/middleware/verificarToken.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware para verificar el token JWT en la cabecera Authorization.
 * Si es válido, agrega los datos del usuario decodificados a req.usuario.
 */
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ mensaje: 'Token requerido o malformado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

module.exports = { verificarToken };
