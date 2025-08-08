const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Permiso',
  tableName: 'permisos',
  indices: [
    {
      name: 'IDX_permiso_usuario_fechas',
      columns: ['usuario', 'fecha_inicio', 'fecha_fin'],
    },
    {
      name: 'IDX_permiso_estado_revision',
      columns: ['estado_general', 'revisado_tthh'],
    },
    {
      name: 'IDX_permiso_fecha_inicio',
      columns: ['fecha_inicio'],
    },
    {
      name: 'IDX_permiso_ci_estado_fecha',
      columns: ['estado_general', 'fecha_inicio', 'fecha_fin'],
    }
  ],
  columns: {
    id: { type: 'int', primary: true, generated: true },

    fecha_solicitud: { type: 'date', default: () => 'CURRENT_DATE', nullable: false },
    fecha_inicio: { type: 'date', nullable: false },
    fecha_fin: { type: 'date', nullable: true },
    hora_inicio: { type: 'time', nullable: true },
    hora_fin: { type: 'time', nullable: true },
    descripcion: { type: 'text', nullable: true },

    observacion_tthh: { type: 'text', nullable: true },
    revisado_tthh: { type: 'boolean', default: false, nullable: false, comment: 'Talento Humano ya revisó' },
    fecha_revision_tthh: { type: 'timestamp', nullable: true },

    respuesta_director: { type: 'text', nullable: true, comment: 'Respuesta obligatoria del director' },
    estado_director: { type: 'boolean', default: false, nullable: false, comment: 'Director ya revisó' },
    fecha_revision_director: { type: 'timestamp', nullable: true },

    estado_general: { type: 'varchar', length: 20, nullable: false, default: 'pendiente' },

    carga_vacaciones: { type: 'boolean', default: false, nullable: false, comment: 'Decisión del director si afecta vacaciones' },

    activo: { type: 'boolean', default: true, nullable: false },
    modificado_por: { type: 'varchar', length: 100, nullable: true },
    fecha_modificacion: { type: 'timestamp', nullable: true },
  },
  relations: {
    usuario: {
      type: 'many-to-one',
      target: 'Usuario',
      joinColumn: { name: 'usuario_id' },
      nullable: false,
      onDelete: 'CASCADE',
    },
    tipo: {
      type: 'many-to-one',
      target: 'TipoPermiso',
      joinColumn: { name: 'tipo_id' },
      nullable: false,
      onDelete: 'RESTRICT',
    },
    documentos: {
      type: 'one-to-many',
      target: 'DocumentoPermiso',
      inverseSide: 'permiso',
      cascade: true,
    },
    historialCambios: {
      type: 'one-to-many',
      target: 'HistorialEstadoPermiso',
      inverseSide: 'permiso',
      cascade: true,
    },
  },
});
