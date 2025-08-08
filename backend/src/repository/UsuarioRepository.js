const { AppDataSource } = require('../config/database');
const { Not } = require('typeorm');
const Usuario = require('../entity/Usuario');

class UsuarioRepository {
  constructor() {
    this.repository = AppDataSource.getRepository(Usuario);
  }

  async listarTodosActivos() {
    return await this.repository.find({ where: { estado: true } });
  }

  async obtenerPorId(id) {
    return await this.repository.findOneBy({ id });
  }

  async obtenerPorUsername(username) {
    return await this.repository.findOneBy({ username });
  }

  async obtenerPorCorreo(correo) {
    return await this.repository.findOneBy({ correo });
  }

  async crear(usuarioData) {
    const nuevoUsuario = this.repository.create(usuarioData);
    return await this.repository.save(nuevoUsuario);
  }

  async actualizar(id, cambios) {
    await this.repository.update(id, cambios);
    return await this.obtenerPorId(id);
  }

  async desactivar(id) {
    await this.repository.update(id, { estado: false });
  }

  async activar(id) {
    await this.repository.update(id, { estado: true });
  }

  async eliminarFisicamente(id) {
    await this.repository.delete(id);
  }
}

module.exports = new UsuarioRepository();
