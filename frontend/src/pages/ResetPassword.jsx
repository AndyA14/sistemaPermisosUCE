import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetearContrasena } from '../services/api'; // ✅ Importa función del API
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
      setError(err.message);
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
            <div className="form-group">
              <label htmlFor="contrasena">Nueva Contraseña</label>
              <input
                type="password"
                id="contrasena"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                placeholder="Ingrese nueva contraseña"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmar">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmar"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
                placeholder="Repita la contraseña"
              />
            </div>

            {error && <p className="error-msg">{error}</p>}
            {mensaje && <p className="success-msg">{mensaje}</p>}

            <button type="submit">Restablecer</button>
          </form>
        </div>
      </div>
      <LoadingModal visible={loading} />
    </div>
  );
}

export default ResetPassword;
