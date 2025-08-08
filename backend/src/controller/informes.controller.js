// controllers/informes.controller.js
const informesService = require('../service/informes.service');
const { manejarError } = require('../utils/manejoErrores');
const generarZip = require('../utils/generarZip');

exports.buscarusuarios = async (req, res) => {
  const { nombre } = req.query;
  if (!nombre) return res.status(400).json({ mensaje: 'Nombre es requerido' });

  try {
    const usuarios = await informesService.buscarUsuariosPorNombre(nombre);
    res.json(usuarios);
  } catch (err) {
    manejarError(res, err);
  }
};

exports.generarInforme = async (req, res) => {
  const { mes, anio, desde, hasta, nombre } = req.query;

  if (!(mes && anio) && !(desde && hasta)) {
    return res.status(400).json({ mensaje: 'Debe especificar mes+anio o desde+hasta' });
  }

  try {
    const filtros = await informesService.construirFiltrosPermisos({ mes, anio, desde, hasta, nombre });
    const permisos = await informesService.obtenerPermisos(filtros);

    if (permisos.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron permisos para ese filtro' });
    }

    await generarZip.generarZip(res, permisos, nombre || (mes ? `${mes}-${anio}` : `${desde}_a_${hasta}`));
  } catch (err) {
    manejarError(res, err);
  }
};

exports.misPermisos = async (req, res) => {
  try {
    const permisos = await informesService.misPermisos(req.usuario.id);
    res.json(permisos);
  } catch (err) {
    manejarError(res, err);
  }
};

exports.permisosPorTipo = async (req, res) => {
  try {
    const result = await informesService.permisosPorTipo();
    res.json(result);
  } catch (err) {
    manejarError(res, err);
  }
};

exports.topusuarios = async (req, res) => {
  try {
    const result = await informesService.topUsuarios();
    res.json(result);
  } catch (err) {
    manejarError(res, err);
  }
};

exports.permisosPorMes = async (req, res) => {
  try {
    const result = await informesService.permisosPorMes();
    res.json(result);
  } catch (err) {
    manejarError(res, err);
  }
};

exports.ultimosPermisos = async (req, res) => {
  try {
    const permisos = await informesService.ultimosPermisos();
    res.json(permisos);
  } catch (err) {
    manejarError(res, err);
  }
};

exports.resumenGeneral = async (req, res) => {
  try {
    const resumen = await informesService.resumenGeneral();
    res.json(resumen);
  } catch (err) {
    manejarError(res, err);
  }
};
