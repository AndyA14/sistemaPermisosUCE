import {jwtDecode} from 'jwt-decode';

// Guardar solo el token
export const loginUsuarioT = (token) => {
  localStorage.setItem('token', token);
};

// Cerrar sesión
export const logoutUsuario = () => {
  localStorage.removeItem('token');
};

// Obtener token actual
export const getToken = () => localStorage.getItem('token');

// Decodificar el token para obtener la carga útil
export const getPayload = () => {
  const token = getToken();
  try {
    return token ? jwtDecode(token) : null;
  } catch (err) {
    console.error('Error decodificando el token', err);
    return null;
  }
};

// Verifica si hay sesión activa (y si el token no está expirado opcionalmente)
export const isAuthenticated = () => {
  const payload = getPayload();
  if (!payload) return false;

  const now = Date.now() / 1000;
  return payload.exp > now;
};

// Obtener info del usuario (username, id, etc)
export const getUsuario = () => getPayload();

// Obtener el rol actual
export const getRol = () => {
  const payload = getPayload();
  return payload?.rol || null;
};
