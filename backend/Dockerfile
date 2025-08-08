# Usa Node.js sobre Debian slim como base
FROM node:18-slim

# Instala Chromium y otras dependencias requeridas por Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Crea un usuario no root para mayor seguridad
RUN groupadd -r pptruser && useradd -r -g pptruser -m -d /home/pptruser pptruser

# Establece el directorio de trabajo
WORKDIR /app

# Copia archivos de dependencias y las instala
COPY package*.json ./
RUN npm install --production

# Copia el resto del código
COPY . .

# Asigna propiedad de los archivos al usuario creado
RUN chown -R pptruser:pptruser /app

# Usa variables de entorno para Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

# Cambia al usuario no root
USER pptruser

# Expone el puerto donde se ejecutará la app
EXPOSE 3000

# Comando por defecto para arrancar la app
CMD ["node", "src/index.js"]
