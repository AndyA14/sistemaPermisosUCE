// repositories/TipoPermisoRepository.js
const { AppDataSource } = require('../config/database');
const TipoPermiso = require('../entity/TipoPermiso');

class TipoPermisoRepository {
  constructor() {
    this.repository = AppDataSource.getRepository(TipoPermiso);
  }

  /**
   * Listar todos los tipos de permiso
   * @returns {Promise<Array<TipoPermiso>>}
   */
  async listarTodos() {
    return await this.repository.find();
  }

  /**
   * Obtener tipo permiso por ID
   * @param {number} id 
   * @returns {Promise<TipoPermiso|null>}
   */
  async obtenerPorId(id) {
    return await this.repository.findOneBy({ id });
  }

  /**
   * Obtener tipo permiso por nombre y subtipo (si aplica)
   * @param {string} nombre 
   * @param {string|null} subTipo 
   * @returns {Promise<TipoPermiso|null>}
   */
  async obtenerPorNombreYSubtipo(nombre, subTipo = null) {
    return await this.repository.findOneBy({ nombre, sub_tipo: subTipo });
  }

  /**
   * Crear nuevo tipo de permiso
   * @param {Object} data 
   * @returns {Promise<TipoPermiso>}
   */
  async crear(data) {
    const tipo = this.repository.create(data);
    return await this.repository.save(tipo);
  }

  /**
   * Actualizar tipo de permiso
   * @param {number} id 
   * @param {Partial<TipoPermiso>} cambios 
   * @returns {Promise<TipoPermiso>}
   */
  async actualizar(id, cambios) {
    await this.repository.update(id, cambios);
    return await this.obtenerPorId(id);
  }

  /**
   * Eliminar tipo de permiso (físicamente)
   * @param {number} id 
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    await this.repository.delete(id);
  }
}

module.exports = new TipoPermisoRepository();
