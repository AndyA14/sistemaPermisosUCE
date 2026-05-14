// backend/src/controller/certificado.controller.js
const { AppDataSource } = require('../config/database');
const crypto = require('crypto');

// Entidades
const Certificado = require('../entity/Certificado'); 
const Usuario = require('../entity/Usuario'); 

// Utilidades
const generarPDF = require('../utils/generarPDF');
const { generarHTMLCertificado } = require('../utils/certificadoTemplate');

const crearCertificado = async (req, res) => {
  console.log('\n==================================================');
  console.log('🚀 INICIANDO GENERACIÓN DE NUEVO CERTIFICADO...');

  try {
    const { 
      estudiante_nombres, 
      estudiante_apellidos, 
      estudiante_ci, 
      nivel_ingles, 
      fecha_aprobacion, 
      docente_id, 
      director_id 
    } = req.body;

    const admin_id = req.usuario.id; 
    console.log(`[Paso 1] Datos recibidos: Estudiante -> ${estudiante_nombres} ${estudiante_apellidos} (CI: ${estudiante_ci})`);

    // 1. Generar PIN único (Ej: A4B7-9X2P)
    const generarPin = () => {
      const pin = crypto.randomBytes(4).toString('hex').toUpperCase();
      return `${pin.slice(0, 4)}-${pin.slice(4, 8)}`;
    };
    const pin_verificacion = generarPin();
    console.log(`[Paso 2] PIN Generado: ${pin_verificacion}`);

    // 2. Obtener nombres de Docente y Director desde la BD
    console.log(`[Paso 3] Buscando usuarios Docente(ID:${docente_id}) y Director(ID:${director_id}) en BD...`);
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const docente = await usuarioRepo.findOne({ where: { id: docente_id } });
    const director = await usuarioRepo.findOne({ where: { id: director_id } });

    if (!docente || !director) {
      console.log('❌ Error: El Docente o Director no existen en la BD.');
      return res.status(404).json({ error: 'Docente o Director seleccionados no existen.' });
    }
    console.log(`[Paso 3.1] Usuarios encontrados: ${docente.nombres} ${docente.apellidos} (Docente), ${director.nombres} ${director.apellidos} (Director).`);

    // 3. Compilar HTML del certificado
    console.log('[Paso 4] Compilando plantilla HTML del certificado...');
    const datosParaHTML = {
      estudiante_nombres,
      estudiante_apellidos,
      nivel_ingles,
      fecha_aprobacion,
      docente_nombre: `${docente.nombres} ${docente.apellidos}`,
      director_nombre: `${director.nombres} ${director.apellidos}`,
      pin_verificacion
    };
    const htmlContenido = generarHTMLCertificado(datosParaHTML);

    // 4. Generar PDF
    console.log('[Paso 5] Inicializando Puppeteer para generar el PDF...');
    const nombreArchivoPdf = `Certificado_${estudiante_ci}_${Date.now()}.pdf`;

    const rutaPdf = await generarPDF(htmlContenido, nombreArchivoPdf, {
      landscape: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }, // Sin márgenes
      subcarpeta: 'certificados' // Guardamos siempre en uploads/certificados
    });
    console.log(`[Paso 5.1] ✅ PDF guardado físicamente en: ${rutaPdf}`);

    // 5. Guardar en Base de Datos
    console.log('[Paso 6] Guardando registro final en PostgreSQL...');
    const certificadoRepo = AppDataSource.getRepository(Certificado);
    const nuevoCertificado = certificadoRepo.create({
      pin_verificacion,
      estudiante_nombres,
      estudiante_apellidos,
      estudiante_ci,
      nivel_ingles,
      fecha_aprobacion,
      docente: { id: docente_id },
      director: { id: director_id },
      admin_creador: { id: admin_id },
      estado: 'PENDIENTE_DOCENTE',
      ruta_pdf: rutaPdf
    });

    const certificadoGuardado = await certificadoRepo.save(nuevoCertificado);

    console.log('🎉 PROCESO COMPLETADO CON ÉXITO.');
    console.log('==================================================\n');

    res.status(201).json({
      mensaje: 'Certificado generado y guardado exitosamente.',
      certificado: certificadoGuardado,
      ruta_pdf: rutaPdf
    });

  } catch (error) {
    console.error('❌ ERROR CRÍTICO AL CREAR CERTIFICADO:', error);
    res.status(500).json({ error: 'Hubo un error interno al generar el documento PDF.' });
  }
};

module.exports = { crearCertificado };