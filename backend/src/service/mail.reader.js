// src/service/mail.reader.js
require('dotenv').config();
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');

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
      connection.imap.search([['TO', aliasCompleto], ['SINCE', fechaLimite]], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (!uids || uids.length === 0) return [];

    const ultimos5Uids = uids.slice(-5);

    // ==========================================
    // FASE 2: DESCARGA ULTRA-LIGERA (SOLO TEXTO)
    // ==========================================
    // ==========================================
    // FASE 2: DESCARGA NATIVA
    // ==========================================
    const messagesDetallados = await new Promise((resolve, reject) => {
      const fetchOptions = { bodies: [''], struct: true, markSeen: false };
      const f = connection.imap.fetch(ultimos5Uids, fetchOptions);
      
      const msgs = [];
      f.on('message', (msg, seqno) => {
        const message = { attributes: null, parts: [] };
        
        msg.on('body', (stream, info) => {
          let bodyBuffer = Buffer.alloc(0);
          stream.on('data', (chunk) => {
            bodyBuffer = Buffer.concat([bodyBuffer, chunk]); 
          });
          stream.on('end', () => {
            message.parts.push({ which: info.which, size: info.size, body: bodyBuffer });
          });
        });
        
        msg.on('attributes', attrs => message.attributes = attrs);
        msg.on('end', () => msgs.push(message));
      });
      
      f.once('error', reject);
      f.once('end', () => resolve(msgs));
    });

    const correos = await Promise.all(
      messagesDetallados.map(async (msg) => {
        const rawPart = msg.parts.find(p => p.which === '');
        if (!rawPart || !rawPart.body) return null;

        // === OPTIMIZACIÓN NIVEL DIOS (RESTAURADA) ===
        // Evitamos que el parser gaste recursos en buscar adjuntos o links
        const parsed = await simpleParser(rawPart.body, {
          skipHtmlToText: true,
          skipTextToHtml: true,
          skipTextLinks: true,
          skipImageLinks: true,
        });

        const adjuntos = parsed.attachments ? parsed.attachments.map(att => ({
          filename: att.filename,
          contentType: att.contentType,
          size: `${(att.size / 1024).toFixed(1)} KB`,
        })) : [];

        return {
          id: msg.attributes.uid,
          from: parsed.from?.text || '(sin remitente)',
          to: parsed.to?.text || '(sin destinatario)',
          subject: parsed.subject || '(sin asunto)',
          date: parsed.date || new Date(),
          text: parsed.text || '',
          html: parsed.html || '',
          attachments: adjuntos,
        };
      })
    );

    return correos.filter(c => c !== null);

  } finally {
    await connection.end();
  }
}

module.exports = { leerCorreosPorAlias };