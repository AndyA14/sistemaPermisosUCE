const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'PasswordResetToken',
  tableName: 'password_reset_tokens',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    token: { type: 'varchar', unique: true, nullable: false },
    expiresAt: { type: 'timestamp', nullable: false },
    used: { type: 'boolean', default: false, nullable: false },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    usuario: {
      type: 'many-to-one',
      target: 'Usuario',
      joinColumn: { name: 'usuario_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});
