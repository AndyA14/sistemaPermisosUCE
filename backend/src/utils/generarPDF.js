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
 * @returns {Promise<string>} Ruta relativa del PDF generado
 */
async function generarPDF(htmlContenido, nombreArchivo) {
  const nombreSeguro = limpiarNombreArchivo(nombreArchivo);
  const rutaSalida = path.join('uploads', 'documentos', nombreSeguro);

  try {
    // Lanza el navegador con opciones seguras para entornos como Docker
    const browser = await puppeteer.launch({
      headless: 'new',
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      protocolTimeout: 60000,
    });

    const page = await browser.newPage();

    // Carga el contenido HTML
    await page.setContent(htmlContenido, { waitUntil: 'networkidle0', timeout: 60000 });

    // Crea el PDF con formato A4 y márgenes definidos
    await page.pdf({
      path: rutaSalida,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1.5cm',
        right: '1.5cm',
        bottom: '2cm',
        left: '1.5cm'
      }
    });

    await browser.close();

    // Devuelve la ruta relativa para guardar en la base de datos o devolver al cliente
    return `/${rutaSalida.replace(/\\/g, '/')}`;
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    throw new Error('Error interno al generar el documento PDF.');
  }
}

module.exports = generarPDF;
