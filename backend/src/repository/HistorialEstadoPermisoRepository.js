// repositories/HistorialEstadoPermisoRepository.js
const { AppDataSource } = require('../config/database');
const HistorialEstadoPermiso = require('../entity/HistorialEstadoPermiso');

class HistorialEstadoPermisoRepository {
  constructor() {
    this.repository = AppDataSource.getRepository('HistorialEstadoPermiso');
  }

  /**
   * Crea un nuevo registro en el historial de estado de permisos
   * @param {Partial<HistorialEstadoPermiso>} historialData
   * @returns {Promise<HistorialEstadoPermiso>}
   */
  async crear(historialData) {
    const historial = this.repository.create(historialData);
    return await this.repository.save(historial);
  }

  /**
   * Obtiene el historial completo de cambios para un permiso específico
   * @param {number} permisoId
   * @returns {Promise<HistorialEstadoPermiso[]>}
   */
  async listarPorPermiso(permisoId) {
    return await this.repository.find({
      where: { permiso: { id: permisoId } },
      relations: ['usuario'],
      order: { fecha_cambio: 'DESC' },
    });
  }

  /**
   * Elimina todos los registros del historial para un permiso (uso raro)
   * @param {number} permisoId
   * @returns {Promise<void>}
   */
  async eliminarPorPermiso(permisoId) {
    await this.repository.delete({ permiso: { id: permisoId } });
  }
}

module.exports = new HistorialEstadoPermisoRepository();
