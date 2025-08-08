import React, { useEffect, useState, useRef } from 'react';
import {
  obtenerTiposPermiso,
  crearTipoPermiso,
  actualizarTipoPermiso,
  eliminarTipoPermiso,
} from '../../services/api';
import LoadingModal from '../../components/LoadingModal';
import { toast, ToastContainer } from 'react-toastify';
import '../../styles/TipoPermisoGestion.css';

function TipoPermisoGestion() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, nombre: '', sub_tipo: '' });
  const [showForm, setShowForm] = useState(false);

  // refs para controlar toasts únicos
  const toastCargaMostrado = useRef(false); // 🔐 evitar duplicación en carga inicial

  useEffect(() => {
    cargarTipos();
  }, []);

  const cargarTipos = async () => {
    setLoading(true);
    try {
      const data = await obtenerTiposPermiso();
      setTipos(data);

      // 🔐 Mostrar toast de carga solo 1 vez en todo el ciclo de vida
      if (!toastCargaMostrado.current) {
        toast.success('📦 Tipos de permiso cargados correctamente');
        toastCargaMostrado.current = true;
      }

    } catch {
      toast.error('❌ Error al cargar tipos de permiso');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      toast.warn('⚠️ El nombre es obligatorio');
      return;
    }

    setLoading(true);
    try {
      if (form.id) {
        await actualizarTipoPermiso(form.id, {
          nombre: form.nombre,
          sub_tipo: form.sub_tipo,
        });
        toast.success('✅ Tipo de permiso actualizado');
      } else {
        await crearTipoPermiso({
          nombre: form.nombre,
          sub_tipo: form.sub_tipo,
        });
        toast.success('✅ Tipo de permiso creado');
      }

      setForm({ id: null, nombre: '', sub_tipo: '' });
      setShowForm(false);
      await cargarTipos();
    } catch {
      toast.error('❌ Error al guardar tipo de permiso');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (tipo) => {
    setForm({
      id: tipo.id,
      nombre: tipo.nombre,
      sub_tipo: tipo.sub_tipo,
    });
    setShowForm(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que desea eliminar este tipo de permiso?')) return;

    setLoading(true);
    try {
      await eliminarTipoPermiso(id);
      toast.success('🗑️ Tipo de permiso eliminado');
      await cargarTipos();
    } catch {
      toast.error('❌ Error al eliminar tipo de permiso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tipo-permiso-container">
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      <LoadingModal visible={loading} />

      {/* 🎯 Header mejorado con estadísticas */}
      <div className="header-section">
        <div className="header-content">
          <h1>📋 Gestión de Tipos de Permiso</h1>
          <p className="subtitle">Administra los tipos de permisos disponibles en el sistema</p>
          <div className="stats-overview">
            <div className="stat-item">
              <span className="stat-number">{tipos.length}</span>
              <span className="stat-label">Total de Tipos</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{tipos.filter(t => t.sub_tipo).length}</span>
              <span className="stat-label">Con Sub-tipos</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🎨 Botón de crear mejorado */}
      <div className="actions-section">
        {!showForm ? (
          <button 
            className="btn btn-primary create-btn" 
            onClick={() => setShowForm(true)}
          >
            ➕ Nuevo Tipo de Permiso
          </button>
        ) : (
          <div className="form-indicator">
            <span className="form-badge">
              {form.id ? '✏️ Editando' : '➕ Creando Nuevo'}
            </span>
          </div>
        )}
      </div>

      {/* ✨ Formulario mejorado */}
      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>{form.id ? '✏️ Editar Tipo de Permiso' : '➕ Crear Nuevo Tipo'}</h3>
            <p>Complete la información del tipo de permiso</p>
          </div>
          
          <form className="tipo-permiso-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <span className="label-icon">📝</span>
                  <span className="label-text">Nombre del Tipo *</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Vacaciones, Permiso médico..."
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">🏷️</span>
                  <span className="label-text">Sub-tipo (Opcional)</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="sub_tipo"
                    value={form.sub_tipo}
                    onChange={handleChange}
                    placeholder="Ej: Con goce, Sin goce..."
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {form.id ? '💾 Actualizar Tipo' : '➕ Crear Tipo'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setForm({ id: null, nombre: '', sub_tipo: '' });
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 📊 Tabla moderna */}
      <div className="table-section">
        <div className="table-header">
          <h3>📊 Lista de Tipos de Permiso</h3>
          <p>Administra todos los tipos de permisos disponibles</p>
        </div>

        {tipos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h4>No hay tipos de permiso</h4>
            <p>Comienza creando el primer tipo de permiso para el sistema</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              ➕ Crear Primer Tipo
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="tipo-permiso-table">
              <thead>
                <tr>
                  <th>🆔 ID</th>
                  <th>📝 Nombre del Tipo</th>
                  <th>🏷️ Sub-tipo</th>
                  <th>⚙️ Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tipos.map((tipo) => (
                  <tr key={tipo.id} className="table-row">
                    <td>
                      <span className="id-badge">#{tipo.id}</span>
                    </td>
                    <td>
                      <div className="tipo-info">
                        <span className="tipo-name">{tipo.nombre}</span>
                      </div>
                    </td>
                    <td>
                      <div className="subtipo-info">
                        {tipo.sub_tipo ? (
                          <span className="subtipo-badge">{tipo.sub_tipo}</span>
                        ) : (
                          <span className="no-subtipo">Sin sub-tipo</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="actions-group">
                        <button 
                          className="btn btn-edit" 
                          onClick={() => handleEditar(tipo)}
                          title="Editar tipo de permiso"
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className="btn btn-delete" 
                          onClick={() => handleEliminar(tipo.id)}
                          title="Eliminar tipo de permiso"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TipoPermisoGestion;
