import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetearContrasena } from '../services/api';
import LoadingModal from '../components/LoadingModal';
import '../styles/Login.css';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validarContrasena = (pwd) => {
    return pwd.length >= 8 &&
           /[A-Z]/.test(pwd) &&
           /[a-z]/.test(pwd) &&
           /\d/.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setLoading(true);

    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    if (!validarContrasena(contrasena)) {
      setError('Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      setLoading(false);
      return;
    }

    try {
      const data = await resetearContrasena(token, contrasena);
      setMensaje(data.mensaje || 'Contraseña actualizada correctamente.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-section">
        <div className="login-card">
          <h2>Restablecer Contraseña</h2>
          <form onSubmit={handleSubmit}>

            <InputConIcono
              id="contrasena"
              label="Nueva Contraseña"
              type="password"
              placeholder="Ingrese nueva contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              iconPath="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-6h-1V9a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM8 9a4 4 0 0 1 8 0v2H8V9z"
            />

            <InputConIcono
              id="confirmar"
              label="Confirmar Contraseña"
              type="password"
              placeholder="Repita la contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              iconPath="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-6h-1V9a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM8 9a4 4 0 0 1 8 0v2H8V9z"
            />

            {error && <p className="error-msg">{error}</p>}
            {mensaje && <p className="success-msg">{mensaje}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Restableciendo..." : "Restablecer"}
            </button>
          </form>
        </div>
      </div>
      <LoadingModal visible={loading} />
    </div>
  );
}

// Componente reutilizable InputConIcono
function InputConIcono({ id, label, type, placeholder, value, onChange, iconPath }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="input-with-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d={iconPath} />
        </svg>
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          required
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

export default ResetPassword;
