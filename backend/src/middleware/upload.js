// src/middleware/uploadDocumentos.js
const multer = require('multer');
const path = require('path');

// Configuración del almacenamiento: carpeta y nombre archivo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documentos'); // carpeta fija, se puede parametrizar si quieres
  },
  filename: (req, file, cb) => {
    // Usamos originalname, podrías agregar timestamp para evitar colisiones
    cb(null, file.originalname);
  }
});

// Extensiones permitidas para validación
const EXTENSIONES_PERMITIDAS = ['.pdf', '.jpg', '.jpeg', '.png'];

// Configuración del filtro de archivos
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!EXTENSIONES_PERMITIDAS.includes(ext)) {
    return cb(new Error('Tipo de archivo no permitido'));
  }

  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

module.exports = upload;
