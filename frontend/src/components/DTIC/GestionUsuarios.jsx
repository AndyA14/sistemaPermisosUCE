import React, { useEffect, useState, useRef } from 'react';
import {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  activarUsuario,
  desactivarUsuario,
} from '../../services/api';
import LoadingModal from '../../components/LoadingModal';
import { toast, ToastContainer } from 'react-toastify';

import '../../styles/GestionUsuarios.css';

function generarUsername(nombres, apellidos, usuariosExistentes) {
  if (!nombres || !apellidos) return '';

  const nombresArr = nombres.trim().split(/\s+/);
  const apellidosArr = apellidos.trim().split(/\s+/);

  const inicial1 = nombresArr[0]?.[0]?.toLowerCase() || '';
  const inicial2 = nombresArr[1]?.[0]?.toLowerCase() || '';
  const primerApellido = apellidosArr[0]?.toLowerCase() || '';
  const segundaInicialApellido = apellidosArr.length > 1 ? apellidosArr[1][0].toLowerCase() : '';

  let usernameBase = inicial1 + inicial2 + primerApellido;
  const existeBase = usuariosExistentes.some(u => u.username === usernameBase);

  if (!existeBase) return usernameBase;

  if (segundaInicialApellido) {
    let usernameConSegunda = usernameBase + segundaInicialApellido;
    const existeConSegunda = usuariosExistentes.some(u => u.username === usernameConSegunda);
    if (!existeConSegunda) return usernameConSegunda;
  }

  return usernameBase;
}

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [busquedaCI, setBusquedaCI] = useState('');
  const [form, setForm] = useState({
    username: '',
    ci: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    direccion: '',
    rol: 'docente',
  });
  const [modoEditar, setModoEditar] = useState(false);
  const [usuarioEditarId, setUsuarioEditarId] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Solo mostrar toast de carga inicial
  const toastMostrado = useRef(false); // Referencia para controlar una sola ejecución del toast

  useEffect(() => {
    const fetchInicial = async () => {
      await cargarUsuarios();
      if (!toastMostrado.current) {
        toast.success('Usuarios cargados correctamente');
        toastMostrado.current = true;
      }
    };
    fetchInicial();
  }, []);


  useEffect(() => {
    if (!modoEditar) {
      const nuevoUsername = generarUsername(form.nombres, form.apellidos, usuarios);
      setForm(prev => ({ ...prev, username: nuevoUsername }));
    }
  }, [form.nombres, form.apellidos, usuarios, modoEditar]);

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      if (modoEditar) {
        await actualizarUsuario(usuarioEditarId, { ...form });
        toast.success('✅ Usuario actualizado correctamente');
      } else {
        await crearUsuario(form);
        toast.success('✅ Usuario creado correctamente');
      }
      resetForm();
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      toast.error('❌ Error al guardar usuario');
    } finally {
      setCargando(false);
    }
  };

  const handleEditar = (usuario) => {
    setModoEditar(true);
    setUsuarioEditarId(usuario.id);
    setForm({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      username: usuario.username,
      ci: usuario.ci,
      correo: usuario.correo,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      rol: usuario.rol,
    });
  };

  const handleToggleActivo = async (id, estadoActual) => {
    setCargando(true);
    try {
      if (estadoActual) {
        await desactivarUsuario(id);
        toast.info('⚠️ Usuario desactivado');
      } else {
        await activarUsuario(id);
        toast.success('✅ Usuario activado');
      }
      await cargarUsuarios();
    } catch (error) {
      console.error(error);
      toast.error('❌ Error al cambiar estado del usuario');
    } finally {
      setCargando(false);
    }
  };

  const resetForm = () => {
    setModoEditar(false);
    setUsuarioEditarId(null);
    setForm({
      username: '',
      ci: '',
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      direccion: '',
      rol: 'docente',
    });
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    (u.nombres.toLowerCase().includes(busquedaNombre.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(busquedaNombre.toLowerCase())) &&
    u.ci.toLowerCase().includes(busquedaCI.toLowerCase())
  );

  const ROLES_LABELS = {
    docente: 'Docente',
    admin: 'Administrador',
    director: 'Director',
    tthh: 'TTHH',
    dti: 'DTIC',
  };

  return (
    <div className="gestion-container">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <LoadingModal visible={cargando} />

      {/* 🎯 Header mejorado con estadísticas */}
      <div className="gestion-header">
        <div className="header-content">
          <h1>👥 Gestión de Usuarios</h1>
          <p className="subtitle">Administra usuarios del sistema de permisos</p>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-number">{usuarios.length}</div>
              <div className="stat-label">Total Usuarios</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{usuarios.filter(u => u.estado).length}</div>
              <div className="stat-label">Activos</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{usuarios.filter(u => !u.estado).length}</div>
              <div className="stat-label">Inactivos</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 Filtros mejorados con iconos */}
      <div className="gestion-filtros">
        <div className="filtro-item">
          <span className="filtro-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre completo..."
            value={busquedaNombre}
            onChange={(e) => setBusquedaNombre(e.target.value)}
          />
        </div>
        <div className="filtro-item">
          <span className="filtro-icon">🆔</span>
          <input
            type="text"
            placeholder="Buscar por CI..."
            value={busquedaCI}
            onChange={(e) => setBusquedaCI(e.target.value)}
          />
        </div>
        <div className="filtros-summary">
          {busquedaNombre || busquedaCI ? (
            <span className="results-count">
              📊 Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
            </span>
          ) : null}
        </div>
      </div>

      {/* ✨ Formulario mejorado con secciones */}
      <div className="form-section">
        <div className="form-header">
          <h3>{modoEditar ? '✏️ Editar Usuario' : '➕ Crear Nuevo Usuario'}</h3>
          <p>Complete los datos del usuario</p>
        </div>
        
        <form onSubmit={handleGuardar} className="gestion-form">
          <div className="form-group">
            <label>👤 Información Personal</label>
            <div className="form-row">
              <div className="input-group">
                <span className="input-icon">📝</span>
                <input 
                  name="nombres" 
                  placeholder="Nombres completos" 
                  required 
                  value={form.nombres} 
                  onChange={handleChange} 
                />
              </div>
              <div className="input-group">
                <span className="input-icon">📝</span>
                <input 
                  name="apellidos" 
                  placeholder="Apellidos completos" 
                  required 
                  value={form.apellidos} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>🔐 Datos de Acceso</label>
            <div className="form-row">
              <div className="input-group">
                <span className="input-icon">👤</span>
                <input
                  name="username"
                  placeholder="Username (generado automáticamente)"
                  required
                  value={form.username}
                  readOnly
                  className="readonly-input"
                  title="El username se genera automáticamente basado en nombres y apellidos"
                />
              </div>
              <div className="input-group">
                <span className="input-icon">🆔</span>
                <input 
                  name="ci" 
                  placeholder="Cédula de Identidad" 
                  required 
                  value={form.ci} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>📞 Información de Contacto</label>
            <div className="form-row">
              <div className="input-group">
                <span className="input-icon">📧</span>
                <input 
                  type="email" 
                  name="correo" 
                  placeholder="correo@ejemplo.com" 
                  required 
                  value={form.correo} 
                  onChange={handleChange} 
                />
              </div>
              <div className="input-group">
                <span className="input-icon">📱</span>
                <input 
                  name="telefono" 
                  placeholder="Número de teléfono" 
                  required 
                  value={form.telefono} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>🏠 Información Adicional</label>
            <div className="form-row">
              <div className="input-group full-width">
                <span className="input-icon">📍</span>
                <input 
                  name="direccion" 
                  placeholder="Dirección completa" 
                  required 
                  value={form.direccion} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>👔 Rol del Sistema</label>
            <div className="form-row">
              <div className="input-group">
                <span className="input-icon">⚡</span>
                <select name="rol" value={form.rol} onChange={handleChange} className="select-input">
                  <option value="docente">👨‍🏫 Docente</option>
                  <option value="admin">👑 Administrador</option>
                  <option value="director">🎯 Director</option>
                  <option value="tthh">👥 Talento Humano</option>
                  <option value="dti">💻 DTIC</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {modoEditar ? '💾 Actualizar Usuario' : '➕ Crear Usuario'}
            </button>
            {modoEditar && (
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                ❌ Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 📊 Tabla de usuarios mejorada */}
      <div className="table-section">
        <div className="table-header">
          <h3>📋 Lista de Usuarios</h3>
          <p>Gestiona todos los usuarios registrados en el sistema</p>
        </div>
        
        <div className="table-container">
          <table className="gestion-table">
            <thead>
              <tr>
                <th>🆔 ID</th>
                <th>👤 Usuario</th>
                <th>📞 Contacto</th>
                <th>🔐 Acceso</th>
                <th>👔 Rol</th>
                <th>⚡ Estado</th>
                <th>⚙️ Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((u) => (
                  <tr key={u.id} className={`table-row ${!u.estado ? 'inactive-row' : ''}`}>
                    <td>
                      <span className="id-badge">#{u.id}</span>
                    </td>
                    <td>
                      <div className="user-info">
                        <div className="user-name">{`${u.nombres} ${u.apellidos}`}</div>
                        <div className="user-ci">CI: {u.ci}</div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="contact-email">📧 {u.correo}</div>
                        <div className="contact-phone">📱 {u.telefono}</div>
                      </div>
                    </td>
                    <td>
                      <div className="access-info">
                        <code className="username">@{u.username}</code>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${u.rol}`}>
                        {ROLES_LABELS[u.rol] || u.rol}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.estado ? 'active' : 'inactive'}`}>
                        {u.estado ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-group">
                        <button 
                          onClick={() => handleEditar(u)} 
                          className="btn btn-edit"
                          title="Editar usuario"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleToggleActivo(u.id, u.estado)}
                          className={`btn ${u.estado ? 'btn-deactivate' : 'btn-activate'}`}
                          title={u.estado ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          {u.estado ? '🔴 Desactivar' : '🟢 Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="no-data-content">
                      <span className="no-data-icon">🔍</span>
                      <p>No se encontraron usuarios con los criterios de búsqueda</p>
                      <small>Intenta modificar los filtros de búsqueda</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GestionUsuarios;
