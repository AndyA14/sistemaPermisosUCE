# 🎓 Sistema de Gestión de Permisos Docentes - IAI UCE

## 📝 Descripción del Proyecto

Sistema web completo para la gestión de permisos docentes del Instituto Académico de Idiomas de la Universidad Central del Ecuador. Permite a los docentes solicitar permisos, gestionar aprobaciones y generar cartas formales automáticamente.

## ✨ Características Principales

### 🛠️ Funcionalidades del Sistema

- **Gestión de Permisos**: Solicitar diferentes tipos de permisos (Falta, Atraso, Sin Timbrar, Otros)
- **Flujo de Aprobación**: Sistema multi-nivel con validación estructurada (Docente → TTHH → Director)
- **Generación de Cartas**: Creación automática de cartas formales con plantillas personalizadas
- **Gestión de Evidencias**: Almacenamiento y previsualización local de documentos de soporte (PDF, imágenes)
- **Notificaciones por Email**: Sistema de notificaciones automáticas y ligeras
- **Panel de Control**: Dashboard con estadísticas y reportes de solicitudes
- **Gestión de Usuarios**: Administración de roles y permisos
- **Seguridad**: Autenticación JWT y control de acceso basado en roles

### 👥 Roles del Sistema

- **Docentes**: Crear y gestionar sus solicitudes de permiso
- **TTHH (Talento Humano)**: Revisar, validar evidencias y procesar solicitudes iniciales
- **Director**: Aprobación final y emisión de resoluciones
- **DTIC**: Administración del sistema y gestión de usuarios

## 🏗️ Arquitectura Tecnológica

### ⚙️ Backend (Node.js + Express)
- **Framework**: Express.js 5.1.0
- **Base de Datos**: PostgreSQL con TypeORM 0.3.24
- **Autenticación**: JWT con bcrypt
- **Email/Notificaciones**: @sendgrid/mail con integración IMAP (imap-simple)
- **Generación PDF**: PDF-lib 1.17.1
- **Web Scraping**: Puppeteer 24.10.1 para procesamiento y generación de documentos
- **Documentación**: Swagger/OpenAPI con swagger-jsdoc y swagger-ui-express
- **Fechas**: Luxon 3.6.1
- **Archivos**: Multer 2.0.1
- **Compresión**: Archiver 7.0.1

### 💻 Frontend (React + Vite)
- **Framework**: React 19 con Vite
- **Routing**: React Router DOM
- **UI Components**: Material-UI + Emotion
- **Estado**: React Hooks
- **Notificaciones**: React Toastify
- **Gráficos**: Recharts
- **HTTP Client**: Axios
- **Seguridad**: DOMPurify, jwt-decode
- **Iconos**: React Icons
- **Estilos**: CSS custom con variables CSS

### 🐳 Infraestructura
- **Contenerización**: Docker + Docker Compose
- **Base de Datos**: PostgreSQL
- **Servidor Web**: Nginx (producción)
##  Estructura del Proyecto

```
ProyectoPermisosDocentes/
backend/
  src/
    config/          # Configuración de base de datos y setup inicial
    controller/      # Controladores de la API
    entity/          # Entidades de TypeORM
    middleware/      # Middleware de autenticación y validación
    repository/      # Repositorios de datos
    routes/          # Definición de rutas API
    service/         # Lógica de negocio
    utils/           # Utilidades y helpers
    swagger.js       # Configuración de documentación
    index.js         # Punto de entrada del servidor
  uploads/           # Archivos subidos
  .env              # Variables de entorno
  Dockerfile
  package.json

frontend/
  src/
    components/      # Componentes React
      DTIC/         # Componentes de administración
        - GestionUsuarios.jsx
        - ReportesDTIC.jsx
        - TipoPermisoGestion.jsx
      Director/     # Componentes del director
        - SolicitudesDirector.jsx
      TTHH/         # Componentes de Talento Humano
        - RegistroSolicitudes.jsx
        - SolicitudesTTHH.jsx
      Usuarios/     # Componentes de docentes
        - Dashboard.jsx
        - MisSolicitudes.jsx
        - PermisosForm.jsx
        - Evidencia/
          - VistaEvidencia.jsx
      PlantillasCartas/ # Plantillas de cartas
        - CartaAtraso.jsx
        - CartaFalta.jsx
        - CartaSinTimbrar.jsx
        - CartaOtros.jsx
        - CartaLayout.jsx
        - PlantillasVistasC/
      LoadingModal.jsx
      ThemeDemo.jsx
    pages/           # Páginas principales
      - Login.jsx
      - Perfil.jsx
      - ResetPassword.jsx
      - SolicitarReset.jsx
      - TTHHPage.jsx
      - NotFound.jsx
      - Unauthorized.jsx
    routes/          # Configuración de rutas
    services/        # Servicios API
    styles/          # Estilos CSS
    utils/           # Utilidades
    App.jsx          # Componente principal
    main.jsx         # Punto de entrada
  public/           # Archivos públicos
  .env              # Variables de entorno
  .dockerignore
  Dockerfile
  nginx.conf        # Configuración Nginx
  vite.config.js    # Configuración Vite
  package.json

docker-compose.yml    # Configuración de servicios
README.md            # Documentación del proyecto
```

