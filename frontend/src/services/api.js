const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});


/** 
 * ========================
 * Funciones Autenticación (/auth)
 * ========================
 */

export const loginUsuario = async (credenciales) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credenciales),
  });

  if (!res.ok) throw new Error('Credenciales inválidas');
  return await res.json();
};

export const solicitarReset = async (correo) => {
  const res = await fetch(`${API_URL}/auth/solicitar-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo }),
  });

  if (!res.ok) throw new Error('No se pudo enviar el correo de recuperación');
  return await res.json();
};

export const resetearContrasena = async (token, nuevaContrasena) => {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, nuevaContrasena }),
  });

  if (!res.ok) throw new Error('Error al restablecer contraseña');
  return await res.json();
};

/** 
 * ========================
 * Funciones Usuarios (/usuario)
 * ========================
 */

// 1. Obtener todos los usuarios
export const getUsuarios = async () => {
  const res = await fetch(`${API_URL}/usuario`, { headers: headers() });
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return await res.json();
};

// 2. Obtener un usuario por ID
export const getUsuarioPorId = async (id) => {
  const res = await fetch(`${API_URL}/usuario/${id}`, { headers: headers() });
  if (!res.ok) throw new Error('Error al obtener usuario');
  return await res.json();
};

// 3. Crear nuevo usuario
export const crearUsuario = async (usuario) => {
  const res = await fetch(`${API_URL}/usuario`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(usuario),
  });
  if (!res.ok) throw new Error('Error al crear usuario');
  return await res.json();
};

// 4. Actualizar un usuario
export const actualizarUsuario = async (id, data) => {
  const res = await fetch(`${API_URL}/usuario/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar usuario');
  return await res.json();
};

// 5. Desactivar un usuario
export const desactivarUsuario = async (id) => {
  const res = await fetch(`${API_URL}/usuario/${id}/desactivar`, {
    method: 'PATCH',
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al desactivar usuario');
  return await res.json();
};

// 6. Activar un usuario
export const activarUsuario = async (id) => {
  const res = await fetch(`${API_URL}/usuario/${id}/activar`, {
    method: 'PATCH',
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al activar usuario');
  return await res.json();
};

// 7. Obtener perfil del usuario autenticado
export const obtenerPerfil = async () => {
  const res = await fetch(`${API_URL}/usuario/perfil`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al cargar perfil');
  return await res.json();
};

// 8. Cambiar contraseña del usuario autenticado
export const cambiarContrasena = async (contraseñaActual, nuevaContraseña) => {
  const res = await fetch(`${API_URL}/usuario/cambiar-contrasena`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      contraseñaActual,
      nuevaContraseña,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al cambiar contraseña');
  }

  return await res.json();
};

/** 
 * ========================
 * Funciones Tipos de Permiso (/tipos-permiso)
 * ========================
 */

/** Obtener todos los tipos de permiso */
export const obtenerTiposPermiso = async () => {
  const res = await fetch(`${API_URL}/tipos-permiso`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al obtener tipos de permiso');
  return await res.json();
};

/** Crear nuevo tipo de permiso */
export const crearTipoPermiso = async (data) => {
  const res = await fetch(`${API_URL}/tipos-permiso`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear tipo de permiso');
  return await res.json();
};

/** Actualizar tipo de permiso por ID */
export const actualizarTipoPermiso = async (id, data) => {
  const res = await fetch(`${API_URL}/tipos-permiso/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar tipo de permiso');
  return await res.json();
};

/** Eliminar tipo de permiso por ID */
export const eliminarTipoPermiso = async (id) => {
  const res = await fetch(`${API_URL}/tipos-permiso/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al eliminar tipo de permiso');
  return await res.json();
};


/** 
 * ========================
 * Funciones ReportesDTIC (/dashboard)
 * ========================
 */
export const buscarDocentesPorNombre = async (nombre) => {
  const res = await fetch(
    `${API_URL}/dashboard/buscar?nombre=${encodeURIComponent(nombre)}`,
    {
      headers: headers(),
    }
  );
  if (!res.ok) throw new Error('Error al buscar docentes');
  return await res.json();
};

export const descargarInformeFiltrado = async ({ desde, hasta, nombre }) => {
  const query = new URLSearchParams({ desde, hasta, nombre });
  const res = await fetch(`${API_URL}/dashboard/generar-informe?${query}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al generar informe filtrado');
  return await res.blob();
};

export const descargarInformeMensual = async ({ mes, anio, nombre }) => {
  const query = new URLSearchParams({ mes, anio, nombre });
  const res = await fetch(`${API_URL}/dashboard/generar-informe?${query}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al generar informe mensual');
  return await res.blob();
};

export const obtenerResumenGeneral = async () => {
  const res = await fetch(`${API_URL}/dashboard/resumen-general`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al obtener resumen');
  return await res.json();
};

export const obtenerPermisosPorTipo = async () => {
  const res = await fetch(`${API_URL}/dashboard/permisos/por-tipo`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al obtener permisos por tipo');
  return await res.json();
};

export const obtenerTopDocentes = async () => {
  const res = await fetch(`${API_URL}/dashboard/permisos/top-usuarios`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al obtener top docentes');
  return await res.json();
};

export const obtenerPermisosPorMes = async () => {
  const res = await fetch(`${API_URL}/dashboard/permisos/por-mes`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al obtener permisos por mes');
  return await res.json();
};

export const obtenerUltimosPermisos = async () => {
  const res = await fetch(`${API_URL}/dashboard/permisos/ultimos`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al obtener últimos permisos');
  return await res.json();
};

export const obtenerMisPermisos = async () => {
  const res = await fetch(`${API_URL}/dashboard/mis-permisos`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error('Error al obtener mis permisos');
  return await res.json();
};

/** 
 * ========================
 * Funciones Permisos (/permisos)
 * ========================
 */

export const obtenerPermisosFiltrados = async ({ mes, anio, docente_id }) => {
  const query = new URLSearchParams();
  if (mes) query.append('mes', mes);
  if (anio) query.append('anio', anio);
  if (docente_id) query.append('docente_id', docente_id);

  const res = await fetch(`${API_URL}/permisos/filtro?${query.toString()}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  if (!res.ok) throw new Error('Error al obtener permisos filtrados');
  return await res.json();
};

export const crearPermiso = async ({ permisoData, archivo, htmlCorreo }) => {
  const formData = new FormData();

  Object.entries(permisoData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  if (archivo) {
    formData.append('documento', archivo);
  }

  formData.append('htmlCorreo', htmlCorreo);

  const res = await fetch(`${API_URL}/permisos`, {
    method: 'POST',
    headers: {
      Authorization: headers().Authorization
    },
    body: formData,
  });

  if (!res.ok) throw new Error('Error al crear permiso');
  return await res.json();
};

export const actualizarPermiso = async (id, data) => {
  const res = await fetch(`${API_URL}/permisos/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar permiso');
  return await res.json();
};

export const autorizarPermiso = async (id, observacion, carga_vacaciones = false) => {
  const res = await fetch(`${API_URL}/permisos/${id}/autorizar`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ observacion, carga_vacaciones }), // 👈 importante
  });
  if (!res.ok) throw new Error('Error al autorizar permiso');
  return await res.json();
};

export const denegarPermiso = async (id, observacion, carga_vacaciones = false) => {
  const res = await fetch(`${API_URL}/permisos/${id}/denegar`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ observacion, carga_vacaciones }), // 👈 importante
  });
  if (!res.ok) throw new Error('Error al denegar permiso');
  return await res.json();
};

export const obtenerPermisosUsuario = async () => {
  try {
    const res = await fetch(`${API_URL}/dashboard/mis-permisos`, {
      method: 'GET',
      headers: headers(),
    });

    if (!res.ok) throw new Error('No se pudieron obtener los permisos');

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error al cargar permisos del usuario:', err);
    throw err;
  }
};

export async function revisarPermisoPorTTHH(id, { observacion }) {
  const res = await fetch(`${API_URL}/permisos/${id}/revisar-tthh`, {
    method: 'PUT',
    headers: headers(), // asegúrate que este retorna Content-Type: application/json y Authorization
    body: JSON.stringify({ observacion }),
  });

  const contentType = res.headers.get('Content-Type');

  // Manejar errores con o sin cuerpo JSON
  if (!res.ok) {
    let error = {};
    if (contentType && contentType.includes('application/json')) {
      try {
        error = await res.json();
      } catch {
        error = { error: 'Error inesperado al procesar el error del servidor' };
      }
    }
    throw new Error(error.error || 'Error desconocido');
  }

  // Verificar si hay cuerpo JSON antes de parsear
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }

  // Si no hay contenido o no es JSON, devuelve null o vacío
  return null;
}



/** 
 * ========================
 * Funciones Correos (/correos)
 * ========================
 */

export async function obtenerCorreosPorAlias(alias) {
  const url = `${API_URL}/correos/${alias}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: headers(),
  });

  if (!response.ok) {
    throw new Error(`Error al obtener correos para alias "${alias}"`);
  }

  const data = await response.json();
  return data.correos || [];
}

export async function obtenerCorreosUnificadosTTHH() {
  const url = `${API_URL}/correos/obtener/unificado/tthh`;

  const res = await fetch(url, {
    method: 'GET',
    headers: headers(),
  });

  if (!res.ok) throw new Error(`Error al obtener correos unificados para alias "director"`);

  return await res.json();
}

export async function obtenerCorreosUnificadosDirector() {
  const url = `${API_URL}/correos/obtener/unificado/director`;

  const res = await fetch(url, {
    method: 'GET',
    headers: headers(),
  });

  if (!res.ok) throw new Error(`Error al obtener correos unificados para alias "director"`);

  return await res.json();
}

/** 
 * ========================
 * Utilidades
 * ========================
 */

export const obtenerUrlDocumento = (nombreArchivo) => {
  if (!nombreArchivo) return null;
  return `${API_URL}/uploads/documentos/${nombreArchivo}`;
};
