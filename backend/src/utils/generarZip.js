const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { PDFDocument } = require('pdf-lib');

/**
 * Genera un ZIP con un PDF por permiso (combinado) + permisos.json
 */
async function generarZip(res, permisos, nombre = 'reporte') {
  try {
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Configura la respuesta como archivo ZIP descargable
    res.attachment(`informe_permisos_${nombre}.zip`);
    archive.pipe(res);

    // Añadir el JSON de permisos al ZIP
    archive.append(JSON.stringify(permisos, null, 2), { name: 'permisos.json' });

    let permisosProcesados = 0;

    for (const permiso of permisos) {
      const documentosOrdenados = ordenarDocumentos(permiso.documentos);

      const pathsValidos = documentosOrdenados
        .map(doc => {
          const filename = doc.url?.split('/').pop();
          const filePath = path.resolve('uploads', 'documentos', filename);
          return fs.existsSync(filePath) ? filePath : null;
        })
        .filter(Boolean);

      if (pathsValidos.length === 0) continue;

      const pdfCombinado = await combinarPDFs(pathsValidos);

      // ⚠️ Validar que se obtuvo un buffer válido antes de agregar
      if (!pdfCombinado || !(pdfCombinado instanceof Buffer)) {
        console.warn(`❌ PDF combinado inválido para permiso ID: ${permiso.id}`);
        continue;
      }

      const nombreArchivo = construirNombreArchivo(permiso);

      archive.append(pdfCombinado, { name: `informes/${nombreArchivo}` });
      permisosProcesados++;
    }

    if (permisosProcesados === 0) {
      return res.status(400).json({ mensaje: 'No se encontraron archivos PDF válidos en los permisos' });
    }

    await archive.finalize();

  } catch (err) {
    console.error('🚨 Error al generar el ZIP:', err);
    res.status(500).json({ mensaje: 'Error interno al generar el ZIP', error: err.message });
  }
}

/**
 * Ordena los documentos según prioridad requerida.
 * Respuesta PDF → Generado PDF → Adjunto
 */
function ordenarDocumentos(documentos = []) {
  const prioridad = {
    'Respuesta PDF': 1,
    'Generado PDF': 2,
    'Adjunto': 3,
  };

  return documentos.sort((a, b) => (prioridad[a.tipo] || 99) - (prioridad[b.tipo] || 99));
}

/**
 * Une múltiples PDFs en un solo buffer. Ignora archivos corruptos.
 */
async function combinarPDFs(filePaths) {
  const pdfFinal = await PDFDocument.create();

  for (const filePath of filePaths) {
    try {
      const fileData = fs.readFileSync(filePath);
      const pdf = await PDFDocument.load(fileData);
      const copiedPages = await pdfFinal.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(p => pdfFinal.addPage(p));
    } catch (err) {
      console.warn(`❗ Error al procesar PDF: ${filePath}`, err.message);
    }
  }

  const bytes = await pdfFinal.save();

  // Convertir a Buffer y devolver solo si hay contenido
  return bytes.length > 0 ? Buffer.from(bytes) : null;
}

/**
 * Construye el nombre del PDF final por permiso.
 * Ejemplo: "Apellido_Nombre_Tipo_Estado_123456.pdf"
 */
function construirNombreArchivo(permiso) {
  const nombres = sanitizarTexto(permiso.usuario?.nombres || 'Nombre');
  const apellidos = sanitizarTexto(permiso.usuario?.apellidos || 'Apellido');
  const tipo = sanitizarTexto(permiso.tipo?.nombre || 'Tipo');
  const estado = sanitizarTexto(permiso.estado_general || 'Estado');
  const codigo = permiso.id || Date.now();

  return `${apellidos}_${nombres}_${tipo}_${estado}_${codigo}.pdf`;
}

/**
 * Elimina espacios, caracteres especiales y tildes del texto.
 */
function sanitizarTexto(texto) {
  return texto
    .normalize("NFD")                     // elimina tildes
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, '_')                // reemplaza espacios con guiones bajos
    .replace(/[^\w\-]/gi, '');           // elimina caracteres especiales
}

module.exports = {
  generarZip
};
