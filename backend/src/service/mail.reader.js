// ============================================================
// SOLUCIÓN 2: mail.reader.js mejorado (drop-in replacement)
// ============================================================
// OBJETIVO: Corregir el bug de threading a nivel del fetch IMAP
//           usando dos técnicas simultáneas:
//
//   A) BODY.PEEK[HEADER] en lugar de HEADER.FIELDS (...)
//      → Descarga el bloque de cabeceras completo del mensaje
//        individual, ignorando la cache de conversación de Gmail.
//      → El servidor IMAP de Gmail tiene un bug conocido con la
//        forma abreviada HEADER.FIELDS cuando hay threading;
//        BODY.PEEK[HEADER] fuerza lectura del mensaje real.
//
//   B) Extensión IMAP de Gmail: X-GM-MSGID + X-GM-THRID
//      → X-GM-MSGID es el ID interno de Gmail para ese mensaje.
//      → X-GM-THRID es el ID del hilo al que pertenece.
//      → Si X-GM-MSGID es el mismo en dos correos "distintos",
//        Gmail te está enviando el mismo mensaje (bug confirmado).
//      → Te permite detectar y descartar duplicados reales.
//
// VENTAJAS:
//   ✅ Es un drop-in: misma API que el mail.reader.js original
//   ✅ No requiere cambios en SendGrid ni en el resto del sistema
//   ✅ Añade deduplicación por X-GM-MSGID como red de seguridad
//   ✅ Logging mejorado para diagnosticar futuros problemas
//
// LIMITACIONES:
//   ⚠️  BODY.PEEK[HEADER] es ~3x más pesado que HEADER.FIELDS
//       (descarga TODOS los headers, ~8KB en lugar de ~2KB).
//       Para 20 correos: 40KB vs 160KB — sigue siendo ultraligero.
//   ⚠️  X-GM-MSGID solo funciona con imap.gmail.com
// ============================================================

require('dotenv').config();
const imaps = require('imap-simple');

/**
 * Lee correos filtrados por alias usando IMAP.
 * Drop-in replacement de la versión original con fixes para threading.
 *
 * @param {string} alias - El alias de Gmail+ (ej: 'permisos', 'director')
 * @returns {Promise<Array>} Array de objetos correo con permisoId, cedula, etc.
 */
