import React, { useEffect, useState } from 'react';
import { 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineIdentification,
  HiOutlineLocationMarker,
  HiOutlineLockClosed,
  HiOutlineCamera,
  HiOutlinePencil,
  HiOutlineEye,
  HiOutlineEyeOff
} from 'react-icons/hi';
import { obtenerPerfil, cambiarContrasena } from '../services/api';
import LoadingModal from '../components/LoadingModal';
import '../styles/Perfil.css';

const ROLES_LABELS = {
  docente: 'Usuarios de Idiomas Extranjeros',
  admin: 'Administrador del Sistema',
  director: 'Director del Instituto Académico de Idiomas',
  tthh: 'Departamento de Talento Humano',
  dti: 'Departamento de Tecnología de la Información',
};

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado modal cambiar contraseña
  const [showModal, setShowModal] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  
  // Estados para mostrar/ocultar contraseñas
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    obtenerPerfil()
      .then(data => {
        setUsuario(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Error al cargar el perfil');
        setLoading(false);
      });
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!oldPass || !newPass || !confirmPass) {
      setPassError('Todos los campos son obligatorios');
      return;
    }

    if (newPass !== confirmPass) {
      setPassError('Las contraseñas no coinciden');
      return;
    }

    try {
      setChangingPass(true);
      await cambiarContrasena(oldPass, newPass);
      setPassSuccess('Contraseña cambiada correctamente');
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      setPassError(err.message);
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div>
      <LoadingModal visible={loading || changingPass} />

      {error && (
        <div className="perfil-error">
          <p>Error: {error}</p>
        </div>
      )}
      
      {!loading && !usuario && (
        <div className="perfil-error">
          <p>No se encontró información del perfil.</p>
        </div>
      )}

      {usuario && (
        <div className="perfil-container">
          {/* Header con foto y datos principales */}
          <div className="perfil-header">
            <div className="perfil-avatar-section">
              <div className="perfil-avatar-container">
                <img
                  src={usuario.fotoUrl || 'https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png'}
                  alt="Foto de perfil"
                  className="perfil-avatar"
                />
                <button className="avatar-edit-btn" title="Cambiar foto">
                  <HiOutlineCamera />
                </button>
              </div>
              <div className="perfil-basic-info">
                <h1 className="perfil-nombre">{usuario.nombres} {usuario.apellidos}</h1>
                <div className="perfil-rol">
                  <HiOutlineUser className="role-icon" />
                  <span>{ROLES_LABELS[usuario.rol] || 'Usuario'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información detallada en cards */}
          <div className="perfil-content">
            <div className="perfil-section">
              <div className="section-header">
                <h2>Información Personal</h2>
                <button className="edit-btn" title="Editar información">
                  <HiOutlinePencil />
                </button>
              </div>
              
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-icon">
                    <HiOutlineMail />
                  </div>
                  <div className="info-content">
                    <label>Correo electrónico</label>
                    <span>{usuario.correo}</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <HiOutlinePhone />
                  </div>
                  <div className="info-content">
                    <label>Teléfono</label>
                    <span>{usuario.telefono || 'No registrado'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <HiOutlineIdentification />
                  </div>
                  <div className="info-content">
                    <label>Cédula de identidad</label>
                    <span>{usuario.ci || 'No registrada'}</span>
                  </div>
                </div>

                <div className="info-item full-width">
                  <div className="info-icon">
                    <HiOutlineLocationMarker />
                  </div>
                  <div className="info-content">
                    <label>Dirección</label>
                    <span>{usuario.direccion || 'No registrada'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de seguridad */}
            <div className="perfil-section">
              <div className="section-header">
                <h2>Seguridad</h2>
              </div>
              
              <div className="security-actions">
                <button 
                  className="security-btn change-password-btn" 
                  onClick={() => setShowModal(true)}
                >
                  <HiOutlineLockClosed />
                  <span>Cambiar Contraseña</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal mejorado para cambiar contraseña */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-container">
                <div className="modal-header">
                  <h3>Cambiar Contraseña</h3>
                  <button 
                    className="modal-close-btn"
                    onClick={() => {
                      setShowModal(false);
                      setOldPass('');
                      setNewPass('');
                      setConfirmPass('');
                      setPassError('');
                      setPassSuccess('');
                      setShowOldPass(false);
                      setShowNewPass(false);
                      setShowConfirmPass(false);
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handlePasswordChange} className="modal-form">
                  <div className="input-group">
                    <label>Contraseña actual</label>
                    <div className="password-input-container">
                      <input
                        type={showOldPass ? "text" : "password"}
                        placeholder="Ingresa tu contraseña actual"
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowOldPass(!showOldPass)}
                      >
                        {showOldPass ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Nueva contraseña</label>
                    <div className="password-input-container">
                      <input
                        type={showNewPass ? "text" : "password"}
                        placeholder="Ingresa la nueva contraseña"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewPass(!showNewPass)}
                      >
                        {showNewPass ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Confirmar nueva contraseña</label>
                    <div className="password-input-container">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        placeholder="Confirma la nueva contraseña"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                      >
                        {showConfirmPass ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                      </button>
                    </div>
                  </div>

                  {passError && (
                    <div className="alert alert-error">
                      {passError}
                    </div>
                  )}
                  
                  {passSuccess && (
                    <div className="alert alert-success">
                      {passSuccess}
                    </div>
                  )}

                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary">
                      Guardar Cambios
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowModal(false);
                        setOldPass('');
                        setNewPass('');
                        setConfirmPass('');
                        setPassError('');
                        setPassSuccess('');
                        setShowOldPass(false);
                        setShowNewPass(false);
                        setShowConfirmPass(false);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Perfil;
