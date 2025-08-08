import React, { useState } from 'react';
import { solicitarReset } from '../services/api'; // ✅ llamada centralizada
import LoadingModal from '../components/LoadingModal';
import '../styles/Login.css';

function SolicitarReset() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setLoading(true);

    try {
      const data = await solicitarReset(correo);
      setMensaje(data.mensaje || 'Se ha enviado un enlace de recuperación a su correo.');
      setCorreo('');
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
          <h2>Recuperar Contraseña</h2>
          <p>Ingrese su correo electrónico y le enviaremos instrucciones para restablecer su contraseña.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="correo">Correo electrónico</label>
              <input
                type="email"
                id="correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                placeholder="ejemplo@correo.com"
              />
            </div>

            {error && <p className="error-msg">{error}</p>}
            {mensaje && <p className="success-msg">{mensaje}</p>}

            <button type="submit">Enviar enlace</button>
          </form>
        </div>
      </div>
      <LoadingModal visible={loading} />
    </div>
  );
}

export default SolicitarReset;
