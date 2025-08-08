// services/informes.service.js
const { AppDataSource } = require('../config/database');
const archiver = require('archiver');
const path = require('path');
const { Between, In, ILike } = require('typeorm');

const getRepo = (entity) => AppDataSource.getRepository(entity);

/**
 * Obtiene permisos según filtros, con relaciones usuario, tipo, documentos.
 */
async function obtenerPermisos(filtros = {}, opciones = {}) {
  const permisoRepo = getRepo('Permiso');
  return permisoRepo.find({
    where: filtros,
    relations: ['tipo', 'documentos', 'usuario'],
    order: { fecha_inicio: 'DESC' },
    ...opciones,
  });
}


/**
 * Buscar usuarios por nombre o apellido (filtrado para permisos).
 */
async function buscarUsuariosPorNombre(nombre) {
  const usuarioRepo = getRepo('Usuario');
  return usuarioRepo.find({
    where: [
      { nombres: ILike(`%${nombre}%`) },
      { apellidos: ILike(`%${nombre}%`) },
    ],
    select: ['id', 'nombres', 'apellidos'],
  });
}

/**
 * Construir filtros para permisos con usuario y fechas.
 */
async function construirFiltrosPermisos({ mes, anio, desde, hasta, nombre }) {
  const filtros = {};

  if (mes && anio) {
    const fechaInicio = new Date(`${anio}-${mes}-01`);
    const fechaFin = new Date(`${anio}-${mes}-31`);
    filtros.fecha_inicio = Between(fechaInicio, fechaFin);
  } else if (desde && hasta) {
    filtros.fecha_inicio = Between(new Date(desde), new Date(hasta));
  }

  if (nombre) {
    const usuarioRepo = getRepo('Usuario');
    const usuarios = await usuarioRepo
      .createQueryBuilder('u')
      .select(['u.id'])
      .where(`LOWER(u.nombres || ' ' || u.apellidos) LIKE LOWER(:nombre)`, { nombre: `%${nombre}%` })
      .getMany();

    const usuariosIds = usuarios.map(u => u.id);
    filtros.usuario = { id: In(usuariosIds.length > 0 ? usuariosIds : [0]) };
  }

  return filtros;
}

/**
 * Conteo simple para cualquier repositorio y condición.
 */
async function contar(repo, where = {}) {
  return repo.count({ where });
}

/**
 * Resumen estadístico general de usuarios y permisos.
 */
async function resumenGeneral() {
  const usuarioRepo = getRepo('Usuario');
  const permisoRepo = getRepo('Permiso');

  const [totalUsuarios, usuariosActivos, pendientes, autorizados, denegados] = await Promise.all([
    contar(usuarioRepo),
    contar(usuarioRepo, { estado: true }), // asumí que 'activo' es el campo correcto para usuarios activos
    contar(permisoRepo, { estado_general: 'pendiente' }),
    contar(permisoRepo, { estado_general: 'autorizado' }),
    contar(permisoRepo, { estado_general: 'denegado' }),
  ]);

  return {
    totalUsuarios,
    usuariosActivos,
    permisosPendientes: pendientes,
    permisosAutorizados: autorizados,
    permisosDenegados: denegados,
  };
}

/**
 * Obtener permisos de un usuario específico.
 */
async function misPermisos(usuarioId) {
  return obtenerPermisos({ usuario: { id: usuarioId } });
}

/**
 * Permisos agrupados por tipo.
 */
async function permisosPorTipo() {
  const permisoRepo = getRepo('Permiso');
  return permisoRepo
    .createQueryBuilder('permiso')
    .leftJoin('permiso.tipo', 'tipo')
    .select('tipo.nombre', 'tipo')
    .addSelect('COUNT(*)', 'total')
    .groupBy('tipo.nombre')
    .orderBy('total', 'DESC')
    .getRawMany();
}

/**
 * Top 5 usuarios con más permisos.
 */
async function topUsuarios() {
  const permisoRepo = getRepo('Permiso');
  return permisoRepo
    .createQueryBuilder('permiso')
    .select('permiso.usuario_id', 'usuario_id')
    .addSelect('usuario.nombres', 'nombres')
    .addSelect('usuario.apellidos', 'apellidos')
    .addSelect('COUNT(*)', 'total')
    .innerJoin('permiso.usuario', 'usuario')
    .groupBy('permiso.usuario_id')
    .addGroupBy('usuario.nombres')
    .addGroupBy('usuario.apellidos')
    .orderBy('total', 'DESC')
    .limit(5)
    .getRawMany();
}

/**
 * Permisos autorizados/denegados por mes (últimos 6 meses).
 */
async function permisosPorMes() {
  const permisoRepo = getRepo('Permiso');

  // Fecha actual al inicio del día
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Calcular fecha desde (primer día del mes, 5 meses atrás)
  const desde = new Date(hoy);
  desde.setMonth(desde.getMonth() - 5); // incluye el mes actual y 5 anteriores
  desde.setDate(1); // primer día del mes
  desde.setHours(0, 0, 0, 0);

  const resultados = await permisoRepo
    .createQueryBuilder('permiso')
    .select("TO_CHAR(permiso.fecha_inicio, 'YYYY-MM')", 'mes')
    .addSelect('LOWER(permiso.estado_general)', 'estado')
    .addSelect('COUNT(*)', 'total')
    .where("LOWER(permiso.estado_general) IN (:...estados)", { estados: ['autorizado', 'denegado'] })
    .andWhere('permiso.fecha_inicio >= :desde', { desde: desde.toISOString() }) // comparar con tipo fecha
    .groupBy("mes, estado")
    .orderBy('mes', 'ASC')
    .addOrderBy('estado', 'ASC')
    .getRawMany();
    
  return resultados;
}


/**
 * Últimos 10 permisos registrados.
 */
async function ultimosPermisos() {
  return obtenerPermisos({}, { take: 10, order: { fecha_solicitud: 'DESC' } });
}

module.exports = {
  obtenerPermisos,
  buscarUsuariosPorNombre,
  construirFiltrosPermisos,
  resumenGeneral,
  misPermisos,
  permisosPorTipo,
  topUsuarios,
  permisosPorMes,
  ultimosPermisos,
};
