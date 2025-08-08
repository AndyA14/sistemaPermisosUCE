const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'HistorialEstadoPermiso',
  tableName: 'historial_estado_permisos',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    estado_anterior: { type: 'varchar', length: 20, nullable: false },
    estado_nuevo: { type: 'varchar', length: 20, nullable: false },
    comentario: { type: 'text', nullable: true },
    fecha_cambio: { type: 'timestamp', default: () => 'now()', nullable: false },
  },
  relations: {
    permiso: {
      type: 'many-to-one',
      target: 'Permiso',
      joinColumn: { name: 'permiso_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
    usuario: {
      type: 'many-to-one',
      target: 'Usuario',
      joinColumn: { name: 'usuario_id' },
      nullable: false,
    },
  },
});
