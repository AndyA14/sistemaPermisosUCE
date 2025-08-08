// src/config/data-source.js

const { DataSource } = require('typeorm');
const Usuario = require('../entity/Usuario');
const Permiso = require('../entity/Permiso');
const TipoPermiso = require('../entity/TipoPermiso');
const DocumentoPermiso = require('../entity/DocumentoPermiso');
const PasswordResetToken = require('../entity/PasswordResetToken');
const HistorialEstadoPermiso = require('../entity/HistorialEstadoPermiso');

// Configuración de conexión a base de datos PostgreSQL
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10), // Valor por defecto: 5432
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // Solo para desarrollo (desactiva en producción)
  logging: false,
  entities: [
    Usuario,
    Permiso,
    TipoPermiso,
    DocumentoPermiso,
    PasswordResetToken,
    HistorialEstadoPermiso, 
  ],
  migrations: [],
  subscribers: [],
});

module.exports = { AppDataSource };