## 🚀 Instalación y Configuración

### 📋 Requisitos Previos

- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- PostgreSQL (para desarrollo local)

### 🐳 Configuración con Docker (Recomendado)

#### 1. Variables de Entorno - Backend

Crear archivo `backend/.env`:

```env
# Configuración del servidor
PORT=3000

# Base de datos
DB_HOST=postgresql
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=example
DB_NAME=iai_sistemapermisos

# JWT
JWT_SECRET=586E3272357538782F413F4428472B4B6250655368566B597033733676397924

# URLs
URL_FRONTEND=[http://192.168.0.179](http://192.168.0.179)

# Cuentas de correo (configurar con datos reales)
EMAIL_ADDRESS=parangaricutimiricuaro465879@gmail.com
EMAIL_PERMISOS=parangaricutimiricuaro465879+permisos@gmail.com
EMAIL_DIRECTOR=parangaricutimiricuaro465879+director@gmail.com
EMAIL_SOPORTE=parangaricutimiricuaro465879+soporte@gmail.com

# Integración API SendGrid
SENDGRID_API_KEY=tu_api_key_aqui
SENDGRID_SENDER=tu_correo_verificado@dominio.com

# Autenticación Gmail (Para Lector IMAP)
EMAIL_PASSWORD=sgvx dfhz svnj rmzj

# Configuración IMAP
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
```

#### 2. Variables de Entorno - Frontend

Crear archivo `frontend/.env`:

```env
VITE_API_URL=http://192.168.0.179:3000/api
```

#### 3. Levantar los Servicios

```bash
# En la raíz del proyecto
docker compose up --build -d
```

#### 4. Acceder a la Aplicación

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000/api
- **Documentación Swagger**: http://localhost:3000/api-docs
- **PostgreSQL**: localhost:5432 (usuario: postgres, password: example)

###  Desarrollo Local

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

##  Tipos de Permisos

### 1. Falta
- **Cita Médica**: Requiere evidencia médica
- **Reposo Médico**: Requiere certificado médico
- **Personal**: Sin evidencia requerida

### 2. Atraso
- **Cita Médica**: Reiere evidencia
- **Problemas de Tránsito**: Sin evidencia
- **Motivos Personales**: Sin evidencia

### 3. Sin Timbrar
- **Falta de Entrada**: Con hora de registro
- **Falta de Salida**: Con hora de registro
- **Ambas**: Con horas de entrada y salida

### 4. Otros
- **Permisos Especiales**: Personalizados
- **Actividades Institucionales**: Con justificación

##  Flujo de Aprobación

1. **Solicitud Inicial**: Docente crea la solicitud
2. **Revisión TTHH**: Talento Humano revisa y procesa
3. **Aprobación Director**: Director aprueba o rechaza
4. **Notificación**: Sistema envía notificaciones automáticas
5. **Generación de Carta**: Se genera carta formal automáticamente

##  API Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cierre de sesión
- `POST /api/auth/reset-password` - Restablecer contraseña

### Permisos
- `GET /api/permisos` - Listar permisos
- `POST /api/permisos` - Crear permiso
- `PUT /api/permisos/:id` - Actualizar permiso
- `GET /api/permisos/mis-solicitudes` - Solicitudes del usuario

### Usuarios
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Informes
- `GET /api/dashboard/estadisticas` - Estadísticas generales
- `GET /api/dashboard/reportes` - Reportes detallados

##  Componentes Principales

###  Frontend Components

#### DTIC Components
- **GestionUsuarios.jsx**: Administración completa de usuarios del sistema
- **ReportesDTIC.jsx**: Reportes y estadísticas para administración
- **TipoPermisoGestion.jsx**: Gestión de tipos de permisos

#### Director Components
- **SolicitudesDirector.jsx**: Revisión y aprobación final de solicitudes

#### TTHH Components
- **RegistroSolicitudes.jsx**: Registro y procesamiento inicial de solicitudes
- **SolicitudesTTHH.jsx**: Gestión de solicitudes por Talento Humano

#### Usuarios Components
- **Dashboard.jsx**: Panel principal con estadísticas y accesos rápidos
- **MisSolicitudes.jsx**: Listado y gestión de solicitudes personales
- **PermisosForm.jsx**: Formulario completo para crear solicitudes de permiso
  - Validación en tiempo real
  - Previsualización de cartas
  - Manejo de archivos y evidencias
- **VistaEvidencia.jsx**: Visualización de documentos adjuntos

#### PlantillasCartas Components
- **CartaLayout.jsx**: Layout base para todas las cartas
- **CartaAtraso.jsx**: Plantilla para justificar atrasos
- **CartaFalta.jsx**: Plantilla para justificar faltas
- **CartaSinTimbrar.jsx**: Plantilla para faltas de timbrado
- **CartaOtros.jsx**: Plantilla genérica para otros permisos

