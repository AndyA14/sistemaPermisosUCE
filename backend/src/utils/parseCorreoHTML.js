// src/utils/parseCorreoHTML.js
const cheerio = require('cheerio');

/**
 * Extrae cédula y fecha del contenido HTML del correo.
 * Si no se encuentra fecha en el texto, se usa el campo `metadata.date`.
 * @param {string} html - Contenido HTML del correo
 * @param {object} metadata - Datos adicionales del correo (como `date`)
 * @returns {{ cedula: string|null, fecha: string|null }}
 */
function parseCorreoHTML(html, metadata = {}) {
  try {
    const $ = cheerio.load(html);
    const textoPlano = $('body').text();

    // Buscar cédula: 10 dígitos después de "C.I." o "cédula"
    const cedulaMatch = textoPlano.match(/(?:C\.I\.|c[ée]dula).*?(\d{10})/i);
    let cedula = cedulaMatch?.[1] || null;

    // Buscar fecha textual o ISO en el contenido
    const fechaMatch = textoPlano.match(/(?:el día|ocurrid[ao]).*?(\d{2} de .*? de \d{4}|\d{4}-\d{2}-\d{2})/i);
    let fecha = fechaMatch?.[1] || null;

    // Normalizar fecha textual al formato YYYY-MM-DD
    if (fecha && fecha.includes('de')) {
      const meses = {
        enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
        julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
      };
      const [dia, mesTexto, anio] = fecha.toLowerCase().replace(/[^\w\s]/gi, '').split(' de ');
      const mes = meses[mesTexto];
      fecha = `${anio}-${mes}-${dia.padStart(2, '0')}`;
    }

    // Si no se detectó fecha en el texto, usar metadata.date
    if (!fecha && metadata.date) {
      try {
        const dateObj = new Date(metadata.date);
        fecha = dateObj.toISOString().slice(0, 10); // YYYY-MM-DD
      } catch (err) {
        console.warn('⚠️ Fecha inválida en metadata.date:', metadata.date);
      }
    }

    return { cedula, fecha };
  } catch (error) {
    console.error('❌ Error al parsear HTML del correo:', error);
    return { cedula: null, fecha: null };
  }
}

module.exports = parseCorreoHTML;
