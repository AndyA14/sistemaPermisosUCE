const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Responde a un correo de permiso notificando al solicitante y copiando a TTHH y DTIC
 * @param {Object} opciones
 * @param {string} opciones.to - Correo personal del solicitante
 * @param {string[]} opciones.cc - Correos en copia (TTHH, DTIC, etc.)
 * @param {string} opciones.subject - Asunto del correo
 * @param {string} [opciones.text] - Contenido en texto plano
 * @param {string} [opciones.html] - Contenido en formato HTML (opcional)
 * @returns {Promise<void>}
 */
async function responderCorreoPermiso({ to, subject, text = '', html = '' }) {
  try {
    console.log('📨 Preparando envío de correo...');
    console.log('📧 Destinatario:', to);
    console.log('📝 Asunto:', subject);
    console.log('✉️ Texto:', text?.slice(0, 100)); // mostrar los primeros 100 caracteres
    console.log('📩 HTML:', html ? '[HTML presente]' : '[Sin HTML]');
    console.log('🔐 Usuario SMTP:', process.env.EMAIL_ADDRESS);
    console.log('🧾 Remitente:', process.env.EMAIL_PERMISOS);

    if (!to || !to.includes('@')) {
      console.warn('⚠️ Dirección de correo inválida o ausente:', to);
      throw new Error('Dirección de correo inválida o no proporcionada');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADDRESS,      // Correo de envío (ej: Gmail)
        pass: process.env.EMAIL_PASSWORD,     // Contraseña de aplicación
      },
    });

    const mailOptions = {
      from: `"Sistema de Permisos - IAI" <${process.env.EMAIL_PERMISOS}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo de respuesta enviado exitosamente. ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error al enviar correo de respuesta:', error);
    if (error.response) {
      console.error('📨 Respuesta del servidor:', error.response);
    }
  }
}

module.exports = { responderCorreoPermiso };
