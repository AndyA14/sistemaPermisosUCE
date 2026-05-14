// backend/src/entity/Certificado.js
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Certificado',
  tableName: 'certificados',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    pin_verificacion: {
      type: 'varchar',
      length: 15,
      unique: true,
    },
    // --- DATOS DEL ESTUDIANTE DIRECTAMENTE ---
    estudiante_nombres: {
      type: 'varchar',
      length: 100,
    },
    estudiante_apellidos: {
      type: 'varchar',
      length: 100,
    },
    estudiante_ci: {
      type: 'varchar',
      length: 15,
    },
    nivel_ingles: {
      type: 'varchar',
      length: 50,
    },
    fecha_aprobacion: {
      type: 'date',
    },
    estado: {
      type: 'enum',
      enum: ['PENDIENTE_DOCENTE', 'PENDIENTE_DIRECTOR', 'EMITIDO', 'ANULADO'],
      default: 'PENDIENTE_DOCENTE',
    },
    firmado_docente: {
      type: 'boolean',
      default: false,
    },
    firmado_director: {
      type: 'boolean',
      default: false,
    },
    ruta_pdf: {
      type: 'varchar',
      nullable: true,
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true,
    },
  },
  relations: {
    // Relación con el docente que debe firmar
    docente: {
      type: 'many-to-one',
      target: 'Usuario',
      joinColumn: { name: 'docente_id' },
      onDelete: 'SET NULL',
      nullable: true,
    },
    // Relación con el director que debe firmar
    director: {
      type: 'many-to-one',
      target: 'Usuario',
      joinColumn: { name: 'director_id' },
      onDelete: 'SET NULL',
      nullable: true,
    },
    // Relación con el admin que lo registró
    admin_creador: {
      type: 'many-to-one',
      target: 'Usuario',
      joinColumn: { name: 'creado_por' },
      onDelete: 'SET NULL',
      nullable: true,
    },
  },
});