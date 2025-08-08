import React from 'react';
import { obtenerUrlDocumento } from '../../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

const VistaEvidencia = () => {
  const { nombreArchivo } = useParams();
  const navigate = useNavigate(); // 👈 hook para volver atrás

  if (!nombreArchivo) return <p>No se ha proporcionado ninguna evidencia.</p>;

  const url = obtenerUrlDocumento(nombreArchivo);
  const esPDF = url.toLowerCase().endsWith('.pdf');

  return (
    <div style={{ textAlign: 'center' }}>
      {/* 🔙 Botón regresar */}
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '1rem',
          padding: '0.6rem 1.2rem',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        ← Regresar
      </button>
        <br />
      {esPDF ? (
        <iframe
          src={url}
          width="100%"
          height="700px"
          title="Evidencia PDF"
          style={{ border: '1px solid #ccc' }}
        />
      ) : (
        <img
          src={url}
          alt="Evidencia"
          style={{ maxWidth: '100%', maxHeight: '90%', border: '1px solid #ccc' }}
        />
      )}
    </div>
  );
};

export default VistaEvidencia;
