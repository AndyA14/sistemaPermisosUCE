import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Paper 
} from '@mui/material';
import { DashboardOutlined, AssignmentOutlined } from '@mui/icons-material';

// Tus importaciones de componentes
import Dashboard from '../components/Usuarios/Dashboard.jsx';
import RegistroSolicitudes from '../components/TTHH/RegistroSolicitudes';

function TTHHPage() {
  const [view, setView] = useState('dashboard');

  const handleChange = (event, newValue) => {
    setView(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', py: 4 }}>
      <Container maxWidth="xl">
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ color: 'var(--color-text)', fontWeight: 'bold', mb: 4 }}
        >
          Panel Talento Humano (TTHH)
        </Typography>

        {/* Navegación con Tabs de Material UI */}
        <Paper elevation={1} sx={{ mb: 4, backgroundColor: 'var(--card-bg)' }}>
          <Tabs
            value={view}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                color: 'var(--color-text-secondary)',
                minHeight: '60px',
              },
              '& .Mui-selected': {
                color: 'var(--color-link) !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'var(--color-link)',
                height: 3,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
              }
            }}
          >
            <Tab 
              icon={<DashboardOutlined />} 
              iconPosition="start" 
              label="Dashboard" 
              value="dashboard" 
            />
            <Tab 
              icon={<AssignmentOutlined />} 
              iconPosition="start" 
              label="Registro Solicitudes" 
              value="registroSolicitudes" 
            />
          </Tabs>
        </Paper>

        {/* Contenido Dinámico */}
        <Box component="section" sx={{ animation: 'fadeIn 0.5s ease' }}>
          {view === 'dashboard' && <Dashboard />}
          {view === 'registroSolicitudes' && <RegistroSolicitudes />}
        </Box>
      </Container>
    </Box>
  );
}

export default TTHHPage;