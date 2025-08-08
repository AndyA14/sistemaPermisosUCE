import React, { useEffect, useState } from 'react';
import {
  buscarDocentesPorNombre,
  descargarInformeMensual,
  descargarInformeFiltrado,
  obtenerResumenGeneral,
  obtenerUltimosPermisos,
} from '../../services/api';
import '../../styles/ReportesDTIC.css';
import CartaSeguimientoPermiso from '../PlantillasCartas/PlantillasVistasC/CartaSeguimientoPermiso';
import { renderEstado } from '../../utils/renderEstado';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingModal from '../../components/LoadingModal';

function ReportesDTIC() {
  // --- Estados principales ---
  const [datosResumen, setDatosResumen] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    permisosPendientes: 0,
    permisosAutorizados: 0,
    permisosDenegados: 0,
  });

  const [filtro, setFiltro] = useState({
    mes: '',
    anio: '',
    desde: '',
    hasta: '',
    nombre: '',
  });

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [listaUsuarios, setListaUsuarios] = useState([]);

  const [permisos, setPermisos] = useState([]);
  const [permisosCargados, setPermisosCargados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [permisoDetalle, setPermisoDetalle] = useState(null);

  const abrirDetalle = (permiso) => setPermisoDetalle(permiso);
  const cerrarDetalle = () => setPermisoDetalle(null);

  // --- Filtro por nombre, fecha o mes ---
  const filtrarPermisos = () => {
    let filtrados = permisosCargados;

    if (filtro.nombre) {
      const nombreLower = filtro.nombre.toLowerCase();
      filtrados = filtrados.filter(p =>
        `${p.usuario.nombres} ${p.usuario.apellidos}`.toLowerCase().includes(nombreLower)
      );
    }

    if (filtro.mes && filtro.anio) {
      const mesStr = `${filtro.anio}-${filtro.mes.padStart(2, '0')}`;
      filtrados = filtrados.filter(p => p.fecha_inicio.startsWith(mesStr));
    }

    if (filtro.desde && filtro.hasta) {
      const desdeDate = new Date(filtro.desde);
      const hastaDate = new Date(filtro.hasta);
      filtrados = filtrados.filter(p => {
        const fecha = new Date(p.fecha_inicio);
        return fecha >= desdeDate && fecha <= hastaDate;
      });
    }

    setPermisos(filtrados);
  };

  // --- Carga inicial ---
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setCargando(true);
      try {
        const resumen = await obtenerResumenGeneral();
        setDatosResumen(resumen);

        const todosPermisos = await obtenerUltimosPermisos();
        setPermisosCargados(todosPermisos);
        setPermisos(todosPermisos);

        toast.success('Datos cargados correctamente', { toastId: 'datos-cargados' });
      } catch (err) {
        toast.error('Error al cargar datos del resumen', { toastId: 'error-carga' });
      } finally {
        setCargando(false);
      }
    };
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    filtrarPermisos();
  }, [filtro, permisosCargados]);

  useEffect(() => {
    if (nombreUsuario.trim().length < 3) {
      setListaUsuarios([]);
      return;
    }

    const handler = setTimeout(() => {
      const fetchUsuarios = async () => {
        try {
          const resultados = await buscarDocentesPorNombre(nombreUsuario.trim());
          setListaUsuarios(resultados);
        } catch {
          setListaUsuarios([]);
        }
      };
      fetchUsuarios();
    }, 500);

    return () => clearTimeout(handler);
  }, [nombreUsuario]);

  // --- Handlers ---
  const manejarCambioNombreUsuario = (e) => {
    const valor = e.target.value;
    setNombreUsuario(valor);
    if (valor === '') {
      setFiltro(prev => ({ ...prev, nombre: '' }));
    }
  };

  const manejarSeleccionUsuario = (usuario) => {
    const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`;
    setNombreUsuario(nombreCompleto);
    setFiltro(prev => ({ ...prev, nombre: nombreCompleto }));
    setListaUsuarios([]);
  };

  const manejarMesAnio = (e) => {
    const valor = e.target.value;
    if (!valor) {
      setFiltro(prev => ({ ...prev, mes: '', anio: '' }));
      return;
    }
    const [anio, mes] = valor.split('-');
    setFiltro(prev => ({ ...prev, mes, anio }));
  };

  const manejarFechaDesde = (e) => {
    setFiltro(prev => ({ ...prev, desde: e.target.value }));
  };

  const manejarFechaHasta = (e) => {
    setFiltro(prev => ({ ...prev, hasta: e.target.value }));
  };

  // --- Descargar informes ---
  const descargarMensual = async () => {
    if (!filtro.mes || !filtro.anio) {
      toast.warning('Debe seleccionar mes y año');
      return;
    }

    try {
      const blob = await descargarInformeMensual({
        mes: filtro.mes,
        anio: filtro.anio,
        nombre: filtro.nombre,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `informe_${filtro.mes}_${filtro.anio}.zip`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Informe mensual descargado');
    } catch (err) {
      toast.error('Error al descargar informe mensual');
    }
  };

  const descargarPorRango = async () => {
    if (!filtro.desde || !filtro.hasta) {
      toast.warning('Debe seleccionar un rango de fechas');
      return;
    }

    try {
      const blob = await descargarInformeFiltrado({
        desde: filtro.desde,
        hasta: filtro.hasta,
        nombre: filtro.nombre,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `informe_filtrado.zip`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Informe por rango descargado');
    } catch (err) {
      toast.error('Error al descargar informe por rango');
    }
  };

  // --- Render ---
  return (
    <div className="dashboard-container">
      {cargando && <LoadingModal visible={true} />}
      {permisoDetalle && (
        <div className="modal-fondo" onClick={cerrarDetalle}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <CartaSeguimientoPermiso permiso={permisoDetalle} />
          </div>
        </div>
      )}

      <h2>Dashboard DTIC</h2>

      <div className="dashboard-grid">
        <div className="dashboard-card bg-pendientes">
          <span className="dashboard-label">Permisos Pendientes</span>
          <span className="dashboard-value">{datosResumen.permisosPendientes}</span>
        </div>
        <div className="dashboard-card bg-autorizados">
          <span className="dashboard-label">Permisos Autorizados</span>
          <span className="dashboard-value">{datosResumen.permisosAutorizados}</span>
        </div>
        <div className="dashboard-card bg-denegados">
          <span className="dashboard-label">Permisos Denegados</span>
          <span className="dashboard-value">{datosResumen.permisosDenegados}</span>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-label">Usuarios Activos</span>
          <span className="dashboard-value">{datosResumen.usuariosActivos}</span>
        </div>
        <div className="dashboard-card">
          <span className="dashboard-label">Total Usuarios</span>
          <span className="dashboard-value">{datosResumen.totalUsuarios}</span>
        </div>
      </div>

      <div className="dashboard-filtros">
        <h3>Filtros y generación de informes</h3>

        <div className="autocomplete-container">
          <input
            type="text"
            placeholder="Buscar usuario por nombre"
            value={nombreUsuario}
            onChange={manejarCambioNombreUsuario}
            autoComplete="off"
          />
          {listaUsuarios.length > 0 && (
            <ul className="autocomplete-list">
              {listaUsuarios.map(usuario => (
                <li
                  key={usuario.id}
                  onClick={() => manejarSeleccionUsuario(usuario)}
                  onMouseDown={e => e.preventDefault()}
                >
                  {usuario.nombres} {usuario.apellidos}
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          type="month"
          value={filtro.anio && filtro.mes ? `${filtro.anio}-${filtro.mes.padStart(2, '0')}` : ''}
          onChange={manejarMesAnio}
        />

        <input
          type="date"
          value={filtro.desde}
          onChange={manejarFechaDesde}
        />
        <input
          type="date"
          value={filtro.hasta}
          onChange={manejarFechaHasta}
        />

        <button onClick={descargarMensual} disabled={!filtro.mes || !filtro.anio}>
          Descargar Informe Mensual
        </button>
        <button onClick={descargarPorRango} disabled={!filtro.desde || !filtro.hasta}>
          Descargar Informe por Rango
        </button>
      </div>

      <div className="tabla-permisos-container">
        <h3>Últimos permisos</h3>
        {permisos.length === 0 ? (
          <p>No hay permisos para mostrar con estos filtros.</p>
        ) : (
          <table className="tabla-permisos">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Tipo</th>
                <th>Subtipo</th>
                <th>Fecha inicio</th>
                <th>Fecha fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {permisos.map(p => (
                <tr key={p.id}>
                  <td>{p.usuario.nombres} {p.usuario.apellidos}</td>
                  <td>{p.tipo.nombre}</td>
                  <td>{p.tipo.sub_tipo}</td>
                  <td>{p.fecha_inicio}</td>
                  <td>{p.fecha_fin}</td>
                  <td>{renderEstado(p.estado_general)}</td>
                  <td>
                    <button onClick={() => abrirDetalle(p)}>Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Toast para notificaciones */}
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
    </div>
  );
}

export default ReportesDTIC;
