// src/service/mail.reader.js
require('dotenv').config();
const imaps = require('imap-simple');

/**
 * Lee correos filtrados por alias usando IMAP.
 * Optimizado: solo descarga headers (≈2KB por correo, sin adjuntos).
 */
async function leerCorreosPorAlias(alias) {
  const aliasCompleto = `${process.env.EMAIL_ADDRESS.split('@')[0]}+${alias}@gmail.com`;

  const config = {
    imap: {
      user: process.env.EMAIL_ADDRESS,
      password: process.env.EMAIL_PASSWORD,
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: Number(process.env.IMAP_PORT) || 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000,
    },
  };

  const connection = await imaps.connect(config);
  await connection.openBox('INBOX');

  try {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 15);

    const uids = await new Promise((resolve, reject) => {
      connection.imap.search(
        [['TO', aliasCompleto], ['SINCE', fechaLimite]],
        (err, results) => {
          if (err) return reject(err);
          resolve(results || []);
        }
      );
    });

    if (!uids.length) return [];

    // Tomamos los últimos 20 correos (ligero porque solo leemos headers)
    const targetUids = uids.slice(-20);

    // ── FETCH ULTRALIGERO: SOLO HEADERS ─────────────────────────────
    const mensajes = await new Promise((resolve, reject) => {
      const fetchOpts = {
        bodies: ['HEADER.FIELDS (FROM TO DATE SUBJECT X-PERMISO-ID X-CEDULA X-ALIAS-DEST)'],
        markSeen: false,
      };

      const f = connection.imap.fetch(targetUids, fetchOpts);
      const resultado = [];

      f.on('message', (msg) => {
        let uid = null;
        let rawHdr = '';

        msg.on('attributes', attrs => { uid = attrs.uid; });

        msg.on('body', (stream) => {
          stream.on('data', chunk => {
            rawHdr += chunk.toString('utf-8');
          });

          stream.on('end', () => {
            resultado.push({ uid, rawHdr });
          });
        });
      });

      f.once('error', reject);
      f.once('end', () => resolve(resultado));
    });

    // ── PARSEO MANUAL DE HEADERS (sin mailparser) ────────────────────
    const correos = mensajes.map(({ uid, rawHdr }) => {

      const get = (campo) => {
        const match = rawHdr.match(
          new RegExp(`^${campo}:\\s*(.+?)(?=\\r?\\n[^\\s]|$)`, 'im')
        );
        return match ? match[1].trim() : '';
      };

      return {
        id: uid,
        from: get('From') || '(sin remitente)',
        to: get('To') || '(sin destinatario)',
        subject: get('Subject') || '(sin asunto)',
        date: new Date(get('Date') || Date.now()),

        // ─── DATA CRÍTICA DESDE X-HEADERS ────────────────────────────
        permisoId: parseInt(get('X-Permiso-ID')) || null,
        cedula: get('X-Cedula') || null,
        alias: get('X-Alias-Dest') || alias,

        // Ya no descargamos cuerpo
        text: '',
        html: '',
        attachments: [],
      };

    })
    // Filtramos solo correos que ya usan el nuevo sistema
    .filter(c => c.cedula);

    return correos;

  } catch (error) {
    console.error('❌ Error leyendo correos por IMAP:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = { leerCorreosPorAlias };