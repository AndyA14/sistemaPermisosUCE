const { AppDataSource } = require('../config/database');
const { MoreThan, LessThan } = require('typeorm');
const PasswordResetToken = require('../entity/PasswordResetToken');

class PasswordResetTokenRepository {
  constructor() {
    this.repository = AppDataSource.getRepository(PasswordResetToken);
  }

  async crear(tokenData) {
    const token = this.repository.create(tokenData);
    return await this.repository.save(token);
  }

  async buscarTokenValido(tokenString) {
    const ahora = new Date();
    return await this.repository.findOne({
      where: {
        token: tokenString,
        used: false,
        expiresAt: MoreThan(ahora),
      },
      relations: ['usuario'],
    });
  }

  async actualizar(id, cambios) {
    await this.repository.update(id, cambios);
  }

  async eliminarExpirados() {
    const ahora = new Date();
    await this.repository.delete({
      expiresAt: LessThan(ahora),
    });
  }
}

module.exports = new PasswordResetTokenRepository();
