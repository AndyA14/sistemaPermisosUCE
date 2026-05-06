import React, { useEffect, useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';
import { toast } from 'react-toastify';

// Importaciones locales
import LoadingModal from '../../components/LoadingModal.jsx';
import {
  obtenerTopDocentes,
  obtenerPermisosPorTipo,
  obtenerPermisosPorMes,
  obtenerUltimosPermisos,
} from '../../services/api.js';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a29bfe', '#55efc4', '#ff6b81', '#e17055'];
const COLORS_STATES = { autorizado: '#2ecc71', denegado: '#e74c3c', pendiente: '#f1c40f' };

const DashboardTTHH = () => {
  const [topUsuarios, setTopUsuarios] = useState([]);
  const [permisosPorTipo, setPermisosPorTipo] = useState([]);
  const [permisosPorMes, setPermisosPorMes] = useState([]);
  const [ultimosPermisos, setUltimosPermisos] = useState([]);
  const [subtiposData, setSubtiposData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);

  // Nuevos estados para gráficos pedidos
  const [duracionPromedioTipoSubtipo, setDuracionPromedioTipoSubtipo] = useState([]);
  const [conteoEstadoTipo, setConteoEstadoTipo] = useState([]);
  const [permisosPorDuracion, setPermisosPorDuracion] = useState([]);
  const [conteoDiarioEstado, setConteoDiarioEstado] = useState([]);
  const [vacacionesPorTipo, setVacacionesPorTipo] = useState([]);

  const [loading, setLoading] = useState(false);
  const toastId = useRef(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [top, tipos, meses, ultimos] = await Promise.all([
          obtenerTopDocentes(),
          obtenerPermisosPorTipo(),
          obtenerPermisosPorMes(),
          obtenerUltimosPermisos(),
        ]);

        // Formatear top usuarios
        setTopUsuarios(top.map(d => ({
          usuario_id: `${d?.nombres || 'Usuario'} ${d?.apellidos || 'Desconocido'}`,
          total: Number(d?.total || 0),
        })));

        // Permisos por tipo
        setPermisosPorTipo(tipos.map(t => ({
          tipo: t?.tipo || 'Desconocido',
          total: Number(t?.total || 0),
        })));

        // Permisos por mes y estado
        const agrupados = meses.reduce((acc, { mes, estado, total }) => {
          const mesValidado = mes || 'Desconocido';
          if (!acc[mesValidado]) acc[mesValidado] = { mes: mesValidado, autorizado: 0, denegado: 0 };
          if (estado === 'autorizado' || estado === 'denegado') {
            acc[mesValidado][estado] = Number(total || 0);
          }
          return acc;
        }, {});
        setPermisosPorMes(Object.values(agrupados));

        // Procesar permisos recientes para todos los gráficos nuevos
        const permisosProcesados = ultimos.map(p => {
          // Protección contra fechas inválidas
          const fechaInicio = p?.fecha_inicio ? new Date(p.fecha_inicio) : new Date();
          const fechaFin = p?.fecha_fin ? new Date(p.fecha_fin) : new Date();
          const dias = ((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) + 1;
          
          return {
            ...p,
            fecha: p?.fecha_solicitud || new Date().toISOString(),
            // 🚨 SOLUCIÓN AL ERROR CRÍTICO AQUÍ: Optional Chaining (?.) 🚨
            usuario: p?.usuario ? `${p.usuario.nombres || ''} ${p.usuario.apellidos || ''}`.trim() : 'Usuario Desconocido',
            tipo: p?.tipo?.nombre || 'Desconocido',
            subtipo: p?.tipo?.sub_tipo || 'Otro',
            estado: p?.estado_general || 'pendiente',
            dias: Number(dias.toFixed(1)) || 0,
            activo: p?.activo || false,
            carga_vacaciones: p?.carga_vacaciones || false,
          };
        });
        setUltimosPermisos(permisosProcesados);

        // Subtipos
        const subtipoMap = {};
        permisosProcesados.forEach(p => {
          if (!subtipoMap[p.subtipo]) subtipoMap[p.subtipo] = 0;
          subtipoMap[p.subtipo]++;
        });
        setSubtiposData(Object.entries(subtipoMap).map(([subtipo, total]) => ({ subtipo, total })));

        // Línea evolución mensual por estado
        const lineMap = {};
        permisosProcesados.forEach(p => {
          const mes = new Date(p.fecha).toLocaleDateString('es-EC', { year: 'numeric', month: 'short' });
          if (!lineMap[mes]) lineMap[mes] = { mes, autorizado: 0, denegado: 0, pendiente: 0 };
          lineMap[mes][p.estado] = (lineMap[mes][p.estado] || 0) + 1;
        });
        setLineChartData(Object.values(lineMap));

        // 1. Duración promedio permisos por tipo y subtipo
        const duracionMap = {};
        permisosProcesados.forEach(({ tipo, subtipo, dias }) => {
          const key = `${tipo}___${subtipo}`;
          if (!duracionMap[key]) duracionMap[key] = { tipo, subtipo, totalDias: 0, count: 0 };
          duracionMap[key].totalDias += dias;
          duracionMap[key].count++;
        });
        const duracionPromedio = Object.values(duracionMap).map(({ tipo, subtipo, totalDias, count }) => ({
          tipo,
          subtipo,
          duracionPromedio: +(totalDias / count).toFixed(2),
        }));
        setDuracionPromedioTipoSubtipo(duracionPromedio);

        // 2. Conteo permisos por estado y tipo (barras apiladas)
        const estadoTipoMap = {};
        permisosProcesados.forEach(({ tipo, estado }) => {
          if (!estadoTipoMap[tipo]) estadoTipoMap[tipo] = { tipo, autorizado: 0, denegado: 0, pendiente: 0 };
          estadoTipoMap[tipo][estado] = (estadoTipoMap[tipo][estado] || 0) + 1;
        });
        setConteoEstadoTipo(Object.values(estadoTipoMap));

        // 3. Permisos activos vs no activos por tipo
        const activosMap = {};
        permisosProcesados.forEach(({ tipo, activo }) => {
          if (!activosMap[tipo]) activosMap[tipo] = { tipo, activos: 0, inactivos: 0 };
          if (activo) activosMap[tipo].activos++;
          else activosMap[tipo].inactivos++;
        });

        // 4. Cantidad de permisos por usuario (ranking)
        const usuarioMap = {};
        permisosProcesados.forEach(({ usuario }) => {
          if (!usuarioMap[usuario]) usuarioMap[usuario] = 0;
          usuarioMap[usuario]++;
        });
        const rankingUsuarios = Object.entries(usuarioMap)
          .map(([usuario, total]) => ({ usuario, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10); // Top 10
        setTopUsuarios(rankingUsuarios);

        // 5. Distribución de permisos por rango de duración
        const duracionCategorias = {
          '1 día': 0,
          '2-3 días': 0,
          '4-7 días': 0,
          '>7 días': 0,
        };
        permisosProcesados.forEach(({ dias }) => {
          if (dias <= 1) duracionCategorias['1 día']++;
          else if (dias <= 3) duracionCategorias['2-3 días']++;
          else if (dias <= 7) duracionCategorias['4-7 días']++;
          else duracionCategorias['>7 días']++;
        });
        setPermisosPorDuracion(Object.entries(duracionCategorias).map(([categoria, total]) => ({ categoria, total })));

        // 6. Cantidad de permisos por día (fecha_solicitud) con estado (líneas apiladas)
        const diarioEstadoMap = {};
        permisosProcesados.forEach(({ fecha, estado }) => {
          if (!diarioEstadoMap[fecha]) diarioEstadoMap[fecha] = { fecha, autorizado: 0, denegado: 0, pendiente: 0 };
          diarioEstadoMap[fecha][estado] = (diarioEstadoMap[fecha][estado] || 0) + 1;
        });
        setConteoDiarioEstado(Object.values(diarioEstadoMap).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)));

        // 7. Carga de vacaciones por tipo y subtipo
        const vacacionesMap = {};
        permisosProcesados.forEach(({ tipo, subtipo, carga_vacaciones }) => {
          const key = `${tipo} - ${subtipo}`;
          if (!vacacionesMap[key]) {
            vacacionesMap[key] = { nombre: key, conCarga: 0, sinCarga: 0 };
          }
          if (carga_vacaciones) {
            vacacionesMap[key].conCarga++;
          } else {
            vacacionesMap[key].sinCarga++;
          }
        });
        setVacacionesPorTipo(Object.values(vacacionesMap));

        // Toast éxito
        if (!toast.isActive(toastId.current)) {
          toastId.current = toast.success('Datos del dashboard cargados correctamente');
        }
      } catch (error) {
        console.error('Error al cargar dashboard TTHH:', error);
        toast.error('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <>
      
      {loading && <LoadingModal visible={true} />}

      <Box
        sx={{
          padding: { xs: 2, md: 4 },
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-text)',
          minHeight: '100vh',
        }}
      >
        <Typography 
          variant="h4" 
          component="h2" 
          align="center" 
          gutterBottom 
          sx={{ fontWeight: 'bold', mb: 4 }}
        >
          📊 Dashboard
        </Typography>

        <Box
          component="section"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 4,
            mt: 4,
          }}
        >
          {/* 1. Duración promedio permisos por tipo y subtipo */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'var(--card-bg)', border: '1px solid var(--color-border)' }}>
            <Typography variant="h6" align="center" gutterBottom sx={{ mb: 3 }}>
              Duración Promedio de Permisos por Tipo y Subtipo
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={duracionPromedioTipoSubtipo}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="tipo"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis label={{ value: 'Días Promedio', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {Array.from(new Set(duracionPromedioTipoSubtipo.map(d => d.subtipo))).map((subtipo, idx) => (
                  <Bar
                    key={subtipo}
                    dataKey={(d) => (d.subtipo === subtipo ? d.duracionPromedio : 0)}
                    name={subtipo}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* 2. Conteo permisos por estado y tipo (Barras apiladas) */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'var(--card-bg)', border: '1px solid var(--color-border)' }}>
            <Typography variant="h6" align="center" gutterBottom sx={{ mb: 3 }}>
              Conteo de Permisos por Estado y Tipo
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={conteoEstadoTipo}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="tipo"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {['autorizado', 'denegado', 'pendiente'].map((estado) => (
                  <Bar
                    key={estado}
                    dataKey={estado}
                    stackId="a"
                    fill={COLORS_STATES[estado]}
                    name={estado.charAt(0).toUpperCase() + estado.slice(1)}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* 4. Cantidad de permisos por usuario (Top 10) */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'var(--card-bg)', border: '1px solid var(--color-border)' }}>
            <Typography variant="h6" align="center" gutterBottom sx={{ mb: 3 }}>
              Top 10 Usuarios con Más Permisos Solicitados
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={topUsuarios}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="usuario"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="Permisos" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* 5. Distribución permisos por rango de duración (Bar) */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'var(--card-bg)', border: '1px solid var(--color-border)' }}>
            <Typography variant="h6" align="center" gutterBottom sx={{ mb: 3 }}>
              Distribución de Permisos por Rango de Duración
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={permisosPorDuracion}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="categoria"
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#a29bfe" name="Permisos" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* 6. Cantidad de permisos por día con estado (LineStacked) */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'var(--card-bg)', border: '1px solid var(--color-border)' }}>
            <Typography variant="h6" align="center" gutterBottom sx={{ mb: 3 }}>
              Cantidad de Permisos por Día (Segmentado por Estado)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={conteoDiarioEstado}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="fecha"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {['autorizado', 'denegado', 'pendiente'].map(estado => (
                  <Line
                    key={estado}
                    type="monotone"
                    dataKey={estado}
                    stackId="a"
                    stroke={COLORS_STATES[estado]}
                    name={estado.charAt(0).toUpperCase() + estado.slice(1)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
          
          {/* 7. Carga de Vacaciones por Tipo de Permiso (barras apiladas) */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: 'var(--card-bg)', border: '1px solid var(--color-border)' }}>
            <Typography variant="h6" align="center" gutterBottom sx={{ mb: 3 }}>
              Carga de Vacaciones por Tipo de Permiso
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={vacacionesPorTipo}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="nombre"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="conCarga" stackId="a" fill="#00b894" name="Con Carga" />
                <Bar dataKey="sinCarga" stackId="a" fill="#d63031" name="Sin Carga" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>

        </Box>
      </Box>
    </>
  );
};

export default DashboardTTHH;