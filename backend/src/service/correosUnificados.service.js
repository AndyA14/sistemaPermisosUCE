const { AppDataSource } = require('../config/database');
const Permiso = require('../entity/Permiso');
const parseCorreoHTML = require('../utils/parseCorreoHTML');
const { leerCorreosPorAlias } = require('../service/mail.reader');

async function procesarCorreosYPermisosPorRol(alias, revisadoTTHH = null) {
  // Leer correos desde el servicio IMAP
  const correos = await leerCorreosPorAlias(alias);

  if (!Array.isArray(correos) || correos.length === 0) {
    return { alias, total: 0, resultados: [] };
  }

  // Extraer cédulas válidas de los correos
  const cedulas = correos
    .map(c => parseCorreoHTML(c.html)?.cedula)
    .filter(Boolean);

  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const anio = hoy.getFullYear();

  const permisoRepo = AppDataSource.getRepository(Permiso);

  // Consultar permisos pendientes filtrados por mes y año en fecha_solicitud
  let queryPendientes = permisoRepo.createQueryBuilder('permiso')
    .leftJoinAndSelect('permiso.usuario', 'usuario')
    .leftJoinAndSelect('permiso.tipo', 'tipo')
    .where('EXTRACT(MONTH FROM permiso.fecha_solicitud) = :mes', { mes })
    .andWhere('EXTRACT(YEAR FROM permiso.fecha_solicitud) = :anio', { anio })
    .andWhere('permiso.estado_general IN (:...estados)', { estados: ['pendiente', 'en_revision'] })
    .andWhere('usuario.ci IN (:...cedulas)', { cedulas });

  if (revisadoTTHH === true) {
    queryPendientes = queryPendientes.andWhere('permiso.revisado_tthh = true');
  } else if (revisadoTTHH === false) {
    queryPendientes = queryPendientes.andWhere('permiso.revisado_tthh = false');
  }

  const permisosPendientes = await queryPendientes.getMany();

  // Consultar permisos finalizados filtrados por mes y año en fecha_solicitud
  const permisosFinalizados = await permisoRepo.createQueryBuilder('permiso')
    .leftJoinAndSelect('permiso.usuario', 'usuario')
    .leftJoinAndSelect('permiso.tipo', 'tipo')
    .where('EXTRACT(MONTH FROM permiso.fecha_solicitud) = :mes', { mes })
    .andWhere('EXTRACT(YEAR FROM permiso.fecha_solicitud) = :anio', { anio })
    .andWhere('permiso.estado_general IN (:...estados)', { estados: ['autorizado', 'denegado'] })
    .andWhere('usuario.ci IN (:...cedulas)', { cedulas })
    .getMany();

  // Ordenar para mantener consistencia
  correos.sort((a, b) => a.id - b.id);
  permisosPendientes.sort((a, b) => a.id - b.id);
  permisosFinalizados.sort((a, b) => a.id - b.id);

  // Sets para control de emparejamiento
  const permisosEmparejados = new Set();
  const permisosFinalizadosEmparejados = new Set();
  const correosEmparejados = new Set();
  const resultados = [];

  // Procesar emparejamiento correo - permiso
  for (const correo of correos) {
    const datos = parseCorreoHTML(correo.html, { date: correo.date });

    if (!datos?.cedula || !datos?.fecha) {
      continue;
    }

    if (correosEmparejados.has(correo.id)) continue;

    const fechaCorreo = datos.fecha;

    // Validar permisos finalizados
    const permisoFinalizado = permisosFinalizados.find(p => {
      if (permisosFinalizadosEmparejados.has(p.id)) return false;

      if (!p.fecha_solicitud) return false;
      const fechaSol = new Date(p.fecha_solicitud);
      if (isNaN(fechaSol)) return false;

      const fechaSolicitudStr = fechaSol.toISOString().slice(0, 10);
      return p.usuario.ci === datos.cedula && fechaSolicitudStr === fechaCorreo;
    });

    if (permisoFinalizado) {
      permisosFinalizadosEmparejados.add(permisoFinalizado.id);
      correosEmparejados.add(correo.id);
      continue;
    }

    // Intentar emparejar con permiso pendiente
    const permisoPendiente = permisosPendientes.find(p => {
      if (permisosEmparejados.has(p.id)) return false;

      if (!p.fecha_solicitud) return false;
      const fechaSol = new Date(p.fecha_solicitud);
      if (isNaN(fechaSol)) return false;

      const fechaSolicitudStr = fechaSol.toISOString().slice(0, 10);
      return p.usuario.ci === datos.cedula && fechaSolicitudStr === fechaCorreo;
    });

    if (permisoPendiente) {
      resultados.push({ correo, permiso: permisoPendiente });
      permisosEmparejados.add(permisoPendiente.id);
      correosEmparejados.add(correo.id);
    }
  }

  return { alias, total: resultados.length, resultados };
}

module.exports = { procesarCorreosYPermisosPorRol };
