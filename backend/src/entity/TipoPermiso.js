const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'TipoPermiso',
  tableName: 'tipos_permiso',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    nombre: { type: 'varchar', length: 50, nullable: false, comment: 'Nombre del tipo de permiso' },
    sub_tipo: { type: 'varchar', length: 100, nullable: true, comment: 'Subtipo opcional' },
  },
  indices: [
    { columns: ['nombre', 'sub_tipo'], unique: true },
  ],
  relations: {
    permisos: {
      type: 'one-to-many',
      target: 'Permiso',
      inverseSide: 'tipo',
    },
  },
});
