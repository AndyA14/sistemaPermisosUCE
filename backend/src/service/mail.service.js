// src/service/mail.service.js
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');
const { leerCorreosPorAlias } = require('./mail.reader');
const { procesarCorreosYPermisosPorRol } = require('./correosUnificados.service');
require('dotenv').config();

// Configuración de la API Key de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Envía un correo electrónico usando SendGrid.
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

    // Procesar adjuntos: SendGrid requiere contenido en Base64
    const formattedAttachments = attachments.map(att => {
      // Validar si el archivo existe antes de intentar leerlo
      if (!fs.existsSync(att.path)) {
        console.warn(`⚠️ El archivo adjunto no existe en la ruta: ${att.path}`);
        return null;
      }

      const content = fs.readFileSync(att.path).toString('base64');
      return {
        content: content,
        filename: att.filename,
        type: 'application/pdf', // Valor por defecto para los permisos del instituto
        disposition: 'attachment',
      };
    }).filter(att => att !== null); // Eliminar adjuntos fallidos

    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_SENDER,
        name: "Sistema de Permisos IAI-UCE" // Nombre que aparecerá en la bandeja de entrada
      },
      subject,
      text: text || 'Mensaje del Sistema de Gestión de Permisos',
      html: html || text,
      attachments: formattedAttachments,
    };

    const response = await sgMail.send(msg);
    
    // SendGrid devuelve un arreglo donde el primer elemento tiene el status
    console.log('✅ Correo enviado vía SendGrid. Status:', response[0].statusCode);
    return response[0];

  } catch (error) {
    console.error('❌ Error crítico en el servicio de correo (SendGrid):', error);
    
    // Si SendGrid devuelve un error de respuesta detallado
    if (error.response) {
      console.error('Detalle del error:', error.response.body);
    }
    
    throw error;
  }
}

/**
 * Obtiene correos según alias dado (Mantiene lógica IMAP existente).
 */
async function obtenerCorreosPorAlias(alias) {
  if (!alias) throw new Error('Alias es requerido');
  return await leerCorreosPorAlias(alias);
}

/**
 * Procesa correos y permisos unificados para TTHH.
 * Forzamos el alias 'permisos' sin importar qué envíe el frontend.
 */
async function obtenerCorreosUnificadosTTHH() {
  return await procesarCorreosYPermisosPorRol('permisos', false);
}

/**
 * Procesa correos y permisos unificados para Director.
 * Forzamos el alias 'director' sin importar qué envíe el frontend.
 */
async function obtenerCorreosUnificadosDirector() {
  return await procesarCorreosYPermisosPorRol('director', true);
}
module.exports = {
  enviarCorreo,
  obtenerCorreosPorAlias,
  obtenerCorreosUnificadosTTHH,
  obtenerCorreosUnificadosDirector
};