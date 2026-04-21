// src/service/mail.permiso.service.js
const mailService = require('./mail.service');
require('dotenv').config();

/**
 * Función puente para enviar correos de permisos.
 * Inyecta automáticamente el destinatario si no se proporciona.
 */
async function enviarCorreoP(opciones) {
  // Si permiso.service.js no envía el destinatario ("to"),
  // se lo asignamos por defecto a la cuenta de TTHH configurada en el .env
  if (!opciones.to) {
    opciones.to = process.env.EMAIL_PERMISOS;
  }

  // Ahora sí, pasamos todas las opciones completas a nuestro servicio SendGrid
  return await mailService.enviarCorreo(opciones);
}

module.exports = {
  enviarCorreoP
};