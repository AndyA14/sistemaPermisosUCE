const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Envía un correo electrónico con nodemailer
 * @param {Object} opciones - Configuración del correo
 * @param {string} opciones.to - Destinatario(s)
 * @param {string} opciones.subject - Asunto del correo
 * @param {string} [opciones.text] - Texto plano del correo
 * @param {string} [opciones.html] - HTML del correo
 * @param {Array} [opciones.attachments] - Archivos adjuntos [{filename, path}]
 */
async function enviarCorreoP({ subject, text = '', html = '', attachments = [] }) {
  try {
    // Crear transportador SMTP usando Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Opciones del correo
    const mailOptions = {
      from: `"Sistema de Permisos - IAI" <${process.env.EMAIL_PERMISOS}>`,
      to: process.env.EMAIL_DIRECTOR,
      subject,
      text,
      html,
      attachments, // opcional
    };


    // Enviar correo
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado:', info.messageId);
  } catch (error) {
    // Loguear error sin detener ejecución
    console.error('❌ Error al enviar correo:', error);
  }
}

module.exports = { enviarCorreoP };
