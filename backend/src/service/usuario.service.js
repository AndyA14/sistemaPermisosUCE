const usuarioRepository = require('../repository/UsuarioRepository');
const bcrypt = require('bcrypt');
const { AppDataSource } = require('../config/database');
const Usuario = require('../entity/Usuario');

/**
 * Lista todos los usuarios activos
 * @returns {Promise<Array>}
 */
async function listarUsuarios() {
  return await usuarioRepository.listarTodosActivos();
}

/**
 * Obtiene un usuario por ID
 * @param {number} id
 * @returns {Promise<Object>}
 * @throws {Error} si no se encuentra el usuario
 */
async function obtenerUsuario(id) {
  const usuario = await usuarioRepository.obtenerPorId(id);
  if (!usuario) throw { statusCode: 404, message: 'Usuario no encontrado' };
  return usuario;
}

/**
 * Crea un nuevo usuario
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async function crearUsuario(data) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.contrasena, salt);
  data.contrasena = hashedPassword;
  return await usuarioRepository.crear(data);
}

/**
 * Actualiza un usuario existente
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
async function actualizarUsuario(id, data) {
  const usuario = await usuarioRepository.obtenerPorId(id);
  if (!usuario) throw { statusCode: 404, message: 'Usuario no encontrado' };
  return await usuarioRepository.actualizar(id, data);
}

/**
 * Activa o desactiva un usuario
 * @param {number} id
 * @param {boolean} estado
 */
async function cambiarEstadoUsuario(id, estado) {
  const usuario = await usuarioRepository.obtenerPorId(id);
  if (!usuario) throw { statusCode: 404, message: 'Usuario no encontrado' };
  await usuarioRepository.actualizar(id, { estado });
}

/**
 * Obtiene el perfil del usuario autenticado
 * @param {number} id
 * @returns {Promise<Object>}
 */
async function obtenerPerfil(id) {
  const usuario = await usuarioRepository.obtenerPorId(id);
  if (!usuario) throw { statusCode: 404, message: 'Perfil no encontrado' };
  return {
    id: usuario.id,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    rol: usuario.rol,
    username: usuario.username,
  };
}

/**
 * Cambia la contraseña de un usuario autenticado
 * @param {number} id
 * @param {string} contrasenaActual
 * @param {string} nuevaContrasena
 */
async function cambiarContrasena(id, contrasenaActual, nuevaContrasena) {
  const usuario = await usuarioRepository.obtenerPorId(id);
  if (!usuario) throw { statusCode: 404, message: 'Usuario no encontrado' };

  const esValida = await bcrypt.compare(contrasenaActual, usuario.contrasena);
  if (!esValida) throw { statusCode: 401, message: 'Contraseña actual incorrecta' };

  const salt = await bcrypt.genSalt(10);
  const nuevaHash = await bcrypt.hash(nuevaContrasena, salt);

  await usuarioRepository.actualizar(id, { contrasena: nuevaHash });
}


async function obtenerUsuarioDirector() {
  const usuarioRepo = AppDataSource.getRepository(Usuario);

  // Busca un usuario con rol 'director' y selecciona campos específicos
  const usuario = await usuarioRepo.findOne({
    where: { rol: 'director' },
    select: {
      id: true,
      nombres: true,
      apellidos: true,
      ci: true,
      correo: true,
      telefono: true,
      direccion: true,
      rol: true,
      // No incluir contraseña ni otros campos sensibles
    }
  });

  return usuario;
}





module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  obtenerPerfil,
  cambiarContrasena,
  obtenerUsuarioDirector,
};
