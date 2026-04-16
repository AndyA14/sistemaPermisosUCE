import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUsuario } from '../services/api';
import { isAuthenticated, getRol, loginUsuarioT } from '../utils/auth';
import { ToastContainer, toast } from 'react-toastify';
import LoadingModal from '../components/LoadingModal';
import '../styles/Login.css';

function Login() {
  const [form, setForm] = useState({ username: '', contrasena: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // === Función centralizada para redirigir según rol ===
  const redirigirPorRol = (rol = '') => {
    const rutaPorRol = {
      docente: '/permisos/ver',
      director: '/dashboard/resumen',
      tthh: '/listado-tthh/dashboard',
      dti: '/dtic/dashboard',
      admin: '/permisos/ver',
    };
    navigate(rutaPorRol[rol.toLowerCase()] || '/unauthorized');
  };

  // === Si ya está autenticado, redirigir automáticamente ===
  useEffect(() => {
    if (isAuthenticated()) {
      redirigirPorRol(getRol());
    }
  }, [navigate]);

  // === Manejo de inputs controlados ===
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  // === Envío del formulario ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación rápida
    if (!form.username || !form.contrasena) {
      toast.warn('Por favor, complete todos los campos', {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const data = await loginUsuario(form);
      loginUsuarioT(data.token);
      localStorage.setItem('rol', data.usuario.rol.toLowerCase());
      redirigirPorRol(data.usuario.rol);
    } catch (err) {
      toast.error(err.message || 'Error al iniciar sesión', {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-section">
        <div className="login-card">
          <h2>Iniciar Sesión</h2>

          <div className="login-header">
            <img src="/logoIAI.png" alt="Logo" className="login-user-img" />
          </div>

          <form onSubmit={handleSubmit}>
            <InputConIcono
              id="username"
              label="Usuario"
              type="text"
              placeholder="Ingrese su usuario"
              value={form.username}
              onChange={handleInputChange}
              iconPath="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"
            />

            <InputConIcono
              id="contrasena"
              label="Contraseña"
              type="password"
              placeholder="Ingrese su contraseña"
              value={form.contrasena}
              onChange={handleInputChange}
              iconPath="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-6h-1V9a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM8 9a4 4 0 0 1 8 0v2H8V9z"
            />

            {/* Botón dinámico: se deshabilita y cambia el texto en loading */}
            <button type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>

            <div className="forgot-password-link">
              <Link to="/solicitar-reset">¿Olvidó su contraseña?</Link>
            </div>
          </form>
        </div>
      </div>

      {/* Contenedor global para notificaciones */}
      <ToastContainer />
      
      {/* Modal de carga */}
      <LoadingModal visible={loading} />
    </div>
  );
}

// === Componente Input con Icono (reutilizable) ===
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

export default Login;
