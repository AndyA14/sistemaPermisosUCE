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
 */
async function enviarCorreo({ to, subject, text = '', html = '', attachments = [] }) {
  try {
    if (!to) throw new Error("No se proporcionó destinatario");

    // Procesar adjuntos
    const formattedAttachments = attachments
      .map(att => {
        if (!fs.existsSync(att.path)) {
          console.warn(`⚠️ El archivo adjunto no existe en la ruta: ${att.path}`);
          return null;
        }

        const content = fs.readFileSync(att.path).toString('base64');

        return {
          content,
          filename: att.filename,
          type: 'application/pdf',
          disposition: 'attachment',
        };
      })
      .filter(att => att !== null);

    // === OPTIMIZACIÓN BLINDADA ===
    // Convertimos a string sin importar qué formato loco use SendGrid
    const destinatariosStr =
      (String(to) + JSON.stringify(to)).toLowerCase();

    // Validamos con los alias puros
    const destinoEsSistema =
      destinatariosStr.includes('+director') ||
      destinatariosStr.includes('+tthh') ||
      destinatariosStr.includes('+permisos');

    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_SENDER,
        name: "Sistema de Permisos IAI-UCE"
      },
      subject,
      text: text || 'Mensaje del Sistema de Gestión de Permisos',
      html: html || text,

      // EL CORTE DEFINITIVO: Si va al sistema, el arreglo se vacía.
      attachments: destinoEsSistema ? [] : formattedAttachments,
    };

    const response = await sgMail.send(msg);
    console.log('✅ Correo enviado vía SendGrid. Status:', response[0].statusCode);

    return response[0];

  } catch (error) {
    console.error('❌ Error crítico en el servicio de correo (SendGrid):', error);

    if (error.response) {
      console.error('Detalle del error:', error.response.body);
    }

    throw error;
  }
}

async function obtenerCorreosPorAlias(alias) {
  if (!alias) throw new Error('Alias es requerido');
  return await leerCorreosPorAlias(alias);
}

async function obtenerCorreosUnificadosTTHH() {
  return await procesarCorreosYPermisosPorRol('permisos', false);
}

async function obtenerCorreosUnificadosDirector() {
  return await procesarCorreosYPermisosPorRol('director', true);
}

module.exports = {
  enviarCorreo,
  obtenerCorreosPorAlias,
  obtenerCorreosUnificadosTTHH,
  obtenerCorreosUnificadosDirector
};