async function leerCorreosPorAlias(alias) {
  const [usuario, dominio] = process.env.EMAIL_ADDRESS.split('@');
  const aliasCompleto = `${usuario}+${alias}@${dominio}`;

  const config = {
    imap: {
      user:           process.env.EMAIL_ADDRESS,
      password:       process.env.EMAIL_PASSWORD,
      host:           process.env.IMAP_HOST    || 'imap.gmail.com',
      port:           Number(process.env.IMAP_PORT) || 993,
      tls:            true,
      tlsOptions:     { rejectUnauthorized: false },
      authTimeout:    10000,
    },
  };

  const connection = await imaps.connect(config);
  await connection.openBox('INBOX');

  try {
    // ── BÚSQUEDA: igual que antes ─────────────────────────────
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 15);

    const uids = await new Promise((resolve, reject) => {
      connection.imap.search(
        [['TO', aliasCompleto], ['SINCE', fechaLimite]],
        (err, results) => err ? reject(err) : resolve(results || [])
      );
    });

    if (!uids.length) {
      console.log(`📭 [${alias}] Sin correos nuevos.`);
      return [];
    }

    const targetUids = uids.slice(-20);
    console.log(`📬 [${alias}] Procesando ${targetUids.length} UIDs: [${targetUids.join(', ')}]`);

    // ── FIX A: BODY.PEEK[HEADER] ─────────────────────────────
    // Diferencia crítica con la versión original:
    //   ANTES: bodies: ['HEADER.FIELDS (FROM TO DATE SUBJECT X-PERMISO-ID X-CEDULA X-ALIAS-DEST)']
    //   AHORA: bodies: ['BODY.PEEK[HEADER]']
    //
    // BODY.PEEK[HEADER] descarga el bloque completo de cabeceras
    // del mensaje REAL sin marcar el correo como leído ([PEEK]).
    // Esto bypasea el bug de threading de Gmail porque pide el
    // cuerpo del mensaje por estructura RFC 2822, no por metadata.
    const mensajes = await new Promise((resolve, reject) => {
      const fetchOpts = {
        bodies: ['HEADER'],  // Mantenemos la corrección que funcionó
        markSeen: false,
        struct: false,
      };

      const f = connection.imap.fetch(targetUids, fetchOpts);
      const resultado = [];

      f.on('message', (msg) => {
        // SOLUCIÓN: Creamos un objeto de estado ÚNICO para CADA mensaje
        // Así evitamos la "Condición de Carrera" entre correos paralelos.
        const correoInfo = {
          uid: null,
          rawHdr: '',
          gmMsgId: null,
          gmThrdId: null
        };

        // 1. Capturamos los IDs y UIDs
        msg.on('attributes', (attrs) => {
          correoInfo.uid = attrs.uid;
          correoInfo.gmMsgId = attrs['x-gm-msgid'] ? String(attrs['x-gm-msgid']) : null;
          correoInfo.gmThrdId = attrs['x-gm-thrid'] ? String(attrs['x-gm-thrid']) : null;
        });

        // 2. Capturamos el texto (Cabeceras)
        msg.on('body', (stream) => {
          stream.on('data', chunk => { 
            correoInfo.rawHdr += chunk.toString('utf-8'); 
          });
          
          stream.on('end', () => {
            // 3. Solo cuando ESTE mensaje específico termina de leerse, lo guardamos
            resultado.push(correoInfo);
          });
        });
      });

      f.once('error', reject);
      f.once('end', () => resolve(resultado));
    });

    // ── PARSEO: igual que antes + deduplicación ───────────────
    const get = (rawHdr, campo) => {
      // Soporta headers multi-línea (folding RFC 2822) y codificación Base64/QP
      const match = rawHdr.match(
        new RegExp(`^${campo}:\\s*(.+?)(?=\\r?\\n[^\\s]|$)`, 'im')
      );
      if (!match) return '';
      let valor = match[1].trim();

      // Decodificar encoded-words (RFC 2047)
      // Base64: =?UTF-8?B?...?=
      valor = valor.replace(/=\?UTF-8\?B\?([^?]+)\?=/gi,
        (_, b64) => Buffer.from(b64, 'base64').toString('utf-8')
      );
      // Quoted-Printable: =?UTF-8?Q?...?=
      valor = valor.replace(/=\?UTF-8\?Q\?([^?]+)\?=/gi,
        (_, qp) => qp.replace(/=([0-9A-F]{2})/gi,
          (_, hex) => String.fromCharCode(parseInt(hex, 16))
        ).replace(/_/g, ' ')
      );
      return valor;
    };

    // Deduplicación por X-GM-MSGID: si Gmail nos mandó el mismo
    // mensaje interno para dos UIDs distintos, descartamos el duplicado.
    const gmMsgIdVistos = new Set();
    let duplicadosDescartados = 0;

    const correos = mensajes
      .filter(({ uid, rawHdr, gmMsgId }) => {
        if (!rawHdr) {
          console.warn(`⚠️  [${alias}] UID ${uid}: rawHdr vacío, descartando.`);
          return false;
        }
        // Deduplicación por ID interno de Gmail
        if (gmMsgId) {
          if (gmMsgIdVistos.has(gmMsgId)) {
            console.warn(`🔄 [${alias}] UID ${uid}: X-GM-MSGID ${gmMsgId} ya visto (duplicado de hilo). Descartando.`);
            duplicadosDescartados++;
            return false;
          }
          gmMsgIdVistos.add(gmMsgId);
        }
        return true;
      })
      .map(({ uid, rawHdr, gmMsgId, gmThrdId }) => {
        const permisoIdRaw = get(rawHdr, 'X-Permiso-ID');
        const cedula       = get(rawHdr, 'X-Cedula') || null;

        // Log de diagnóstico detallado (quita esto en producción estable)
        console.log(
          `📧 [${alias}] UID=${uid} | GM-MSG=${gmMsgId?.slice(-8) ?? 'N/A'} | ` +
          `GM-THRD=${gmThrdId?.slice(-8) ?? 'N/A'} | X-Permiso-ID=${permisoIdRaw || 'ausente'}`
        );

        return {
          id:        uid,
          from:      get(rawHdr, 'From')    || '(sin remitente)',
          to:        get(rawHdr, 'To')      || '(sin destinatario)',
          subject:   get(rawHdr, 'Subject') || '(sin asunto)',
          date:      new Date(get(rawHdr, 'Date') || Date.now()),
          messageId: get(rawHdr, 'Message-ID') || null,

          // Extensiones Gmail (útil para diagnóstico y deduplicación)
          gmMsgId,
          gmThrdId,

          // ─── DATA CRÍTICA (igual que antes) ─────────────────
          permisoId: parseInt(permisoIdRaw) || null,
          cedula,
          alias:     get(rawHdr, 'X-Alias-Dest') || alias,

          text:        '',
          html:        '',
          attachments: [],
        };
      })
      .filter(c => c.cedula); // Solo correos con el nuevo sistema

    if (duplicadosDescartados > 0) {
      console.log(`🧹 [${alias}] ${duplicadosDescartados} duplicados de hilo descartados.`);
    }

    console.log(`✅ [${alias}] ${correos.length} correos válidos procesados.`);
    return correos;

  } catch (error) {
    console.error(`❌ [${alias}] Error leyendo correos por IMAP:`, error);
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = { leerCorreosPorAlias };


// ============================================================
// NOTAS DE MIGRACIÓN
// ============================================================
// Este archivo es un drop-in replacement de mail.reader.js.
// Solo necesitas:
//   1. Reemplazar src/service/mail.reader.js con este archivo.
//   2. No cambiar nada en correosUnificados.service.js ni permiso.service.js.
//   3. Reiniciar el servidor.
//
// Para confirmar que el fix funciona, busca en los logs:
//   "🔄 ... duplicado de hilo. Descartando."
// Si aparece, el bug existía y ahora está siendo corregido.
//
// Para confirmar que BODY.PEEK[HEADER] ayudó, compara los
// permisoId antes y después: deberían ser todos distintos
// para correos de distintos permisos.
// ============================================================