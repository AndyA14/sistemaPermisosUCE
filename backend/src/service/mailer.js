// src/service/mailer.js
/**
 * ⚠️ ARCHIVO DEPRECADO (Migración a SendGrid)
 * Este archivo se mantiene únicamente por compatibilidad hacia atrás.
 * Toda la lógica de correos ahora vive centralizada en mail.service.js
 */
const mailService = require('../services/mail.service');

module.exports = {
  enviarCorreo: mailService.enviarCorreo
};