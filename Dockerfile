# Imagen de producción del backend Ruta 04 (Express + Prisma + PostgreSQL).
# Pensada para hosts de contenedor gratuitos sin tarjeta (p. ej. Suga).
FROM node:20-bookworm-slim

# Prisma requiere OpenSSL.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/server

# Dependencias (incluye dev para compilar TypeScript y generar Prisma).
# Se copia el schema antes para que el postinstall de Prisma lo encuentre.
COPY server/package*.json ./
COPY server/prisma ./prisma
RUN npm install --include=dev

# Código y compilación.
COPY server/ ./
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
EXPOSE 4000

# Arranca el servidor. Las migraciones se aplican aparte (npm run db:deploy)
# para no cargar la CLI de Prisma en un contenedor de 256 MB en cada arranque.
CMD ["node", "dist/index.js"]
