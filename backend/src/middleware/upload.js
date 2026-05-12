const multer = require('multer');
const path = require('path');
const crypto = require('crypto'); // 👈 Aquí importamos el generador de IDs

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documentos'); 
  },
  filename: (req, file, cb) => {
    // 1. TU IDEA: Generamos un ID único de 16 caracteres aleatorios (Ej: a8f7b2c9d3...)
    const idUnico = crypto.randomBytes(16).toString('hex');
    
    // 2. Extraemos solo la extensión del archivo original (Ej: .png o .pdf)
    const extension = path.extname(file.originalname).toLowerCase();
    
    // 3. El archivo se guarda SOLO con el ID y su extensión. ¡Adiós a los nombres cruzados!
    cb(null, `${idUnico}${extension}`);
  }
});

const EXTENSIONES_PERMITIDAS = ['.pdf', '.jpg', '.jpeg', '.png'];

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