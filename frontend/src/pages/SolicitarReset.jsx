import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitarReset } from '../services/api';
import LoadingModal from '../components/LoadingModal';
import '../styles/Login.css';

function SolicitarReset() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      setError(err.message || 'Error al enviar el enlace.');
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
            <InputConIcono
              id="correo"
              label="Correo electrónico"
              type="email"
              placeholder="ejemplo@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              iconPath="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
            />

            {error && <p className="error-msg">{error}</p>}
            {mensaje && <p className="success-msg">{mensaje}</p>}

            <div className="button-group">
              <button type="submit" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>

              {/* Botón de atrás opcional */}
              <button 
                type="button" 
                className="btn-back"
                onClick={() => navigate("/login")}
              >
                Atrás
              </button>
            </div>
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

export default SolicitarReset;
