import React, { useState } from 'react';
import Dashboard from '../components/Usuarios/Dashboard.jsx';
import RegistroSolicitudes from '../components/TTHH/RegistroSolicitudes';
import '../styles/TTHHPage.css';

function TTHHPage() {
  const [view, setView] = useState('dashboard');

  return (
    <div className="tthh-container">
      <h1>Panel Talento Humano (TTHH)</h1>

      <nav className="tthh-nav">
        <button
          className={view === 'dashboard' ? 'active' : ''}
          onClick={() => setView('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={view === 'registroSolicitudes' ? 'active' : ''}
          onClick={() => setView('registroSolicitudes')}
        >
          Registro Solicitudes
        </button>
       
      </nav>

      <section className="tthh-section">
        {view === 'dashboard' && <Dashboard />}
        {view === 'registroSolicitudes' && <RegistroSolicitudes />}
      </section>
    </div>
  );
}

export default TTHHPage;
