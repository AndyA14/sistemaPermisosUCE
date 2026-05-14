const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Normaliza un nombre de archivo eliminando tildes, símbolos y espacios.
 * @param {string} nombre - Nombre original del archivo
 * @returns {string} - Nombre limpio y seguro para el sistema de archivos
 */
function limpiarNombreArchivo(nombre) {
  return nombre
    .normalize("NFD")                          // Elimina acentos/tildes
    .replace(/[\u0300-\u036f]/g, "")          // Quita diacríticos
    .replace(/[^a-zA-Z0-9._-]/g, "_")         // Reemplaza caracteres inválidos
    .replace(/_+/g, "_")                      // Evita múltiples guiones bajos seguidos
    .replace(/^_+|_+$/g, "");                 // Elimina guiones bajos al inicio/final
}

/**
 * Genera un archivo PDF a partir de contenido HTML.
 * @param {string} htmlContenido - Contenido HTML a convertir
 * @param {string} nombreArchivo - Nombre del archivo PDF (sin limpiar)
 * @param {object} opcionesExtra - Configuraciones adicionales
 *        { landscape, margin, subcarpeta }
 * @returns {Promise<string>} Ruta relativa del PDF generado
 */
async function generarPDF(htmlContenido, nombreArchivo, opcionesExtra = {}) {
  const nombreSeguro = limpiarNombreArchivo(nombreArchivo);
  
  // Subcarpeta: 'certificados' por defecto, retrocompatibilidad con 'documentos'
  const subcarpeta = opcionesExtra.subcarpeta || 'documentos';
  const dirSalida = path.join('uploads', subcarpeta);

  // Crear carpeta si no existe
  if (!fs.existsSync(dirSalida)) {
    fs.mkdirSync(dirSalida, { recursive: true });
  }

  // Ruta final del archivo
  const rutaSalida = path.join(dirSalida, nombreSeguro);

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      protocolTimeout: 60000,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContenido, { waitUntil: 'networkidle0', timeout: 60000 });

    // Generar PDF con configuración base + opcionesExtra
    await page.pdf({
      path: rutaSalida,
      format: 'A4',
      printBackground: true,
      landscape: opcionesExtra.landscape || false,
      margin: opcionesExtra.margin || {
        top: '1.5cm',
        right: '1.5cm',
        bottom: '2cm',
        left: '1.5cm'
      }
    });

    await browser.close();
    return `/${rutaSalida.replace(/\\/g, '/')}`;

  } catch (error) {
    console.error('❌ Error interno en Puppeteer:', error);
    throw new Error('Error interno al generar el documento PDF.');
  }
}

module.exports = generarPDF;