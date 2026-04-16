// services/mail.permisos.service.js
const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Transportador SMTP reutilizable usando Gmail
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_PERMISOS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Envía un correo electrónico del sistema de permisos.
 * @param {Object} opciones
 * @param {string} opciones.subject - Asunto del correo
 * @param {string} [opciones.text] - Texto plano del correo
 * @param {string} [opciones.html] - Contenido HTML del correo
 * @param {Array} [opciones.attachments] - Archivos adjuntos [{filename, path}]
 * @param {string} [opciones.to] - Destinatario(s), por defecto EMAIL_DIRECTOR
 */
async function enviarCorreoP({ subject, text = '', html = '', attachments = [], to = process.env.EMAIL_DIRECTOR }) {
  try {
    if (!subject) throw new Error("El asunto del correo es obligatorio");
    if (!to) throw new Error("No se proporcionó destinatario");

    const mailOptions = {
      from: `"Sistema de Permisos - IAI" <${process.env.EMAIL_PERMISOS}>`,
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
    throw error; // Propagar error para manejo externo
  }
}

module.exports = { enviarCorreoP };