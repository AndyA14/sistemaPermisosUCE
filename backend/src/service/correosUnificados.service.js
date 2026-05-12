// ============================================================
// CAPA DEFENSIVA ADICIONAL: correosUnificados.service.js
// ============================================================
// Esta versión del servicio agrega una última línea de defensa
// contra duplicados, independientemente del reader que uses.
// Es compatible con CUALQUIERA de las 3 soluciones anteriores.
// Úsala junto con la solución que elijas como seguro adicional.
// ============================================================

const { AppDataSource } = require('../config/database');
const Permiso = require('../entity/Permiso');
const { leerCorreosPorAlias } = require('./mail.reader'); // o mail.reader.gmail-api

async function procesarCorreosYPermisosPorRol(alias, revisadoTTHH = null) {
  const correos = await leerCorreosPorAlias(alias);
  if (!correos || correos.length === 0) return { alias, total: 0, resultados: [] };

  // ── CAPA DEFENSIVA 1: Deduplicar por permisoId ────────────
  const correosPorId = new Map();
  for (const correo of correos) {
    if (!correo.permisoId) continue;

    const existente = correosPorId.get(correo.permisoId);
    if (!existente) {
      correosPorId.set(correo.permisoId, correo);
    } else {
      // Nos quedamos con el más reciente
      const esNuevo = correo.date > existente.date;
      if (esNuevo) {
        console.warn(
          `⚠️  [${alias}] Permiso #${correo.permisoId} aparece en dos correos. ` +
          `Usando el más reciente (${correo.date.toISOString()}).`
        );
        correosPorId.set(correo.permisoId, correo);
      }
    }
  }

  const correosDedupados = [...correosPorId.values()];

  if (correosDedupados.length < correos.length) {
    console.warn(
      `🧹 [${alias}] Deduplicación: ${correos.length} → ${correosDedupados.length} correos ` +
      `(${correos.length - correosDedupados.length} duplicados eliminados).`
    );
  }

  // ── CAPA DEFENSIVA 2: Validación de IDs ──────────────────
  const permisoIds = correosDedupados
    .map(c => c.permisoId)
    .filter(id => Number.isInteger(id) && id > 0);

  if (permisoIds.length === 0) {
    console.log(`⚠️  [${alias}] No se encontraron IDs válidos en los correos.`);
    return { alias, total: 0, resultados: [] };
  }

  // ── CONSULTA A BD: igual que antes ───────────────────────
  const permisoRepo = AppDataSource.getRepository(Permiso);
  let query = permisoRepo.createQueryBuilder('permiso')
    .leftJoinAndSelect('permiso.usuario', 'usuario')
    .leftJoinAndSelect('permiso.tipo', 'tipo')
    .leftJoinAndSelect('permiso.documentos', 'documentos')
    .where('permiso.id IN (:...ids)', { ids: permisoIds })
    .andWhere('permiso.estado_general IN (:...estados)', {
      estados: ['pendiente', 'en_revision']
    });

  if (revisadoTTHH === true)  query = query.andWhere('permiso.revisado_tthh = true');
  if (revisadoTTHH === false) query = query.andWhere('permiso.revisado_tthh = false');

  const permisosPendientes = await query.getMany();

  // ── EMPAREJAMIENTO (igual que antes) ─────────────────────
  const resultados = correosDedupados
    .map(correo => {
      const permiso = permisosPendientes.find(p => Number(p.id) === Number(correo.permisoId));
      if (!permiso) return null;
      return { correo, permiso };
    })
    .filter(Boolean);

  return { alias, total: resultados.length, resultados };
}

// 👇 1. AGREGAMOS LAS FUNCIONES FALTANTES PARA EL CONTROLADOR 👇
async function obtenerCorreosUnificadosTTHH() {
  // TTHH lee del alias 'permisos' y busca los que NO han sido revisados (false)
  return await procesarCorreosYPermisosPorRol('permisos', false);
}

async function obtenerCorreosUnificadosDirector() {
  // Director lee del alias 'director' y busca los que SÍ han sido revisados (true)
  return await procesarCorreosYPermisosPorRol('director', true);
}

// 👇 2. ACTUALIZAMOS LA EXPORTACIÓN 👇
module.exports = { 
  procesarCorreosYPermisosPorRol,
  obtenerCorreosUnificadosTTHH,     // <--- Exportamos para que el controller la encuentre
  obtenerCorreosUnificadosDirector  // <--- Exportamos para que el controller la encuentre
};