// repositories/DocumentoPermisoRepository.js
const { AppDataSource } = require('../config/database');
const DocumentoPermiso = require('../entity/DocumentoPermiso');

class DocumentoPermisoRepository {
  constructor() {
    this.repository = AppDataSource.getRepository('DocumentoPermiso');
  }

  /**
   * Crea un nuevo documento asociado a un permiso
   * @param {Partial<DocumentoPermiso>} documentoData
   * @returns {Promise<DocumentoPermiso>}
   */
  async crear(documentoData) {
    const documento = this.repository.create(documentoData);
    return await this.repository.save(documento);
  }

  /**
   * Obtiene todos los documentos asociados a un permiso
   * @param {number} permisoId
   * @returns {Promise<DocumentoPermiso[]>}
   */
  async listarPorPermiso(permisoId) {
    return await this.repository.find({
      where: { permiso: { id: permisoId } },
    });
  }

  /**
   * Elimina un documento por su ID
   * @param {number} id
   * @returns {Promise<void>}
   */
  async eliminar(id) {
    await this.repository.delete(id);
  }
}

module.exports = new DocumentoPermisoRepository();
