// backend/src/controller/certificado.controller.js
const { AppDataSource } = require('../config/database');
const crypto = require('crypto');

// Obtener el repositorio (tabla) usando EntitySchema
const Certificado = require('../entity/Certificado'); 

const crearCertificado = async (req, res) => {
  try {
    // 1. Recibimos los datos directamente como texto
    const { 
      estudiante_nombres, 
      estudiante_apellidos, 
      estudiante_ci, 
      nivel_ingles, 
      fecha_aprobacion, 
      docente_id, 
      director_id 
    } = req.body;

    const admin_id = req.usuario.id; // Middleware de auth guarda el id del usuario que hace la petición

    // 2. Generar un PIN único de 8 caracteres (Ej: A4B7-9X2P)
    const generarPin = () => {
      const pin = crypto.randomBytes(4).toString('hex').toUpperCase();
      return `${pin.slice(0, 4)}-${pin.slice(4, 8)}`;
    };

    const certificadoRepo = AppDataSource.getRepository(Certificado);

    // 3. Crear el objeto a guardar con los datos del estudiante directamente
    const nuevoCertificado = certificadoRepo.create({
      pin_verificacion: generarPin(),
      estudiante_nombres,
      estudiante_apellidos,
      estudiante_ci,
      nivel_ingles,
      fecha_aprobacion,
      docente: { id: docente_id },
      director: { id: director_id },
      admin_creador: { id: admin_id },
      estado: 'PENDIENTE_DOCENTE',
    });

    // 4. Guardar en base de datos
    const certificadoGuardado = await certificadoRepo.save(nuevoCertificado);

    res.status(201).json({
      mensaje: 'Certificado creado exitosamente. Esperando firma del docente.',
      certificado: certificadoGuardado
    });

  } catch (error) {
    console.error('Error al crear certificado:', error);
    res.status(500).json({ error: 'Hubo un error al generar el certificado' });
  }
};

module.exports = {
  crearCertificado,
};