// src/config/setup.js

const bcrypt = require('bcrypt');
const { AppDataSource } = require('./database');
const Usuario = require('../entity/Usuario');

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

module.exports = { crearUsuarioInicial };
