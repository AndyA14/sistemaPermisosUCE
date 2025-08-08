// repositories/PermisoRepository.js
const { AppDataSource } = require('../config/database');
const Permiso = require('../entity/Permiso');

class PermisoRepository {
  constructor() {
    this.repository = AppDataSource.getRepository(Permiso);
  }

  /**
   * Listar todos los permisos (opcional filtro por usuario o estado)
   * @param {Object} filtros
   * @returns {Promise<Array<Permiso>>}
   */
  async listar(filtros = {}) {
    return await this.repository.find({
      where: filtros,
      relations: ['usuario', 'tipo', 'documentos', 'historialCambios'],
      order: { fecha_solicitud: 'DESC' },
    });
  }

  /**
   * Obtener permiso por ID con relaciones
   * @param {number} id 
   * @returns {Promise<Permiso|null>}
   */
  async obtenerPorId(id) {
    return await this.repository.findOne({
      where: { id },
      relations: ['usuario', 'tipo', 'documentos', 'historialCambios'],
    });
  }

  /**
   * Crear un nuevo permiso
   * @param {Object} data 
   * @returns {Promise<Permiso>}
   */
  async crear(data) {
    const permiso = this.repository.create(data);
    return await this.repository.save(permiso);
  }

  /**
   * Actualizar permiso
   * @param {number} id 
   * @param {Partial<Permiso>} cambios 
   * @returns {Promise<Permiso>}
   */
  async actualizar(id, cambios) {
    await this.repository.update(id, cambios);
    return await this.obtenerPorId(id);
  }

  /**
   * Cambiar estado general y carga a vacaciones de un permiso (usado para revisión de director)
   * @param {number} id 
   * @param {string} nuevoEstado 
   * @param {boolean} cargaVacaciones 
   * @param {string} respuestaDirector 
   * @returns {Promise<Permiso>}
   */
  async revisarPermiso(id, nuevoEstado, cargaVacaciones, respuestaDirector) {
    await this.repository.update(id, {
      estado_general: nuevoEstado,
      carga_vacaciones: cargaVacaciones,
      respuesta_director: respuestaDirector,
      fecha_revision_director: new Date(),
    });
    return await this.obtenerPorId(id);
  }

  /**
   * Desactivar permiso (soft delete)
   * @param {number} id 
   * @returns {Promise<void>}
   */
  async desactivar(id) {
    await this.repository.update(id, { activo: false });
  }


  /**
   * Revisar permiso por Talento Humano
   * @param {number} id 
   * @param {string} observacion 
   * @returns {Promise<Permiso>}
   */
  async revisarPorTTHH(id, observacion, username) {
      await this.repository.update(id, {
        observacion_tthh: observacion ? observacion.trim() : null,
        revisado_tthh: true,
        fecha_revision_tthh: new Date(),
        estado_general: 'en_revision',
        modificado_por: username,
        fecha_modificacion: new Date(),
      });
      return await this.obtenerPorId(id);
    }



}

module.exports = new PermisoRepository();
