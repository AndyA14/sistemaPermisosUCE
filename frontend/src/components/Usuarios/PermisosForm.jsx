import React, { useState, useEffect, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  crearPermiso,
  obtenerTiposPermiso,
  obtenerPerfil
} from '../../services/api';

import CartaAtraso from '../PlantillasCartas/CartaAtraso';
import CartaFalta from '../PlantillasCartas/CartaFalta';
import CartaSinTimbrar from '../PlantillasCartas/CartaSinTimbrar';
import LoadingModal from '../LoadingModal'; // Asegúrate que la ruta sea correcta
import '../../styles/PermisosForm.css';

import { toast, ToastContainer } from 'react-toastify';
import CartaOtros from '../PlantillasCartas/CartaOtros';

function PermisosForm() {
  const [tipos, setTipos] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [form, setForm] = useState({});
  const [archivo, setArchivo] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ref para controlar que el toast de éxito no se repita
  const toastMostrado = useRef(false);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [dataTipos, dataPerfil] = await Promise.all([
          obtenerTiposPermiso(),
          obtenerPerfil()
        ]);

        // Procesar tipos
        const agrupados = dataTipos.reduce((acc, item) => {
          const existente = acc.find((t) => t.nombre === item.nombre);
          const subtipo = {
            id: item.id,
            value: item.sub_tipo?.toLowerCase().replace(/\s/g, '_'),
            label: item.sub_tipo
          };
          if (existente) {
            existente.sub_tipos.push(subtipo);
          } else {
            acc.push({
              nombre: item.nombre,
              sub_tipos: [subtipo]
            });
          }
          return acc;
        }, []);
        setTipos(agrupados);

        setPerfil(dataPerfil);

        // Mostrar toast éxito solo una vez
        if (!toastMostrado.current) {
          toast.success('Tipos de permiso y perfil cargados correctamente.');
          toastMostrado.current = true;
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        if (!toastMostrado.current) {
          toast.error('Error al cargar datos iniciales. Intenta nuevamente.');
          toastMostrado.current = true;
        }
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Prepara los datos específicos del permiso según tipo y subtipo
  const getPermisoData = () => {
    if (!tipoSeleccionado) return {};

    const subtipoSeleccionado = tipoSeleccionado.sub_tipos.find(
      (st) => st.value === form.subtipo
    );

    let permisoData = {
      tipo_id: subtipoSeleccionado?.id,
      descripcion: form.descripcion || '',
    };

    if (tipoSeleccionado.nombre === 'Falta') {
      permisoData.fecha_inicio = form.fecha_inicio || null;
      permisoData.fecha_fin = form.fecha_fin || null;
      permisoData.subtipo = form.subtipo;
    } else {
      permisoData.fecha_inicio = form.fecha || null;
      permisoData.fecha_fin = form.fecha || null;
    }

    if (tipoSeleccionado.nombre === 'Atraso') {
      permisoData.subtipo = form.subtipo;
      permisoData.hora_inicio = form.hora_inicio || '00:00:00';
    }

    if (tipoSeleccionado.nombre === 'Sin Timbrar') {
      permisoData.no_entrada = !!form.no_entrada;
      permisoData.no_salida = !!form.no_salida;

      permisoData.hora_inicio = form.no_entrada
        ? form.hora_inicio || '00:00:00'
        : '00:00:00';

      permisoData.hora_fin = form.no_salida
        ? form.hora_fin || '00:00:00'
        : '00:00:00';
    }

    if (tipoSeleccionado.nombre === 'Otros') {
      permisoData.fecha_inicio = form.fecha || null;
      permisoData.fecha_fin = form.fecha || null;
      permisoData.subtipo = form.subtipo || '';
    }

    return permisoData;
  };


  // Genera el HTML de la carta para el correo usando renderToStaticMarkup
  const generarHtmlCarta = () => {
    let cartaComponente = null;

    if (tipoSeleccionado?.nombre === 'Atraso') {
      cartaComponente = (
        <CartaAtraso perfil={perfil} form={form} tipoSeleccionado={tipoSeleccionado} />
      );
    } else if (tipoSeleccionado?.nombre === 'Falta') {
      cartaComponente = (
        <CartaFalta perfil={perfil} form={form} tipoSeleccionado={tipoSeleccionado} />
      );
    } else if (tipoSeleccionado?.nombre === 'Sin Timbrar') {
      cartaComponente = (
        <CartaSinTimbrar perfil={perfil} form={form} tipoSeleccionado={tipoSeleccionado} />
      );
    } else if (tipoSeleccionado?.nombre === 'Otros') {
      cartaComponente = (
        <CartaOtros perfil={perfil} form={form} tipoSeleccionado={tipoSeleccionado} />
      );
    }

    if (!cartaComponente) return '';

    const estilosCarta = `
      <style>
        body {
          font-family: "Times New Roman", Times, serif;
          color: #2c3e50;
          background-color: #ffffff;
          margin: 0;           
          padding: 2cm;
          box-sizing: border-box;
        }
        .modal-contenido {
          max-width: 700px;
          margin: 0 auto;
          padding: 40px;
          box-sizing: border-box;
          line-height: 1.6;
          background-color: #ffffff;
        }
        .modal-contenido1 {
          color: #2c3e50;
        }
        .logo-institucion {
          display: block;
          max-width: 120px;
          margin: 0 auto 1.5rem auto;
        }
        .carta-encabezado {
          font-family: "Times New Roman", Times, serif;
          font-weight: 600;
          color: #2c3e50;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          text-align: center;
          margin-bottom: 2rem;
        }
        .carta-encabezado p {
          margin: 0.15rem 0;
        }
        .fecha-derecha {
          text-align: right;
          margin-bottom: 1.8rem;
          font-size: 1rem;
          font-weight: 500;
          color: #2c3e50;
        }
        .destinatario-derecha {
          text-align: left;
          margin-bottom: 1.8rem;
          font-size: 1rem;
          line-height: 1.4;
          color: #2c3e50;
        }
        .destinatario-derecha p {
          margin: 0.12rem 0;
        }
        .saludo {
          font-weight: 600;
          margin-bottom: 1.5rem;
          text-align: left;
          color: #2c3e50;
        }
        .contenido-justificado {
          text-align: justify;
          margin: 0.9rem 0;
          font-size: 1rem;
          word-break: break-word;
          color: #2c3e50;
        }

        .agradecimiento-derecha {
          text-align: left;
          margin-top: 2rem;
          font-style: italic;
          font-size: 1rem;
          color: #2c3e50;
        }

        .firma-derecha {
          text-align: left;
          margin-top: 3rem;
          font-size: 1rem;
          font-weight: 400;
          color: #2c3e50;
        }

        .firma-derecha p {
          margin: 3px 0;
          font-size: 1rem;
        }

        .firma-derecha strong {
          font-size: 1.1rem;
          color: #2c3e50;
        }
      </style>
    `;

    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          ${estilosCarta}
        </head>
        <body>
          <div class="pagina-a4">
            ${renderToStaticMarkup(cartaComponente)}
          </div>
        </body>
      </html>
    `;
  };

  // Envio del formulario, envia permiso y archivo (si existe) junto con el HTML para el correo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const permisoData = getPermisoData();
      const htmlCarta = generarHtmlCarta();

      await crearPermiso({
        permisoData,
        archivo,
        htmlCorreo: htmlCarta,
      });

      // Mostrar toast solo una vez
      if (!toastMostrado.current) {
        toast.success('Permiso creado con éxito.');
        toastMostrado.current = true;
      }

      // Reiniciar formulario
      setTipoSeleccionado(null);
      setForm({});
      setArchivo(null);
    } catch (error) {
      console.error('Error al crear permiso:', error);
      toast.error('Error al crear permiso, revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="permiso-container">
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

      {loading && <LoadingModal visible={true} />}
      <form className="permiso-form" onSubmit={handleSubmit}>
        <h2>Solicitar Permiso</h2>

        <label>Tipo de permiso:</label>
        <select
          name="tipo"
          value={tipoSeleccionado?.nombre || ''}
          onChange={(e) => {
            const seleccionado = tipos.find((t) => t.nombre === e.target.value);
            setTipoSeleccionado(seleccionado || null);
            setForm({});
            setArchivo(null);
            toastMostrado.current = false; // Reinicia el control toast cuando se cambia tipo
          }}
          required
        >
          <option value="">Seleccione...</option>
          {tipos.map((t) => (
            <option key={t.nombre} value={t.nombre}>
              {t.nombre}
            </option>
          ))}
        </select>

        {tipoSeleccionado?.sub_tipos?.length > 0 && (
          <>
            <label>Subtipo:</label>
            <select
              name="subtipo"
              value={form.subtipo || ''}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione...</option>
              {tipoSeleccionado.sub_tipos.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </>
        )}

        {/* === FALTA con rango de fechas === */}
        {tipoSeleccionado?.nombre === 'Falta' && (
          <>
            <label>Fecha inicio:</label>
            <input
              type="date"
              name="fecha_inicio"
              value={form.fecha_inicio || ''}
              onChange={handleChange}
              required
            />

            <label>Fecha fin:</label>
            <input
              type="date"
              name="fecha_fin"
              value={form.fecha_fin || ''}
              onChange={handleChange}
              required
              min={form.fecha_inicio || undefined} // evita fechas fin antes que inicio
            />

            <label>Descripción / Observación:</label>
            <textarea
              name="descripcion"
              value={form.descripcion || ''}
              onChange={handleChange}
              rows={3}
            />

            {/* Mostrar archivo si es cita médica o reposo médico */}
            {['cita_medica', 'reposo_médico'].includes(form.subtipo) && (
              <>
                <label>Evidencia (PDF, imagen):</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    // Genera string para fecha o rango
                    const formatoFecha = (fechaStr) => {
                      if (!fechaStr) return 'sin_fecha';
                      const date = new Date(fechaStr + 'T00:00:00');
                      return date.toLocaleDateString('es-EC', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      }).replace(/\//g, '-');
                    };

                    const fechaInicioFormateada = formatoFecha(form.fecha_inicio);
                    const fechaFinFormateada = formatoFecha(form.fecha_fin);

                    const fechaRango = fechaInicioFormateada === fechaFinFormateada
                      ? fechaInicioFormateada
                      : `${fechaInicioFormateada}_a_${fechaFinFormateada}`;

                    const extension = file.name.split('.').pop();

                    const limpiarTexto = (texto) =>
                      texto
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/ñ/gi, 'n')
                        .trim()
                        .split(/\s+/)
                        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
                        .join('_');

                    const nombres = perfil?.nombres ? limpiarTexto(perfil.nombres) : 'Nombre';
                    const apellidos = perfil?.apellidos ? limpiarTexto(perfil.apellidos) : 'Apellido';
                    const asunto = form.subtipo?.replace(/\s+/g, '_').toLowerCase() || 'asunto';
                    const timestamp = Date.now();
                    const nombreArchivo = `${apellidos}_${nombres}_${fechaRango}_${timestamp}_${asunto}.${extension}`;
                    const archivoRenombrado = new File([file], nombreArchivo, { type: file.type });

                    setArchivo(archivoRenombrado);
                  }}
                />
                <small>
                  El archivo será renombrado automáticamente como: <br />
                  <code>Apellidos_Nombres_FechaInicio_a_FechaFin_Asunto.pdf</code>
                </small>
              </>
            )}
          </>
        )}

        {/* === ATRASO === */}
        {tipoSeleccionado?.nombre === 'Atraso' && (
          <>
            <label>Fecha:</label>
            <input
              type="date"
              name="fecha"
              value={form.fecha || ''}
              onChange={handleChange}
              required
            />

            <label>Hora de entrada:</label>
            <input
              type="time"
              name="hora_inicio"
              value={form.hora_inicio || ''}
              onChange={handleChange}
              required
            />

            <label>Motivo:</label>
            <textarea
              name="descripcion"
              value={form.descripcion || ''}
              onChange={handleChange}
              rows={3}
            />

            {/* Adjuntar evidencia si es cita médica */}
            {form.subtipo === 'cita_medica' && (
              <>
                <label>Evidencia (PDF, imagen):</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const extension = file.name.split('.').pop();

                    // Fecha para nombre del archivo
                    const fecha = form.fecha || 'sin_fecha';

                    // Función para limpiar texto
                    const limpiarTexto = (texto) =>
                      texto
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/ñ/gi, 'n')
                        .trim()
                        .split(/\s+/)
                        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
                        .join('_');

                    const nombres = perfil?.nombres ? limpiarTexto(perfil.nombres) : 'Nombre';
                    const apellidos = perfil?.apellidos ? limpiarTexto(perfil.apellidos) : 'Apellido';
                    const asunto = form.subtipo?.replace(/\s+/g, '_').toLowerCase() || 'asunto';

                    const nombreArchivo = `${apellidos}_${nombres}_${fecha}_${asunto}.${extension}`;
                    const archivoRenombrado = new File([file], nombreArchivo, { type: file.type });

                    setArchivo(archivoRenombrado);
                  }}
                />
                <small>
                  El archivo será renombrado automáticamente como: <br />
                  <code>Apellidos_Nombres_Fecha_Asunto.pdf</code>
                </small>
              </>
            )}
          </>
        )}


        {/* === SIN TIMBRAR === */}
        {tipoSeleccionado?.nombre === 'Sin Timbrar' && (
          <>
            <label>Fecha:</label>
            <input
              type="date"
              name="fecha"
              value={form.fecha || ''}
              onChange={handleChange}
              required
            />

            {/* Checkbox Entrada */}
            <label className="checkbox-inline">
              <input
                type="checkbox"
                name="no_entrada"
                checked={!!form.no_entrada}
                onChange={handleChange}
              />
              Falta entrada
            </label>

            {/* Hora entrada si aplica */}
            {form.no_entrada && (
              <>
                <label>Hora de entrada:</label>
                <input
                  type="time"
                  name="hora_inicio"
                  value={form.hora_inicio || ''}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            {/* Checkbox Salida */}
            <label className="checkbox-inline">
              <input
                type="checkbox"
                name="no_salida"
                checked={!!form.no_salida}
                onChange={handleChange}
              />
              Falta salida
            </label>

            {/* Hora salida si aplica */}
            {form.no_salida && (
              <>
                <label>Hora de salida:</label>
                <input
                  type="time"
                  name="hora_fin"
                  value={form.hora_fin || ''}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={form.descripcion || ''}
              onChange={handleChange}
              rows={3}
            />
          </>
        )}

        {tipoSeleccionado?.nombre === 'Otros' && (
          <>
            <label>Fecha:</label>
            <input
              type="date"
              name="fecha"
              value={form.fecha || ''}
              onChange={handleChange}
              required
            />

            <label>Descripción (opcional):</label>
            <textarea
              name="descripcion"
              value={form.descripcion || ''}
              onChange={handleChange}
              rows={3}
            />

            <label>Adjuntar evidencia (opcional):</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                const extension = file.name.split('.').pop();
                const limpiarTexto = (texto) =>
                  texto
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/ñ/gi, 'n')
                    .trim()
                    .split(/\s+/)
                    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
                    .join('_');

                const nombres = perfil?.nombres ? limpiarTexto(perfil.nombres) : 'Nombre';
                const apellidos = perfil?.apellidos ? limpiarTexto(perfil.apellidos) : 'Apellido';
                const fecha = form.fecha || 'sin_fecha';
                const asunto = form.subtipo?.replace(/\s+/g, '_').toLowerCase() || 'otros';
                const nombreArchivo = `${apellidos}_${nombres}_${fecha}_${asunto}.${extension}`;
                const archivoRenombrado = new File([file], nombreArchivo, { type: file.type });

                setArchivo(archivoRenombrado);
              }}
            />
          </>
        )}

        <br />
        <button type="submit" disabled={!tipoSeleccionado}>
          Enviar Solicitud
        </button>
      </form>
      
      <div className="preview-carta">
        {tipoSeleccionado?.nombre === 'Atraso' && (
          <CartaAtraso perfil={perfil} form={form} tipoSeleccionado={tipoSeleccionado} />
        )}
        {tipoSeleccionado?.nombre === 'Falta' && (
          <CartaFalta perfil={perfil} form={form} tipoSeleccionado={tipoSeleccionado} />
        )}
        {tipoSeleccionado?.nombre === 'Sin Timbrar' && (
          <CartaSinTimbrar perfil={perfil} form={form} tipoSeleccionado={tipoSeleccionado} />
        )}
        {tipoSeleccionado?.nombre === 'Otros' && (
          <CartaOtros perfil={perfil} form={form} tipoSeleccionado={tipoSeleccionado} />
        )}
      </div>
    </div>
  );
}

export default PermisosForm;
