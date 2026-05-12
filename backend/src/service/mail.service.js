// ============================================================
// SOLUCIÓN 1: Inyección de Message-ID único en SendGrid
// ============================================================
// OBJETIVO: Romper el threading de Gmail a nivel SMTP sin
//           contaminar el asunto. Cada correo tendrá un
//           Message-ID completamente único, y NUNCA llevará
//           cabeceras In-Reply-To ni References.
//
// VENTAJAS:
//   ✅ Implementación en ~5 minutos (solo cambia mail.service.js)
//   ✅ Asunto queda limpio: "Solicitud de permiso de Juan Pérez"
//   ✅ Mantiene tu arquitectura IMAP existente intacta
//   ✅ Compatible con SendGrid, Nodemailer y cualquier otro cliente
//
// LIMITACIONES:
//   ⚠️  Gmail puede ocasionalmente re-agrupar por asunto de todas formas
//   ⚠️  No resuelve el bug IMAP si ya existe en tu inbox
//       (solo previene futuros casos)
// ============================================================

const crypto = require('crypto');

// ── HELPER: Genera un Message-ID globalmente único ───────────
// Formato RFC 5322: <timestamp.uuid@dominio>
// El dominio debe coincidir con tu dominio de envío en SendGrid
// para que pase los filtros SPF/DKIM sin warnings.
function generarMessageId() {
  const timestamp = Date.now();
  const unique = crypto.randomBytes(12).toString('hex');
  const dominio = process.env.EMAIL_DOMAIN || 'tudominio.com';
  return `<${timestamp}.${unique}@${dominio}>`;
}

// ── EJEMPLO: Usando @sendgrid/mail ───────────────────────────
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Envía un correo con cabeceras MIME que impiden el threading en Gmail.
 *
 * La clave está en:
 * 1. Message-ID único por correo (nunca reutilizar)
 * 2. Ausencia total de In-Reply-To y References
 * 3. X-Headers preservados (tu sistema de IDs sigue funcionando)
 */
async function enviarCorreo({ to, subject, html, attachments = [], meta = {} }) {
  // Validación defensiva de meta
  const permisoId = meta.permisoId ?? null;
  const cedula    = meta.cedula    ?? null;
  const alias     = meta.aliasDestino ?? 'default';

  // ── CABECERAS CRÍTICAS ANTI-THREADING ──────────────────────
  // SendGrid acepta "headers" como un objeto plano.
  // Estas cabeceras se incluyen TAL CUAL en el mensaje SMTP.
  const antiThreadingHeaders = {
    // 1. Message-ID único → Gmail no puede correlacionar este
    //    correo con ningún otro para formar un hilo.
    'Message-ID': generarMessageId(),

    // 2. X-Headers de tu sistema (sin cambios)
    ...(permisoId !== null && { 'X-Permiso-ID': String(permisoId) }),
    ...(cedula    !== null && { 'X-Cedula':     String(cedula)    }),
    'X-Alias-Dest': alias,

    // 3. Forzar prioridad normal (evita que Gmail lo marque como
    //    parte de una cadena de notificaciones automatizadas)
    'X-Priority': '3',
    'Importance': 'Normal',
  };

  // IMPORTANTE: NO incluyas In-Reply-To ni References.
  // Si tu versión de @sendgrid/mail los agrega automáticamente,
  // sobreescríbelos con cadena vacía:
  // 'In-Reply-To': '',
  // 'References': '',

  const msg = {
      to,
      from: {
        // Usamos tu variable real del .env, con un respaldo por si acaso
        email: process.env.SENDGRID_SENDER || process.env.EMAIL_ADDRESS, 
        name:  'Sistema IAI - Permisos',
      },
    subject,
    html,
    headers: antiThreadingHeaders,
    // Adjuntos en formato SendGrid
    attachments: attachments.map(att => ({
      content:     require('fs').readFileSync(att.path).toString('base64'),
      filename:    att.filename,
      type:        'application/octet-stream',
      disposition: 'attachment',
    })),
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Correo enviado a ${to} | Permiso #${permisoId} | Message-ID: ${antiThreadingHeaders['Message-ID']}`);
  } catch (error) {
    console.error('❌ Error enviando correo vía SendGrid:', error.response?.body || error.message);
    throw error;
  }
}

// ── ALTERNATIVA: Si usas Nodemailer con SMTP ─────────────────
// En Nodemailer, el campo "messageId" del transport.sendMail()
// equivale al Message-ID del header. Úsalo así:
//
// await transporter.sendMail({
//   from: ..., to: ..., subject: ..., html: ...,
//   messageId: generarMessageId(),
//   // NO incluyas inReplyTo ni references
//   headers: {
//     'X-Permiso-ID': String(permisoId),
//     'X-Cedula':     String(cedula),
//     'X-Alias-Dest': alias,
//   }
// });
// Al final de mail.service.js (Solo si el paso anterior no bastó)
const { procesarCorreosYPermisosPorRol } = require('./correosUnificados.service');

async function obtenerCorreosUnificadosTTHH() {
  return await procesarCorreosYPermisosPorRol('permisos', false);
}

async function obtenerCorreosUnificadosDirector() {
  return await procesarCorreosYPermisosPorRol('director', true);
}

module.exports = { 
  enviarCorreo, 
  generarMessageId,
  obtenerCorreosUnificadosTTHH,
  obtenerCorreosUnificadosDirector
};


// ============================================================
// VERIFICACIÓN: ¿Cómo confirmar que funciona?
// ============================================================
// 1. Envía dos correos al mismo destinatario con el mismo asunto.
// 2. En Gmail web, confirma que aparecen como conversaciones SEPARADAS.
// 3. En tu IMAP reader, confirma que cada correo devuelve su propio X-Permiso-ID.
//
// Si Gmail SIGUE agrupando a pesar del Message-ID único:
//   → Añade un sufijo invisible al asunto con un carácter de espacio
//     de anchura cero (U+200B): `${subject}\u200B`
//   → Esto es perceptivamente limpio pero técnicamente diferente.
//   → Es el último recurso antes de migrar a la Solución 3 (Gmail API).
// ============================================================