const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { AppDataSource } = require('./config/database');        
const { crearUsuarioInicial } = require('./config/setup');      

const setupSwagger = require('./swagger'); // ruta relativa correcta

const app = express();

app.use(cors());
app.use(express.json());

// Aquí monta swagger antes que tus rutas para que esté disponible
setupSwagger(app);

const startServer = () => {
  const authRoutes = require('./routes/auth.routes');
  app.use('/api', authRoutes);

  const usuarioRoutes = require('./routes/usuario.routes');
  app.use('/api', usuarioRoutes);

  const tipoPermisoRoutes = require('./routes/tipoPermiso.routes');
  app.use('/api/tipos-permiso', tipoPermisoRoutes);

  const permisoRoutes = require('./routes/permiso.routes');
  app.use('/api/permisos', permisoRoutes);

  const dashboardRoutes =  require('./routes/informes.routes');
  app.use("/api/dashboard", dashboardRoutes);

  const mailRoutes = require('./routes/mail.routes');
  app.use('/api/correos', mailRoutes);

  app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    console.log(`🌐 URL base: http://localhost:${PORT}`);
    console.log(`📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
  });
};

AppDataSource.initialize()
  .then(async () => {
    console.log('🔗 Conexión a la base de datos establecida');
    await crearUsuarioInicial();
    startServer();
  })
  .catch((error) => {
    console.error('❌ Error al conectar con la base de datos:', error);
  });
