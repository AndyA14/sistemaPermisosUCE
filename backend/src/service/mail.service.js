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
 * Ahora incluye X-Headers para lectura rápida por IMAP.
 */
async function enviarCorreo({
  to,
  subject,
  text = '',
  html = '',
  attachments = [],
  meta = {} // ← NUEVO: metadata para headers
}) {
  try {
    if (!to) throw new Error("No se proporcionó destinatario");

    // Procesar adjuntos
    const formattedAttachments = attachments
      .map(att => {
        if (!fs.existsSync(att.path)) {
          console.warn(`⚠️ El archivo adjunto no existe en la ruta: ${att.path}`);
          return null;
        }

        return {
          content: fs.readFileSync(att.path).toString('base64'),
          filename: att.filename,
          type: 'application/pdf',
          disposition: 'attachment',
        };
      })
      .filter(Boolean);

    // === OPTIMIZACIÓN BLINDADA ===
    const destinatariosStr =
      (String(to) + JSON.stringify(to)).toLowerCase();

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

      // Si va al sistema, no enviamos adjuntos
      attachments: destinoEsSistema ? [] : formattedAttachments,

      // ─── SOLUCIÓN A: X-HEADERS ─────────────────────────────
      // Estos headers viajan intactos y pueden leerse vía IMAP sin descargar el body
      headers: {
        'X-Permiso-ID': String(meta.permisoId   || ''),
        'X-Cedula':     String(meta.cedula      || ''),
        'X-Alias-Dest': String(meta.aliasDestino || ''), // director | permisos | tthh
      },
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

/**
 * Obtiene correos por alias (lector IMAP)
 */
async function obtenerCorreosPorAlias(alias) {
  if (!alias) throw new Error('Alias es requerido');
  return await leerCorreosPorAlias(alias);
}

/**
 * Correos unificados para TTHH
 */
async function obtenerCorreosUnificadosTTHH() {
  return await procesarCorreosYPermisosPorRol('permisos', false);
}

/**
 * Correos unificados para Director
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