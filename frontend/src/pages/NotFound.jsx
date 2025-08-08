// src/pages/NotFound.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.code}>404</h1>
      <h2 style={styles.title}>Página no encontrada</h2>
      <p style={styles.description}>
        La ruta que estás intentando acceder no existe o ha sido movida.
      </p>
      <Link to="/" style={styles.link}>Volver al inicio</Link>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#f4f6f8',
    textAlign: 'center',
    padding: '1rem',
  },
  code: {
    fontSize: '6rem',
    color: '#003366',
    margin: 0,
  },
  title: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  description: {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '2rem',
  },
  link: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#003366',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
  },
};

export default NotFound;
