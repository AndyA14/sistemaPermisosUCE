// src/service/mail.responder.service.js
const mailService = require('./mail.service');

/**
 * Responde a un correo de permiso notificando al solicitante
 * Mapeado para utilizar SendGrid a través de mail.service
 */
async function responderCorreoPermiso({ to, subject, text = '', html = '' }) {
  try {
    console.log('📨 Preparando envío de correo de respuesta...');
    
    if (!to || !to.includes('@')) {
      console.warn('⚠️ Dirección de correo inválida o ausente:', to);
      throw new Error('Dirección de correo inválida o no proporcionada');
    }

    // Usar nuestro servicio unificado de SendGrid
    await mailService.enviarCorreo({
      to,
      subject,
      text,
      html
    });

    console.log('✅ Correo de respuesta enviado exitosamente vía SendGrid.');
  } catch (error) {
    console.error('❌ Error al enviar correo de respuesta:', error);
  }
}

module.exports = { responderCorreoPermiso };