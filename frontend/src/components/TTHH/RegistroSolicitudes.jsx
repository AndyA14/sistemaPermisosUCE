import React, { useEffect, useState, useRef } from 'react';
import {
  buscarDocentesPorNombre,
  descargarInformeMensual,
  descargarInformeFiltrado,
  obtenerPermisosFiltrados,
} from '../../services/api';
import '../../styles/RegistroSolicitudes.css';
import { renderEstado } from '../../utils/renderEstado';
import CartaSeguimientoPermiso from '../PlantillasCartas/PlantillasVistasC/CartaSeguimientoPermiso';
import { toast, ToastContainer } from 'react-toastify';
import LoadingModal from '../../components/LoadingModal.jsx';
import 'react-toastify/dist/ReactToastify.css';

function RegistroSolicitudes() {
  const [filtro, setFiltro] = useState({ mes: '', anio: '', desde: '', hasta: '', nombre: '' });
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [permisosCargados, setPermisosCargados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [permisoDetalle, setPermisoDetalle] = useState(null);

  // Ref para evitar toasts duplicados
  const toastId = useRef(null);

  const abrirDetalle = (permiso) => setPermisoDetalle(permiso);
  const cerrarDetalle = () => setPermisoDetalle(null);

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

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setCargando(true);
      try {
        const todosPermisos = await obtenerPermisosFiltrados({});
        setPermisosCargados(todosPermisos);
        setPermisos(todosPermisos);
        if (!toast.isActive(toastId.current)) {
          toastId.current = toast.success('Permisos cargados correctamente');
        }
      } catch (err) {
        if (!toast.isActive(toastId.current)) {
          toastId.current = toast.error(err.message || 'Error al cargar datos');
        }
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

  const manejarCambioNombreUsuario = (e) => {
    const valor = e.target.value;
    setNombreUsuario(valor);
    if (valor === '') setFiltro(prev => ({ ...prev, nombre: '' }));
  };

  const manejarSeleccionUsuario = (usuario) => {
    const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`;
    setNombreUsuario(nombreCompleto);
    setFiltro(prev => ({ ...prev, nombre: nombreCompleto }));
    setListaUsuarios([]);
  };

  const manejarMesAnio = (e) => {
    const valor = e.target.value;
    if (!valor) return setFiltro(prev => ({ ...prev, mes: '', anio: '' }));
    const [anio, mes] = valor.split('-');
    setFiltro(prev => ({ ...prev, mes, anio }));
  };

  const manejarFechaDesde = (e) => setFiltro(prev => ({ ...prev, desde: e.target.value }));
  const manejarFechaHasta = (e) => setFiltro(prev => ({ ...prev, hasta: e.target.value }));

  const descargarMensual = async () => {
    if (!filtro.mes || !filtro.anio) {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.warn('Debe seleccionar mes y año');
      }
      return;
    }
    setCargando(true);
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
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.success('Informe mensual descargado');
      }
    } catch (err) {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.error(err.message || 'Error al descargar informe mensual');
      }
    } finally {
      setCargando(false);
    }
  };

  const descargarPorRango = async () => {
    if (!filtro.desde || !filtro.hasta) {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.warn('Debe seleccionar rango de fechas');
      }
      return;
    }
    setCargando(true);
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
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.success('Informe por rango descargado');
      }
    } catch (err) {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.error(err.message || 'Error al descargar informe por rango');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="registro-container">
      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
      {cargando && <LoadingModal visible={true} />}

      <h2>Registro de Solicitudes</h2>

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

        <input type="date" value={filtro.desde} onChange={manejarFechaDesde} />
        <input type="date" value={filtro.hasta} onChange={manejarFechaHasta} />

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

      {permisoDetalle && (
        <div className="modal-fondo" onClick={cerrarDetalle}>
          <div className="modal-contenido" onClick={e => e.stopPropagation()}>
            <CartaSeguimientoPermiso permiso={permisoDetalle} />
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistroSolicitudes;
