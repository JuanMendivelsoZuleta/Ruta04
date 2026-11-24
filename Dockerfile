# Imagen de producción del backend Ruta 04 (Express + Prisma + PostgreSQL).
# Pensada para hosts de contenedor gratuitos sin tarjeta (p. ej. Suga).
FROM node:20-bookworm-slim

# Prisma requiere OpenSSL.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/server

# Dependencias (incluye dev para compilar TypeScript y generar Prisma).
COPY server/package*.json ./
RUN npm install --include=dev

# Código y compilación.
COPY server/ ./
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
EXPOSE 4000

# Aplica migraciones pendientes (idempotente) y arranca el servidor.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
