// utils/manejoErrores.js
const manejarError = (res, error, mensaje = 'Error interno del servidor') => {
  console.error(error);
  res.status(500).json({ mensaje });
};

module.exports = { manejarError };
