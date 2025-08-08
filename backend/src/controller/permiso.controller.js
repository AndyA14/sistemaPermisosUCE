// controllers/permiso.controller.js
const permisoService = require('../service/permiso.service');
const { responderCorreoPermiso } = require('../service/mail.responder.service');
const { generarCartaRespuestaHTML } = require('../service/emailTemplates.service');
const { obtenerUsuarioDirector } = require('../service/usuario.service');
const { AppDataSource } = require('../config/database');
const DocumentoPermiso = require('../entity/DocumentoPermiso');
const generarPDF = require('../utils/generarPDF');


module.exports = {
  async crearPermiso(req, res) {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) return res.status(401).json({ error: 'No autenticado' });

      const nuevoPermiso = await permisoService.crearPermiso({
        usuarioId,
        body: req.body,
        file: req.file,
      });

      return res.status(201).json(nuevoPermiso);
    } catch (err) {
      console.error('crearPermiso error:', err);
      // Respuesta clara si es por correo
      const mensaje = err.message.includes('correo')
        ? 'Error al enviar el correo. El permiso no fue creado.'
        : 'Error al crear permiso.';
      res.status(500).json({ error: mensaje });
    }
  },

  async autorizarPermiso(req, res) {
    try {
      const permisoId = parseInt(req.params.id);
      if (isNaN(permisoId)) return res.status(400).json({ error: 'ID de permiso inválido' });

      const permisoActual = await permisoService.obtenerPermisoPorId(permisoId);
      if (!permisoActual) return res.status(404).json({ error: 'Permiso no encontrado' });

      const usuario = permisoActual.usuario;
      const emailUsuario = usuario?.correo;
      const nombresUsuario = `${usuario?.nombres || ''} ${usuario?.apellidos || ''}`.trim();
      if (!emailUsuario || !emailUsuario.includes('@')) {
        throw new Error(`Correo del usuario inválido: ${emailUsuario}`);
      }

      const director = await obtenerUsuarioDirector();
      if (!director) throw new Error('No se encontró un usuario con rol director');

      // Generar HTML de carta
      const cartaHtml = await generarCartaRespuestaHTML({
        nombresUsuario,
        estado: 'autorizado',
        observacion: req.body.observacion,
        cedula: usuario?.ci || usuario?.cedula || 'No registrada',
        correo: emailUsuario,
        telefono: usuario?.telefono || '',
        direccion: usuario?.direccion || '',
        director,
      });

      // Generar PDF
      const timestamp = Date.now();
      const nombrePDF = `${usuario.apellidos}_${usuario.nombres}_${timestamp}_AUTORIZADO.pdf`.replace(/\s+/g, '_');
      const pdfUrl = await generarPDF(cartaHtml, nombrePDF);

      // Enviar correo ANTES de modificar estado o guardar PDF
      await responderCorreoPermiso({
        to: emailUsuario,
        subject: `Permiso AUTORIZADO - ${nombresUsuario}`,
        html: cartaHtml,
      });

      // Si el correo se envió correctamente, continuar
      const docRepo = AppDataSource.getRepository(DocumentoPermiso);
      const pdfDoc = docRepo.create({
        permiso: { id: permisoId },
        url: pdfUrl,
        tipo: 'Respuesta PDF',
      });
      await docRepo.save(pdfDoc);

      await permisoService.modificarEstadoPermiso({
        permisoId,
        estado: 'autorizado',
        observacion: req.body.observacion,
        carga_vacaciones: req.body.carga_vacaciones,
        username: req.usuario?.username || 'desconocido',
      });

      res.json({ mensaje: 'Permiso autorizado correctamente' });

    } catch (err) {
      console.error('autorizarPermiso error:', err.message || err);
      res.status(500).json({ error: err.message || 'Error al autorizar permiso' });
    }
  },

  async denegarPermiso(req, res) {
    try {
      const permisoId = parseInt(req.params.id);
      if (isNaN(permisoId)) return res.status(400).json({ error: 'ID de permiso inválido' });

      const permisoActual = await permisoService.obtenerPermisoPorId(permisoId);
      if (!permisoActual) return res.status(404).json({ error: 'Permiso no encontrado' });

      const usuario = permisoActual.usuario;
      const emailUsuario = usuario?.correo;
      const nombresUsuario = `${usuario?.nombres || ''} ${usuario?.apellidos || ''}`.trim();
      if (!emailUsuario || !emailUsuario.includes('@')) {
        throw new Error(`Correo del usuario inválido: ${emailUsuario}`);
      }

      const director = await obtenerUsuarioDirector();
      if (!director) throw new Error('No se encontró un usuario con rol director');

      // Generar HTML de carta
      const cartaHtml = await generarCartaRespuestaHTML({
        nombresUsuario,
        estado: 'denegado',
        observacion: req.body.observacion,
        cedula: usuario?.ci || usuario?.cedula || 'No registrada',
        correo: emailUsuario,
        telefono: usuario?.telefono || '',
        direccion: usuario?.direccion || '',
        director,
      });

      // Generar PDF
      const timestamp = Date.now();
      const nombrePDF = `${usuario.apellidos}_${usuario.nombres}_${timestamp}_DENEGADO.pdf`.replace(/\s+/g, '_');
      const pdfUrl = await generarPDF(cartaHtml, nombrePDF);

      // Enviar correo ANTES de guardar cambios
      await responderCorreoPermiso({
        to: emailUsuario,
        subject: `Permiso DENEGADO - ${nombresUsuario}`,
        html: cartaHtml,
      });

      // Si el correo se envió, guardar el PDF y actualizar estado
      const docRepo = AppDataSource.getRepository(DocumentoPermiso);
      const pdfDoc = docRepo.create({
        permiso: { id: permisoId },
        url: pdfUrl,
        tipo: 'Respuesta PDF',
      });
      await docRepo.save(pdfDoc);

      await permisoService.modificarEstadoPermiso({
        permisoId,
        estado: 'denegado',
        observacion: req.body.observacion,
        carga_vacaciones: req.body.carga_vacaciones,
        username: req.usuario?.username || 'desconocido',
      });

      res.json({ mensaje: 'Permiso denegado correctamente' });

    } catch (err) {
      console.error('denegarPermiso error:', err.message || err);
      res.status(500).json({ error: err.message || 'Error al denegar permiso' });
    }
  },

  async editarPermiso(req, res) {
    try {
      const permisoId = parseInt(req.params.id);
      const actualizado = await permisoService.editarPermiso({
        permisoId,
        cambios: req.body,
        username: req.user?.username || 'desconocido',
      });
      res.json(actualizado);
    } catch (err) {
      console.error('editarPermiso error:', err);
      res.status(400).json({ error: err.message });
    }
  },

  async filtrarPermisos(req, res) {
    try {
      const filtros = {
        usuario_id: req.query.id,
        estado_general: req.query.estado_general,
      };
      const resultados = await permisoService.filtrarPermisos(filtros);
      res.json(resultados);
    } catch (err) {
      console.error('filtrarPermisos error:', err);
      res.status(500).json({ error: 'Error al filtrar permisos' });
    }
  },

  async subirDocumento(req, res) {
    try {
      if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });

      const documento = await permisoService.subirDocumento({
        permisoId: parseInt(req.params.id),
        fileUrl: `/uploads/documentos/${req.file.filename}`,
        tipo: req.body.tipo || 'Adjunto',
      });

      res.status(201).json(documento);
    } catch (err) {
      console.error('subirDocumento error:', err);
      res.status(500).json({ error: 'Error al subir documento' });
    }
  },

  async revisarPorTTHH(req, res) {
    try {
      const permisoId = parseInt(req.params.id, 10);
      if (isNaN(permisoId)) {
        return res.status(400).json({ error: 'ID de permiso inválido' });
      }

      const { observacion } = req.body;
      const username = req.usuario?.username || 'sistema';

      // Llama al servicio con observacion opcional
      const permisoActualizado = await permisoService.revisarPorTTHH({
        permisoId,
        observacion, // puede ser undefined o string vacío
        username,
      });

      res.status(200).json(permisoActualizado);
    } catch (error) {
      console.error('Error en revisión TTHH:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

};
