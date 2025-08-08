const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Usuario',
  tableName: 'usuarios',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    username: { type: 'varchar', length: 50, unique: true, nullable: false },
    contrasena: { type: 'text', nullable: false },
    ci: { type: 'varchar', length: 10, unique: true, nullable: false },
    nombres: { type: 'varchar', length: 100, nullable: false },
    apellidos: { type: 'varchar', length: 100, nullable: false },
    correo: { type: 'varchar', length: 100, nullable: false },
    telefono: { type: 'varchar', length: 20, nullable: true },
    direccion: { type: 'text', nullable: true },
    rol: { type: 'varchar', length: 20, nullable: false, comment: 'Ej: docente, tthh, director, admin' },
    estado: { type: 'boolean', default: true, nullable: false },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true },
  },
  relations: {
    permisos: {
      type: 'one-to-many',
      target: 'Permiso',
      inverseSide: 'usuario',
      cascade: true,
    },
    resetTokens: {
      type: 'one-to-many',
      target: 'PasswordResetToken',
      inverseSide: 'usuario',
      cascade: true,
    },
    historialCambios: {
      type: 'one-to-many',
      target: 'HistorialEstadoPermiso',
      inverseSide: 'usuario',
      cascade: true,
    },
  },
});
