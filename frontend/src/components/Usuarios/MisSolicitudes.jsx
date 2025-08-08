import React, { useState, useEffect, useCallback, useRef } from 'react';
import { obtenerMisPermisos } from '../../services/api';
import CartaSeguimientoPermiso from '../PlantillasCartas/PlantillasVistasC/CartaSeguimientoPermiso';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import LoadingModal from '../LoadingModal'; // Ajusta la ruta si tu archivo está en otro directorio
import '../../styles/MisSolicitudes.css';
import { renderEstado } from '../../utils/renderEstado'; // Asegúrate de que esta ruta sea correcta

// Mapas de equivalencia para estados y tipos (fuera del componente para evitar recreación)
const estadosFiltroMap = {
  pendiente: ['pendiente'],
  aprobado: ['aprobado', 'autorizado'],
  rechazado: ['rechazado', 'denegado'],
  enrevision: ['en_revison']
};

const tiposFiltroMap = {
  falta: ['falta'],
  atraso: ['atraso'],
  otros: ['otros', 'permiso', 'licencia'],
  'sin timbrar': ['sin timbrar'],
};

function MisSolicitudes() {
  const [permisos, setPermisos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [permisoDetalle, setPermisoDetalle] = useState(null);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const toastMostradoRef = useRef(false);

  const cargarPermisos = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerMisPermisos();
      setPermisos(data);
      if (!toastMostradoRef.current) {
        toast.success('Permisos cargados correctamente');
        toastMostradoRef.current = true;
      }
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      toast.error('Error al cargar permisos. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  }, []);


  useEffect(() => {
    cargarPermisos();
  }, [cargarPermisos]);

  useEffect(() => {
    const manejarTeclaEscape = (e) => {
      if (e.key === 'Escape') {
        cerrarDetalle();
      }
    };

    if (permisoDetalle) {
      window.addEventListener('keydown', manejarTeclaEscape);
    }

    return () => {
      window.removeEventListener('keydown', manejarTeclaEscape);
    };
  }, [permisoDetalle]);


  // Función para normalizar texto (minúsculas y trim)
  const normalizar = (str) => str?.toLowerCase().trim() || '';

  // Memoizamos el filtrado para evitar cálculos innecesarios en renders
  const permisosFiltrados = React.useMemo(() => {
    return permisos.filter((p) => {
      const estadoPermiso = normalizar(p.estado_general);
      const tipoPermiso = normalizar(p.tipo?.nombre);

      // Filtrar estado
      if (filtroEstado) {
        const estadosAceptados = estadosFiltroMap[filtroEstado] || [filtroEstado];
        if (!estadosAceptados.some(e => estadoPermiso.includes(e))) return false;
      }

      // Filtrar tipo
      if (filtroTipo) {
        const tiposAceptados = tiposFiltroMap[filtroTipo] || [filtroTipo];
        if (!tiposAceptados.some(t => tipoPermiso.includes(t))) return false;
      }

      return true;
    });
  }, [permisos, filtroEstado, filtroTipo]);

  const abrirDetalle = (permiso) => setPermisoDetalle(permiso);
  const cerrarDetalle = () => setPermisoDetalle(null);



  return (
    <div className="mis-solicitudes-container">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {cargando && <LoadingModal visible={true} />}

      <h2>📋 Mis Solicitudes de Permisos</h2>

      <div className="filtros">
        <select 
          value={filtroEstado} 
          onChange={e => setFiltroEstado(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">🔍 Todos los estados</option>
          <option value="pendiente">⏳ Pendiente</option>
          <option value="aprobado">✅ Aprobado</option>
          <option value="rechazado">❌ Rechazado</option>
          <option value="en_revision">🔄 En revisión</option>
        </select>

        <select 
          value={filtroTipo} 
          onChange={e => setFiltroTipo(e.target.value)}
          aria-label="Filtrar por tipo"
        >
          <option value="">📂 Todos los tipos</option>
          <option value="falta">🚫 Falta</option>
          <option value="atraso">⏰ Atraso</option>
          <option value="sin timbrar">🕐 Sin Timbrar</option>
          <option value="otros">📄 Otros</option>
        </select>
      </div>

      <table className="tabla-solicitudes">
        <thead>
          <tr>
            <th>🆔 ID</th>
            <th>📋 Tipo</th>
            <th>📅 Fecha</th>
            <th>🏷️ Estado</th>
            <th>📎 Documentos</th>
            <th>⚡ Acciones</th>
          </tr>
        </thead>
        <tbody>
          {permisosFiltrados.length === 0 ? (
            <tr>
              <td colSpan="6" className="sin-resultados">
                📋 No hay solicitudes que coincidan con los filtros seleccionados.
              </td>
            </tr>
          ) : (
            permisosFiltrados.map(p => (
              <tr key={p.id}>
                <td data-label="ID">{p.id}</td>
                <td data-label="Tipo">
                  {p.tipo?.nombre} {p.tipo?.sub_tipo ? `(${p.tipo.sub_tipo})` : ''}
                </td>
                <td data-label="Fecha">
                  {p.fecha_inicio === p.fecha_fin
                    ? p.fecha_inicio
                    : `${p.fecha_inicio} - ${p.fecha_fin}`}
                </td>
                <td data-label="Estado">{renderEstado(p.estado_general)}</td>
                <td data-label="Documentos">
                  {p.documentos?.length > 0 ? (
                    p.documentos.map(doc => {
                      const nombreArchivo = doc.url.split('/').pop();

                      return (
                        <div key={doc.id}>
                          <button
                            onClick={() => navigate(`/uploads/documentos/${nombreArchivo}`)}
                            title="Ver evidencia"
                          >
                            📄 {doc.tipo?.replace(/"/g, '') || 'Evidencia'}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <span style={{ color: 'var(--color-text-tertiary)' }}>Sin documentos</span>
                  )}
                </td>
                <td data-label="Acciones">
                  <button onClick={() => abrirDetalle(p)}>
                    👁️ Ver Detalles
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {permisoDetalle && (
        <div className="modal-fondo" onClick={cerrarDetalle}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <CartaSeguimientoPermiso permiso={permisoDetalle} />
          </div>
        </div>
      )}
    </div>
  );
}

export default MisSolicitudes;
