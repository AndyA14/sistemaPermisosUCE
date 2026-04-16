const bcrypt = require('bcrypt');
const { AppDataSource } = require('../config/database');
const Usuario = require('../entity/Usuario');
const { generarUsernameInteligente, generarPassword } = require('../utils/credenciales');
const { enviarCredenciales } = require('../service/emailTemplates.service');

// Obtener repositorio
const getRepository = () => AppDataSource.getRepository(Usuario);

// Listar usuarios
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await getRepository().find();
    res.json(usuarios);
  } catch (error) {
    console.error('Error listarUsuarios:', error);
    res.status(500).json({ mensaje: 'Error al listar usuarios' });
  }
};

// Obtener por ID
const obtenerUsuario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const usuario = await getRepository().findOneBy({ id });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    console.error('Error obtenerUsuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener usuario' });
  }
};

// Crear usuario
const crearUsuario = async (req, res) => {
  try {
    const { ci, nombres, apellidos, correo, telefono, direccion, rol } = req.body;
    const repo = getRepository();

    const rolesUnicos = ['tthh', 'dtic', 'director'];
    if (rolesUnicos.includes(rol)) {
      const existe = await repo.findOneBy({ rol });
      if (existe) return res.status(400).json({ mensaje: `Ya existe un usuario con el rol "${rol}"` });
    }

    const username = await generarUsernameInteligente(nombres, apellidos, repo);
    const password = generarPassword();
    const hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = repo.create({
      username,
      contrasena: hash,
      ci,
      nombres,
      apellidos,
      correo,
      telefono,
      direccion,
      rol,
      estado: true
    });

    await repo.save(nuevoUsuario);

    try {
      await enviarCredenciales({
        to: correo,
        usuario: username,
        contrasena: password
      });
    } catch (error) {
      console.error("❌ Error enviando correo:", error);

      return res.status(500).json({
        mensaje: 'Usuario creado pero error al enviar correo'
      });
    }

    res.status(201).json({
      mensaje: 'Usuario creado con éxito y correo enviado'
    });

      } catch (error) {
        console.error('Error crearUsuario:', error);
        res.status(500).json({ mensaje: 'Error al crear usuario' });
      }
};

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const repo = getRepository();
    const usuario = await repo.findOneBy({ id });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const {
      username, contrasena, ci, nombres, apellidos,
      correo, telefono, direccion, rol, estado
    } = req.body;

    if (contrasena) usuario.contrasena = await bcrypt.hash(contrasena, 10);

    Object.assign(usuario, {
      username: username ?? usuario.username,
      ci: ci ?? usuario.ci,
      nombres: nombres ?? usuario.nombres,
      apellidos: apellidos ?? usuario.apellidos,
      correo: correo ?? usuario.correo,
      telefono: telefono ?? usuario.telefono,
      direccion: direccion ?? usuario.direccion,
      rol: rol ?? usuario.rol,
      estado: estado ?? usuario.estado
    });

    await repo.save(usuario);
    res.json({ mensaje: 'Usuario actualizado' });
  } catch (error) {
    console.error('Error actualizarUsuario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
};

// Desactivar usuario
const desactivarUsuario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const repo = getRepository();
    const usuario = await repo.findOneBy({ id });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    usuario.estado = false;
    await repo.save(usuario);

    res.json({ mensaje: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error('Error desactivarUsuario:', error);
    res.status(500).json({ mensaje: 'Error al desactivar usuario' });
  }
};

// Activar usuario
const activarUsuario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const repo = getRepository();
    const usuario = await repo.findOneBy({ id });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    usuario.estado = true;
    await repo.save(usuario);

    res.json({ mensaje: 'Usuario activado correctamente' });
  } catch (error) {
    console.error('Error activarUsuario:', error);
    res.status(500).json({ mensaje: 'Error al activar usuario' });
  }
};

// Obtener perfil autenticado
const obtenerPerfil = async (req, res) => {
  try {
    const idUsuario = req.usuario.id;
    const usuario = await getRepository().findOneBy({ id: idUsuario });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const { contrasena, ...datos } = usuario;
    res.json(datos);
  } catch (error) {
    console.error('Error obtenerPerfil:', error);
    res.status(500).json({ mensaje: 'Error al obtener perfil' });
  }
};

// Cambiar contraseña
const cambiarContrasena = async (req, res) => {
  try {
    const idUsuario = req.usuario.id;
    const { contraseñaActual, nuevaContraseña } = req.body;

    if (!contraseñaActual || !nuevaContraseña) {
      return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
    }

    const repo = getRepository();
    const usuario = await repo.findOne({
      where: { id: idUsuario },
      select: ['id', 'contrasena']
    });

    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const esValida = await bcrypt.compare(contraseñaActual, usuario.contrasena);
    if (!esValida) return res.status(401).json({ mensaje: 'Contraseña actual incorrecta' });

    const hash = await bcrypt.hash(nuevaContraseña, 10);
    usuario.contrasena = hash;

    await repo.save(usuario);
    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error cambiarContrasena:', error);
    res.status(500).json({ mensaje: 'Error al cambiar contraseña' });
  }
};

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  activarUsuario,
  obtenerPerfil,
  cambiarContrasena
};
