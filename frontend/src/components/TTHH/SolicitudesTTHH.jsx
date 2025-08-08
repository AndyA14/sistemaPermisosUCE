import React, { useEffect, useState } from 'react';
import { obtenerCorreosUnificadosTTHH, obtenerUrlDocumento, revisarPermisoPorTTHH } from '../../services/api';
import { Skeleton } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import LoadingModal from '../LoadingModal';
import '../../styles/SolicitudesTTHH.css';

function SolicitudesTTHH() {
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoAccion, setProcesandoAccion] = useState(false);
  const [error, setError] = useState(null);

  const [correoSeleccionado, setCorreoSeleccionado] = useState(null);
  const [permisoSeleccionado, setPermisoSeleccionado] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [adjuntoSeleccionado, setAdjuntoSeleccionado] = useState(null);

  const fetchCorreos = async () => {
    setCargando(true);
    try {
      const data = await obtenerCorreosUnificadosTTHH();
      setResultados(data.resultados);
      toast.success('Permisos cargados correctamente', {
        toastId: 'permisos-cargados',
      });
    } catch (e) {
      toast.error(`Error al cargar solicitudes: ${e.message}`, {
        toastId: 'error-cargar-solicitudes',
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchCorreos();
  }, []);

  const manejarRevision = async () => {
    if (!permisoSeleccionado) return;

    setProcesandoAccion(true);

    try {
      await revisarPermisoPorTTHH(permisoSeleccionado.id, { observacion });
      // Espera breve para que el toast sea visible antes del cambio de estado
      setTimeout(async () => {
        setCorreoSeleccionado(null);
        setPermisoSeleccionado(null);
        setAdjuntoSeleccionado(null);
        setObservacion('');
        await fetchCorreos(); // recarga la lista actualizada
      }, 1000); // 1 segundo de espera (ajustable)
    } catch (e) {
      console.log(`Error al revisar permiso: ${e.message}`)
    } finally {
      setProcesandoAccion(false);
    }
  };


  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  if (correoSeleccionado) {
    const url = adjuntoSeleccionado ? obtenerUrlDocumento(adjuntoSeleccionado.filename) : '';
    const esPDF = url.toLowerCase().endsWith('.pdf');

  return (
    <div className="detalle-container">
      <button
        onClick={() => {
          setCorreoSeleccionado(null);
          setPermisoSeleccionado(null);
          setAdjuntoSeleccionado(null);
          setObservacion('');
          setError(null);
        }}
        className="btn-volver"
      >
        ← Volver a la lista
      </button>

      {/* ENCABEZADO */}
      <header className="detalle-header">
        <h3 className="detalle-titulo">Solicitud de permiso de {correoSeleccionado.from}</h3>
        <p><strong>De:</strong> {correoSeleccionado.from}</p>
        <p><strong>Para:</strong> {correoSeleccionado.to}</p>
        <p><strong>Fecha:</strong> {new Date(correoSeleccionado.date).toLocaleString()}</p>
      </header>

      {/* CONTENIDO PRINCIPAL: PERMISO E IFRAME */}
      <div className="detalle-top">
        {/* Columna izquierda: detalles y revisión */}
        <section className="detalle-izquierda permiso-detalle">
          <h4 className="seccion-titulo">📝 Detalles del Permiso</h4>

          <div className="campo">
            <strong>Tipo:</strong> {permisoSeleccionado.tipo.nombre} ({permisoSeleccionado.tipo.sub_tipo})
          </div>
          <div className="campo">
            <strong>Fecha inicio:</strong> {permisoSeleccionado.fecha_inicio}
          </div>
          <div className="campo">
            <strong>Fecha fin:</strong> {permisoSeleccionado.fecha_fin || '-'}
          </div>
          <div className="campo">
            <strong>Descripción:</strong><br />
            <span className="descripcion">{permisoSeleccionado.descripcion}</span>
          </div>
          <div className="campo">
            <strong>Estado general:</strong> <em>{permisoSeleccionado.estado_general}</em>
          </div>
          <hr />
          <div className="campo">
            <strong>Revisado TTHH:</strong> {permisoSeleccionado.revisado_tthh ? '✅ Sí' : '❌ No'}
          </div>
          <div className="campo">
            <strong>Observación TTHH:</strong><br />
            <span className="observacion">
              {permisoSeleccionado.observacion_tthh || '(sin observación)'}
            </span>
          </div>
          <hr />
          <div className="campo">
            <label htmlFor="observacionTthh"><strong>Agregar observación:</strong></label>
            <br />
            <textarea
              id="observacionTthh"
              value={observacion}
              onChange={e => setObservacion(e.target.value)}
              placeholder="Ingrese observación de Talento Humano (opcional)"
              rows={3}
              disabled={permisoSeleccionado.revisado_tthh}
            />
          </div>

          <button
            className="btn-revisar"
            onClick={manejarRevision}
            disabled={procesandoAccion || permisoSeleccionado.revisado_tthh}
          >
            Confirmar revisión
          </button>
        </section>
        
        {/* Columna derecha: previsualización del correo */}
        <section className="detalle-derecha">
          <div className="correo-preview-wrapper">
            <iframe
              className="correo-preview"
              srcDoc={correoSeleccionado.html || correoSeleccionado.text || '<p>(sin contenido)</p>'}
              title="Correo Detallado"
            />
          </div>
        </section>
      </div>

      {/* ADJUNTOS */}
      <section className="adjuntos-lista">
        <h4>Adjuntos:</h4>
        {correoSeleccionado.attachments?.length > 0 ? (
          <ul>
            {correoSeleccionado.attachments.map((adj, i) => (
              <li key={i}>
                {adj.filename} - {adj.size || ''}
                <br />
                <button onClick={() => setAdjuntoSeleccionado(adj)}>Ver adjunto</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>(sin adjuntos)</p>
        )}

        {adjuntoSeleccionado && (
          <div className="adjunto-preview">
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
    <div className="solicitudes-container">
      <h2>Solicitudes para Revisión TTHH</h2>

      {cargando ? (
        <div>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <Skeleton variant="rectangular" height={40} animation="wave" />
            </div>
          ))}
        </div>
      ) : (
        <table className="solicitudes-tabla">
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
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  No hay correos para mostrar.
                </td>
              </tr>
            ) : (
              resultados.map(({ correo }) => (
                <tr key={correo.id}>
                  <td>{correo.subject}</td>
                  <td>{new Date(correo.date).toLocaleString()}</td>
                  <td>
                    <button
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

      {/* Toast y modal de carga */}
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
      <LoadingModal visible={procesandoAccion || cargando} />
    </div>
  );
}

export default SolicitudesTTHH;
