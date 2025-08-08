# 📋 Instrucciones para ejecutar el proyecto con Docker Compose

## 1. Preparar las variables de entorno

### Backend — archivo `.env` (en `./backend/.env`)

```env
PORT=3000

DB_HOST=postgresql
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=example
DB_NAME=iai_sistemapermisos

JWT_SECRET=586E3272357538782F413F4428472B4B6250655368566B597033733676397924

URL_FRONTEND=http://frontend

# --- Datos de usuario principal ---
EMAIL_ADDRESS=parangaricutimiricuaro465879@gmail.com
EMAIL_PERMISOS=parangaricutimiricuaro465879+permisos@gmail.com
EMAIL_DIRECTOR=parangaricutimiricuaro465879+director@gmail.com
EMAIL_SOPORTE=parangaricutimiricuaro465879+soporte@gmail.com

# --- Autenticación ---
EMAIL_PASSWORD=sgvx dfhz svnj rmzj

# --- IMAP (lectura de correos) ---
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_SECURE=true

# --- SMTP (envío de correos) ---
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

---

### Frontend — archivo `.env` (en `./frontend/.env`)

```env
VITE_API_URL=http://backend:3000/api
```

---

## 2. Estructura de carpetas (resumen)

```
ProyectoPermisosDocentes/
├── backend/
│   ├── Dockerfile
│   ├── .env
│   ├── uploads/
│   └── ...otros archivos y carpetas...
├── frontend/
│   ├── Dockerfile
│   ├── .env
│   └── ...otros archivos y carpetas...
├── docker-compose.yml
├── postgresql_data/    (se crea automáticamente)
```

---

## 3. Levantar los servicios con Docker Compose

En la raíz del proyecto (`ProyectoPermisosDocentes/`), ejecuta:

```bash
docker compose up --build -d
```

* Esto construirá las imágenes y levantará los contenedores:

  * PostgreSQL en el puerto **5435** de tu máquina (mappeado al 5432 del contenedor).
  * Backend Express en el puerto **3000**.
  * Frontend React servido por Nginx en el puerto **80**.

---

## 4. Verificar que todo funciona

* Accede a tu frontend en:
  [http://localhost](http://localhost)

* El backend estará disponible en:
  [http://localhost:3000/api](http://localhost:3000/api)

* PostgreSQL estará accesible para herramientas externas en:
  `localhost:5435` (usuario: `postgres`, password: `example`)

---

## 5. Detener y limpiar los servicios

Para detener y eliminar los contenedores:

```bash
docker compose down
```

---

## 6. Comprobación de variables de entorno en contenedores (opcional)

```bash
docker exec -it backend printenv
docker exec -it frontend printenv
```
