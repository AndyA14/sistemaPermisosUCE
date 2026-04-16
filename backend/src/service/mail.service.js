// services/mail.service.js
const nodemailer = require('nodemailer');
const { leerCorreosPorAlias } = require('./mail.reader');
const { procesarCorreosYPermisosPorRol } = require('./correosUnificados.service');
require('dotenv').config();

/**
 * Crear transportador SMTP reutilizable.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Envía un correo electrónico con opción de adjuntar archivos.
 * @param {Object} options
 * @param {string} options.to - Destinatario(s)
 * @param {string} options.subject - Asunto del correo
 * @param {string} [options.text] - Texto plano
 * @param {string} [options.html] - Contenido HTML
 * @param {Array} [options.attachments] - Archivos adjuntos [{ filename, path }]
 */
async function enviarCorreo({ to, subject, text = '', html = '', attachments = [] }) {
  try {
    if (!to) throw new Error("No se proporcionó destinatario");

    const mailOptions = {
      from: `"Sistema de Permisos" <${process.env.EMAIL_ADDRESS}>`,
      to,
      subject,
      text,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado:', info.messageId);
    return info;

  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    throw error; // Propagar para que la capa superior pueda manejarlo
  }
}

/**
 * Obtiene correos según alias dado.
 * @param {string} alias 
 * @returns {Promise<Array>} lista de correos
 */
async function obtenerCorreosPorAlias(alias) {
  if (!alias) throw new Error('Alias es requerido');
  return await leerCorreosPorAlias(alias);
}

/**
 * Procesa correos y permisos unificados para un alias (TTHH).
 * @param {string} alias 
 * @returns {Promise<object>} resultado procesado
 */
async function obtenerCorreosUnificadosTTHH(alias = 'director') {
  return await procesarCorreosYPermisosPorRol(alias, false);
}

/**
 * Procesa correos y permisos unificados para un alias (Director).
 * @param {string} alias 
 * @returns {Promise<object>} resultado procesado
 */
async function obtenerCorreosUnificadosDirector(alias = 'director') {
  return await procesarCorreosYPermisosPorRol(alias, true);
}

module.exports = {
  enviarCorreo,
  obtenerCorreosPorAlias,
  obtenerCorreosUnificadosTTHH,
  obtenerCorreosUnificadosDirector
};