const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'DocumentoPermiso',
  tableName: 'documentos_permiso',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    url: { type: 'text', nullable: false },
    tipo: { type: 'varchar', length: 50, nullable: true },
  },
  relations: {
    permiso: {
      type: 'many-to-one',
      target: 'Permiso',
      joinColumn: { name: 'permiso_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
});
