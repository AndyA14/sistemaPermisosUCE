// src/service/correosUnificados.service.js
const { AppDataSource } = require('../config/database');
const Permiso = require('../entity/Permiso');
const { leerCorreosPorAlias } = require('../service/mail.reader');

/**
 * Procesa correos y los cruza con permisos usando X-Headers (permisoId).
 * Optimización: elimina parseo HTML y matching por cédula/fecha.
 */
async function procesarCorreosYPermisosPorRol(alias, revisadoTTHH = null) {
  // Leer correos (ya vienen con permisoId desde headers)
  const correos = await leerCorreosPorAlias(alias);

  if (!Array.isArray(correos) || correos.length === 0) {
    return { alias, total: 0, resultados: [] };
  }

  // ── EXTRAER IDs DIRECTAMENTE ────────────────────────────────
  const permisoIds = correos
    .map(c => c.permisoId)
    .filter(Boolean);

  // Protección para correos históricos sin headers
  if (permisoIds.length === 0) {
    console.warn(`⚠️ [${alias}] Correos sin X-Permiso-ID. Posibles correos históricos.`);
    return { alias, total: 0, resultados: [] };
  }

  const permisoRepo = AppDataSource.getRepository(Permiso);

  // ── QUERY OPTIMIZADA (UNA SOLA CONSULTA) ─────────────────────
  let query = permisoRepo.createQueryBuilder('permiso')
    .leftJoinAndSelect('permiso.usuario', 'usuario')
    .leftJoinAndSelect('permiso.tipo', 'tipo')
    .leftJoinAndSelect('permiso.documentos', 'documentos')
    .where('permiso.id IN (:...ids)', { ids: permisoIds })
    .andWhere('permiso.estado_general IN (:...estados)', {
      estados: ['pendiente', 'en_revision'],
    });

  // Filtro por rol TTHH si aplica
  if (revisadoTTHH === true) {
    query = query.andWhere('permiso.revisado_tthh = true');
  } else if (revisadoTTHH === false) {
    query = query.andWhere('permiso.revisado_tthh = false');
  }

  const permisosPendientes = await query.getMany();

  // ── MAPEO DIRECTO (O(n), sin lógica compleja) ────────────────
  const resultados = correos
    .map(correo => {
      const permiso = permisosPendientes.find(p => p.id === correo.permisoId);

      // Si no existe → ya fue autorizado/denegado o no aplica
      if (!permiso) return null;

      return { correo, permiso };
    })
    .filter(Boolean);

  return {
    alias,
    total: resultados.length,
    resultados
  };
}

module.exports = { procesarCorreosYPermisosPorRol };