#### Pages Components
- **Login.jsx**: Página de autenticación
- **Perfil.jsx**: Gestión de perfil de usuario
- **ResetPassword.jsx**: Restablecimiento de contraseña
- **SolicitarReset.jsx**: Solicitud de reseteo de contraseña
- **TTHHPage.jsx**: Página principal para TTHH
- **NotFound.jsx**: Página 404
- **Unauthorized.jsx**: Página de acceso no autorizado

#### Utilitarios
- **LoadingModal.jsx**: Modal de carga
- **ThemeDemo.jsx**: Demostración de temas UI

###  Backend Services

#### EmailService
- Envío de notificaciones automáticas
- Procesamiento de respuestas IMAP
- Gestión de plantillas de correo
- Configuración SMTP/IMAP

#### PermisoService
- Lógica de negocio completa
- Validaciones de negocio
- Flujo de aprobación multi-nivel
- Generación de cartas

#### PDFService
- Generación de documentos PDF
- Firmas digitales integradas
- Manejo de archivos adjuntos
- Compresión de documentos

##  Seguridad

###  Autenticación
- Tokens JWT con expiración
- Refresh tokens
- Contraseñas encriptadas con bcrypt

###  Autorización
- Roles basados en acceso
- Middleware de validación
- Rutas protegidas

###  Validaciones
- Sanitización de datos
- Validación de archivos
- Protección XSS

##  Manejo de Errores

###  Frontend
- Componentes de error
- Toast notifications
- Logging de errores

###  Backend
- Middleware de errores
- Logging estructurado
- Respuestas estandarizadas

##  Optimización

###  Frontend
- Lazy loading de componentes
- Optimización de imágenes
- Caching estratégico

###  Backend
- Pool de conexiones a BD
- Caching de consultas
- Compresión de respuestas

##  Testing

###  Frontend
- Pruebas unitarias con Jest
- Pruebas de integración
- Testing visual

###  Backend
- Pruebas unitarias con Jest
- Pruebas de API
- Testing de integración

##  Despliegue

###  Producción
- Docker containers
- Nginx reverse proxy
- SSL/TLS configurado
- Monitoreo con logs

###  Variables de Producción
- Configuración segura
- Secrets management
- Environment variables

##  Mantenimiento

###  Backup
- Base de datos PostgreSQL
- Archivos subidos
- Configuraciones del sistema

###  Monitoreo
- Logs centralizados
- Métricas de rendimiento
- Alertas automáticas

##  Características Avanzadas

###  Sistema de Notificaciones
- Notificaciones automáticas por email
- Procesamiento de respuestas IMAP
- Plantillas personalizadas
- Seguimiento de estado

###  Manejo de Documentos
- Upload de archivos múltiples
- Validación de formatos (PDF, JPG, PNG)
- Compresión automática
- Vista previa integrada

###  Reportes y Estadísticas
- Dashboard en tiempo real
- Gráficos interactivos con Recharts
- Exportación de datos
- Filtros avanzados

##  Contribución

###  Flujo de Trabajo
1. Fork del proyecto
2. Crear feature branch
3. Commits descriptivos
4. Pull request con pruebas

###  Convenciones
- ESLint para código limpio
- Prettier para formato
- Mensajes de commit convencionales
- Code reviews obligatorios

##  Licencia

Este proyecto es propiedad del Instituto Académico de Idiomas - Universidad Central del Ecuador.

##  Soporte

###  Contacto
- **Email de soporte**: soporte@iai.edu.ec
- **Documentación API**: http://localhost:3000/api-docs
- **Issues**: GitHub Issues
- **Wiki**: Documentación adicional en GitHub Wiki

###  FAQs

**P: ¿Cómo reseteo mi contraseña?**
R: Utiliza la opción "Olvidé mi contraseña" en la página de login.

**P: ¿Qué formatos de archivo son aceptados?**
R: PDF, JPG, PNG, con tamaño máximo de 5MB.

**P: ¿Cómo puedo verificar el estado de mi solicitud?**
R: Ingrese a "Mis Solicitudes" en el panel principal.

---

##  Comandos Útiles

###  Docker
```bash
# Levantar servicios
docker compose up --build -d

# Ver logs
docker compose logs -f

# Detener servicios
docker compose down

# Limpiar todo
docker compose down -v --rmi all
```

###  Backend
```bash
# Desarrollo
npm run dev

# Producción
npm start

# Producción sin sandbox (Puppeteer)
npm run start:nosandbox

# Tests
npm test
```

###  Frontend
```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview producción
npm run preview

# Linting
npm run lint
```

---

**Versión**: 2.0.0  
**Última Actualización**: Abril 2026  
**Desarrollado por**: Equipo DTIC - IAI UCE  
**Estado**: Producción activa  
**Licencia**: Propiedad del Instituto Académico de Idiomas - UCE
