import React, { useEffect, useState } from 'react';
import {
  obtenerCorreosUnificadosDirector,
  obtenerUrlDocumento,
  autorizarPermiso,
  denegarPermiso
} from '../../services/api.js';
import { Skeleton, Box } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import LoadingModal from '../LoadingModal';
import '../../styles/SolicitudesDirector.css';

function SolicitudesDirector() {
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [correoSeleccionado, setCorreoSeleccionado] = useState(null);
  const [permisoSeleccionado, setPermisoSeleccionado] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [cargaVacaciones, setCargaVacaciones] = useState(false);
  const [adjuntoSeleccionado, setAdjuntoSeleccionado] = useState(null);
  const [procesandoAccion, setProcesandoAccion] = useState(false);

  useEffect(() => {
    async function fetchCorreos() {
      setCargando(true);
      setError(null);
      try {
        const data = await obtenerCorreosUnificadosDirector();
        setResultados(data.resultados);
        toast.success('Solicitudes cargadas correctamente', { toastId: 'dir-toast-carga' });
      } catch (e) {
        toast.error(`Error al cargar solicitudes: ${e.message}`, { toastId: 'dir-toast-error' });
      } finally {
        setCargando(false);
      }
    }
    fetchCorreos();
  }, []);

  const manejarAutorizar = async () => {
    if (!permisoSeleccionado) return;
    setProcesandoAccion(true);

    try {
      await autorizarPermiso(permisoSeleccionado.id, observacion, cargaVacaciones);
      toast.success('✅ Permiso autorizado correctamente', {
        toastId: `autorizado-${permisoSeleccionado.id}`,
        position: 'top-right',
      });

      // Refrescar lista y volver
      const data = await obtenerCorreosUnificadosDirector();
      setResultados(data.resultados);
      setCorreoSeleccionado(null);
      setPermisoSeleccionado(null);
      setAdjuntoSeleccionado(null);
      setObservacion('');
      setError(null);
    } catch (e) {
      toast.error(`❌ Error al autorizar: ${e.message}`, {
        toastId: `error-autorizar-${permisoSeleccionado.id}`,
        position: 'top-right',
      });
    } finally {
      setProcesandoAccion(false);
    }
  };

  const manejarDenegar = async () => {
    if (!permisoSeleccionado) return;
    setProcesandoAccion(true);

    try {
      await denegarPermiso(permisoSeleccionado.id, observacion, cargaVacaciones);
      toast.success('🚫 Permiso denegado correctamente', {
        toastId: `denegado-${permisoSeleccionado.id}`,
        position: 'top-right',
      });

      // Refrescar lista y volver
      const data = await obtenerCorreosUnificadosDirector();
      setResultados(data.resultados);
      setCorreoSeleccionado(null);
      setPermisoSeleccionado(null);
      setAdjuntoSeleccionado(null);
      setObservacion('');
      setError(null);
    } catch (e) {
      toast.error(`⚠️ Error al denegar: ${e.message}`, {
        toastId: `error-denegar-${permisoSeleccionado.id}`,
        position: 'top-right',
      });
    } finally {
      setProcesandoAccion(false);
    }
  };

  if (correoSeleccionado) {
    const url = adjuntoSeleccionado ? obtenerUrlDocumento(adjuntoSeleccionado.filename) : '';
    const esPDF = url.toLowerCase().endsWith('.pdf');

    return (
      <div className="dir-container">
        <button className="dir-btn-volver" onClick={() => {
          setCorreoSeleccionado(null);
          setPermisoSeleccionado(null);
          setAdjuntoSeleccionado(null);
          setObservacion('');
          setError(null);
        }}>
          ← Volver a la lista
        </button>

        {error && <p className="error-message">{error}</p>}

        <header className="dir-header">
          <h3>{correoSeleccionado.subject}</h3>
          <p><strong>De:</strong> {correoSeleccionado.from}</p>
          <p><strong>Para:</strong> {correoSeleccionado.to}</p>
          <p><strong>Fecha:</strong> {new Date(correoSeleccionado.date).toLocaleString()}</p>
        </header>

        <div className="dir-detalle-top">
          <section className="dir-detalle-izquierda dir-permiso-detalle">
            <h4 className="seccion-titulo">📝 Detalles del Permiso</h4>
            <div className="dir-campo"><strong>Tipo:</strong> {permisoSeleccionado.tipo.nombre} ({permisoSeleccionado.tipo.sub_tipo})</div>
            <div className="dir-campo"><strong>Fecha inicio:</strong> {permisoSeleccionado.fecha_inicio}</div>
            <div className="dir-campo"><strong>Fecha fin:</strong> {permisoSeleccionado.fecha_fin || '-'}</div>
            <div className="campo"><strong>Descripción:</strong><br /><span className="descripcion">{permisoSeleccionado.descripcion}</span></div>
            <div className="campo"><strong>Estado general:</strong> <em>{permisoSeleccionado.estado_general}</em></div>
            <hr />
            <div className="dir-campo">
              <strong>Revisado TTHH:</strong> {permisoSeleccionado.revisado_tthh ? '✅ Sí' : '❌ No'}
            </div>
            {permisoSeleccionado.revisado_tthh && (
              <>
                <div className="dir-campo"><strong>Observación:</strong> {permisoSeleccionado.observacion_tthh || '(sin observación)'}</div>
                <div className="dir-campo"><strong>Fecha de revisión:</strong> {new Date(permisoSeleccionado.fecha_revision_tthh).toLocaleString()}</div>
              </>
            )}
            <hr />
            <h4>Decisión del Director</h4>
            <textarea 
              className="dir-textarea"
              value={observacion}
              onChange={e => setObservacion(e.target.value)}
              placeholder="Ingrese respuesta al presente documento"
              rows={3}
            />
            <div className="checkbox-vacaciones">
              <label>
                <input
                  type="checkbox"
                  checked={cargaVacaciones}
                  onChange={e => setCargaVacaciones(e.target.checked)}
                /> Cargar a vacaciones
              </label>
            </div>
            <div className="dir-acciones">
              <button className="dir-btn-revisar" onClick={manejarAutorizar} disabled={procesandoAccion}>
                Autorizar
              </button>
              <button className="dir-btn-revisar" onClick={manejarDenegar} disabled={procesandoAccion}>
                Denegar
              </button>
            </div>
          </section>

          <section className="dir-detalle-derecha">
            <div className="dir-correo-preview-wrapper">
              <iframe 
                className="dir-correo-preview"
                srcDoc={correoSeleccionado.html || correoSeleccionado.text || '<p>(sin contenido)</p>'}
                title="Correo Detallado"
              />
            </div>
          </section>
        </div>

        <section className="dir-adjuntos-lista">
          <h4 className="dir-seccion-titulo">Adjuntos:</h4>
          {correoSeleccionado.attachments?.length > 0 ? (
            <ul>
              {correoSeleccionado.attachments.map((adj, i) => (
                <li key={i}>
                  {adj.filename} {adj.size ? `- ${adj.size}` : ''}
                  <br />
                  <button onClick={() => setAdjuntoSeleccionado(adj)}>Ver adjunto</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>(sin adjuntos)</p>
          )}

          {adjuntoSeleccionado && (
            <div className="dir-adjunto-preview">
              {esPDF ? (
                <iframe src={url} width="100%" height="700px" title="Evidencia PDF" />
              ) : (
                <img src={url} alt="Evidencia" />
              )}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="dir-solicitudes-container">
      <ToastContainer position="top-right" autoClose={3500} />
      <h2>Solicitudes para aprobación o rechazo</h2>
      {cargando ? (
        <Box>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={60} style={{ marginBottom: '10px' }} />
          ))}
        </Box>
      ) : (
        <table className="dir-solicitudes-tabla">
          <thead>
            <tr>
              <th>Asunto</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>No hay correos para mostrar.</td>
              </tr>
            ) : (
              resultados.map(({ correo }) => (
                <tr key={correo.id}>
                  <td>{correo.subject}</td>
                  <td>{new Date(correo.date).toLocaleString()}</td>
                  <td>
                    <button
                      className="dir-btn-ver"
                      onClick={() => {
                        setCorreoSeleccionado(correo);
                        const item = resultados.find(r => r.correo.id === correo.id);
                        setPermisoSeleccionado(item ? item.permiso : null);
                        setAdjuntoSeleccionado(null);
                        setObservacion('');
                        setError(null);
                      }}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      <LoadingModal visible={procesandoAccion || cargando} />
    </div>
  );
}

export default SolicitudesDirector;
