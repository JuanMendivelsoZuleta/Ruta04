# Guía de despliegue — Ruta 04

Arquitectura gratuita y persistente:

```
Profesor
  │
  ├─ https://<proyecto>.vercel.app      → React (Vite)          [Vercel]
  │        │  fetch(VITE_API_BASE + /api/...)
  │        ▼
  ├─ https://<servicio>.suga.app        → Express + Prisma      [Suga]
  │        ├─ PostgreSQL                                     [Neon]
  │        └─ fotografías (URLs públicas)                    [Cloudinary]
  └─ <img src="https://res.cloudinary.com/...">
```

- **0 COP**, sin tarjeta, sin pruebas que cobren después.
- Persistencia: la base de datos y las fotos viven fuera del disco efímero del host (Neon + Cloudinary).
- Limitación principal: algunos hosts gratuitos duermen el backend por inactividad (cold start de ~1 min). Suga Free es siempre encendido.

---

## Requisitos

- Cuenta de GitHub con este repositorio.
- Cuentas gratuitas: [Vercel](https://vercel.com), [Suga](https://suga.app), [Neon](https://neon.tech), [Cloudinary](https://cloudinary.com).
- Node.js ≥ 20 y npm en tu máquina (solo para ejecutar la migración y el seed una vez).

---

## Paso 1 — Base de datos (Neon)

1. Crea un proyecto en Neon (región cercana, p. ej. AWS us-east-1).
2. Copia la **connection string directa** (sin `-pooler`), con este formato:
   ```
   postgresql://USUARIO:CLAVE@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Esa cadena será `DATABASE_URL` (en local y en el host del backend). **No la compartas ni la subas al repositorio.**

## Paso 2 — Fotografías (Cloudinary)

1. Crea una cuenta gratuita.
2. En el **Dashboard** copia: `Cloud name`, `API Key`, `API Secret`.
3. Serán `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

## Paso 3 — Preparar y cargar datos (desde tu máquina, una vez)

1. Crea `server/.env` (copia de `server/.env.example`) y completa:
   ```env
   PORT=4000
   DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   CORS_ORIGIN=http://localhost:5173
   ```
2. Aplica la migración y carga los datos DEMO (sube las 24 fotos a Cloudinary):
   ```bash
   npm --prefix server install
   npm --prefix server run db:generate
   npm --prefix server run db:deploy
   npm run seed
   ```
   > El seed reutiliza las imágenes ya presentes en `server/uploads/`; si no existen, las descarga.
3. Comprueba localmente (opcional):
   ```bash
   npm --prefix server run verify
   ```

## Paso 4 — Backend (host sin tarjeta)

### Opción A (recomendada): Suga — sin tarjeta y siempre encendido

1. Entra a https://suga.app e inicia sesión con **GitHub**. Elige el plan **Free**
   (NO inicies la prueba de 14 días de los planes de pago).
2. Crea un **proyecto** (p. ej. `ruta04`) y añade un **servicio desde tu repositorio**:
   - Repositorio: `JuanMendivelsoZuleta/Ruta04`, rama `main`.
   - Suga detecta el `Dockerfile` de la raíz y compila `server/`.
3. Variables de entorno del servicio (las mismas de `server/.env`):
   - `DATABASE_URL` = cadena directa de Neon
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `CORS_ORIGIN` = `http://localhost:5173` (temporal; se ajusta en el Paso 6)
   - `NODE_ENV` = `production`
4. Deploy y espera a que el servicio esté **Live**. Abre:
   `https://<tu-servicio>.suga.app/api/health` → debe responder `{"status":"ok","database":"connected"}`.

> El contenedor ejecuta `prisma migrate deploy` al arrancar (idempotente) y luego el servidor.

### Opción B: Render (solo si no te pide tarjeta)

Usa `render.yaml` o un Web Service con Root Directory `server`, build
`npm install --include=dev && npx prisma generate && npm run build` y start
`npm run start:deploy`. La primera petición tarda ~1 min (cold start).

## Paso 5 — Frontend en Vercel

1. **Add New → Project** e importa el repositorio.
2. Configura:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` · **Output Directory:** `dist`
3. Variable de entorno: `VITE_API_BASE=https://ruta04-api.onrender.com`.
4. Deploy. Vercel te dará una URL tipo `https://ruta04.vercel.app`.

## Paso 6 — Cerrar CORS

1. En el host del backend (Suga/Render), actualiza `CORS_ORIGIN` con la URL exacta de Vercel (sin `/` final).
   Ejemplo: `https://ruta04.vercel.app`. Si hay dominio propio, agrégalo separado por coma.
2. Redeploy del backend. Sin esto, el navegador bloqueará las peticiones del frontend.

## Paso 7 — Verificación

- [ ] `GET /api/health` responde `ok` y `database: connected`.
- [ ] La landing de Vercel carga sin errores en consola.
- [ ] Eventos y galerías muestran las fotos (URLs de Cloudinary).
- [ ] Búsqueda por nombre/ubicación y por código (`DEMO-RUN-01`).
- [ ] Carrito y compra DEMO generan un pedido `DEMO-...`.
- [ ] Panel del fotógrafo: crear evento, subir foto, editar precio/disponibilidad, eliminar.
- [ ] **Persistencia:** crea un pedido → en el host haz *Restart/Redeploy* del servicio → el pedido sigue ahí.
- [ ] Las fotos siguen disponibles tras el reinicio.
- [ ] Rutas profundas (`/events`, `/photographer`) cargan al refrescar (rewrite SPA).

## Paso 8 — Respaldo

- **Base de datos:** desde tu máquina con la connection string de Neon:
  ```bash
  pg_dump "postgresql://...neon.tech/neondb?sslmode=require" > respaldo_ruta04.sql
  ```
  (o usa el export del panel de Neon). Guárdalo fuera del repositorio.
- **Fotos:** Cloudinary conserva los originales; puedes descargarlos desde su Media Library.

## Paso 9 — Manual para el profesor

1. Abrir la URL de Vercel.
2. Si es la primera visita tras un rato, **esperar ~1 minuto** (el backend está despertando).
3. Explorar **Eventos** → abrir uno → ver galería → ampliar una foto.
4. Probar **buscar por código**: `DEMO-RUN-01`, `DEMO-CYC-01`, `DEMO-TRI-01`, `DEMO-SWI-01`.
5. Agregar fotos al carrito → **Checkout DEMO** (nombre y correo) → confirmación.
6. Consultar compras por correo en **Biblioteca**.
7. **Modo fotógrafo** (DEMO, sin autenticación real): dashboard, crear evento, subir fotos.
8. Recordatorio: no hay pagos reales; eventos e imágenes son de demostración.

## Limitaciones del plan gratuito

- **Host del backend:** Suga Free es siempre encendido (sin cold start), con 256 MB RAM y 0.1 vCPU. Su disco es efímero; por eso la BD (Neon) y las fotos (Cloudinary) son externas.
- **Render Free** (alternativa): duerme tras 15 min sin tráfico (cold start ~1 min).
- **Neon Free:** 1 GB PostgreSQL, 100 CU-horas/mes; el cómputo se suspende a los 5 min y despierta al instante.
- **Cloudinary Free:** 25 créditos/mes (1 crédito = 1 GB almacenado o 1 GB servido o 1000 transformaciones), máx 10 MB/imagen.
- **Vercel Hobby:** 100 GB de transferencia/mes; uso **no comercial** (el MVP académico lo cumple).
- Sin backups automáticos en Neon → respaldo manual.
- No existe disponibilidad del 100 %.

## Volver a desplegar

- **Frontend:** push a la rama conectada → Vercel reconstruye.
- **Backend:** push a la rama conectada → el host reconstruye la imagen y ejecuta `prisma migrate deploy` al iniciar.
- **Datos:** no se borran; viven en Neon y Cloudinary.
