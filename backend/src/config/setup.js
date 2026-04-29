// src/config/setup.js

const bcrypt = require('bcrypt');
const { AppDataSource } = require('./database');
const Usuario = require('../entity/Usuario');
const TipoPermiso = require('../entity/TipoPermiso'); 

/**
 * Crea un usuario con rol "admin" (usuario: admin, clave: admin123) si no existe.
 */
async function crearUsuarioInicial() {
  try {
    const usuarioRepo = AppDataSource.getRepository(Usuario);

    // 🔍 Verificar existencia del usuario admin
    const existente = await usuarioRepo.findOne({ where: { username: 'admin' } });

    if (existente) {
      console.log('✅ El usuario "admin" ya existe. No se crea uno nuevo.');
      return;
    }

    // 🔒 Hashear contraseña fija
    const hash = await bcrypt.hash('admin123', 10);

    // 👤 Crear nuevo usuario admin
    const nuevoUsuario = usuarioRepo.create({
      username: 'admin',
      contrasena: hash,
      ci: '9999999999',
      nombres: 'Administrador',
      apellidos: 'Principal',
      correo: 'admin@iai.com',
      telefono: '',
      direccion: '',
      rol: 'admin',
      estado: true,
    });

    await usuarioRepo.save(nuevoUsuario);

    console.log('🎉 Usuario "admin" creado correctamente:');
    console.log(`👤 Usuario: admin`);
    console.log(`🔑 Contraseña: admin123`);
  } catch (err) {
    console.error('❌ Error al crear usuario "admin":', err);
  }
}

/**
 * Inserta los tipos de permisos por defecto si la tabla está vacía.
 */
async function crearTiposPermisoIniciales() {
  try {
    const tipoRepo = AppDataSource.getRepository(TipoPermiso);

    // 🔍 Verificamos si ya hay datos en la tabla
    const cantidad = await tipoRepo.count();

    if (cantidad > 0) {
      console.log('✅ Los tipos de permiso ya existen en la base de datos.');
      return; // Si ya hay registros, detenemos la ejecución
    }

    // 📝 Lista de permisos por defecto
    const tiposPorDefecto = [
      { nombre: 'Falta', sub_tipo: 'Cita Médica (Requiere evidencia médica)' },
      { nombre: 'Falta', sub_tipo: 'Reposo Médico (Requiere certificado médico)' },
      { nombre: 'Falta', sub_tipo: 'Personal (Sin evidencia requerida)' },
      { nombre: 'Atraso', sub_tipo: 'Cita Médica (Requiere evidencia)' },
      { nombre: 'Atraso', sub_tipo: 'Problemas de Tránsito (Sin evidencia)' },
      { nombre: 'Atraso', sub_tipo: 'Motivos Personales (Sin evidencia)' },
      { nombre: 'Sin Timbrar', sub_tipo: 'Falta de Entrada (Con hora de registro)' },
      { nombre: 'Sin Timbrar', sub_tipo: 'Falta de Salida (Con hora de registro)' },
      { nombre: 'Sin Timbrar', sub_tipo: 'Ambas (Con horas de entrada y salida)' },
      { nombre: 'Otros', sub_tipo: 'Permisos Especiales (Personalizados)' },
      { nombre: 'Otros', sub_tipo: 'Actividades Institucionales (Con justificación)' }
    ];

    // 📥 Guardamos todos los registros de golpe
    await tipoRepo.save(tiposPorDefecto);
    
    console.log('🎉 Tipos de permiso por defecto creados correctamente.');
  } catch (err) {
    console.error('❌ Error al crear los tipos de permiso:', err);
  }
}

module.exports = { 
  crearUsuarioInicial, 
  crearTiposPermisoIniciales 
};