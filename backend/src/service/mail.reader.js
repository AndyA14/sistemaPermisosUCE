require('dotenv').config();
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');

/**
 * Lee los últimos 10 correos dirigidos a un alias específico (+alias) de Gmail.
 * Retorna contenido completo: texto, HTML, adjuntos y metadatos.
 * @param {string} alias - Parte del alias (ej: 'director', 'permisos', etc.)
 * @returns {Promise<Array>} Correos con cuerpo y adjuntos
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

  const searchCriteria = [['TO', aliasCompleto]];
  const fetchOptions = {
    bodies: [''], // Trae el cuerpo completo (MIME)
    struct: true,
    markSeen: false,
  };

  const messages = await connection.search(searchCriteria, fetchOptions);

  const correos = await Promise.all(
    messages.slice(-10).map(async (msg) => {
      const raw = msg.parts.find(p => p.which === '')?.body;
      const parsed = await simpleParser(raw);

      const adjuntos = parsed.attachments.map(att => ({
        filename: att.filename,
        contentType: att.contentType,
        size: `${(att.size / 1024).toFixed(1)} KB`,
      }));

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

  await connection.end();
  return correos;
}

module.exports = { leerCorreosPorAlias };