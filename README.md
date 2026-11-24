# Ruta 04 — Marketplace DEMO de fotografía deportiva

> **Tu carrera. Tu momento. Tu fotografía.**

MVP académico de un marketplace de fotografía deportiva. Conecta a deportistas que buscan y compran fotografías de eventos con fotógrafos que necesitan organizar, publicar y vender su contenido. **Todo el flujo de compra es de demostración: no se procesan pagos reales ni autenticación real.**

---

## Tabla de contenidos

1. [Descripción](#descripción)
2. [Objetivo](#objetivo)
3. [Problemática](#problemática)
4. [Usuarios](#usuarios)
5. [Funcionalidades implementadas](#funcionalidades-implementadas)
6. [Estado del proyecto](#estado-del-proyecto)
7. [Tecnologías](#tecnologías)
8. [Arquitectura](#arquitectura)
9. [Modelo de datos](#modelo-de-datos)
10. [Estructura del repositorio](#estructura-del-repositorio)
11. [Requisitos](#requisitos)
12. [Instalación](#instalación)
13. [Variables de entorno](#variables-de-entorno)
14. [Ejecución](#ejecución)
15. [Build de producción](#build-de-producción)
16. [Deployment](#deployment)
17. [Modo DEMO](#modo-demo)
18. [Datos DEMO](#datos-demo)
19. [API](#api)
20. [Pruebas](#pruebas)
21. [Limitaciones](#limitaciones)
22. [Funciones futuras](#funciones-futuras)
23. [Capturas para el capítulo 7](#capturas-para-el-capítulo-7)

---

## Descripción

Ruta 04 permite:

- **Al deportista:** explorar eventos, buscar por nombre/ubicación o por código de fotografía, ver la galería, ampliar imágenes (lightbox), agregar fotos a un carrito persistente, completar una **compra DEMO** y consultar sus compras por correo.
- **Al fotógrafo (modo DEMO):** ver un dashboard con datos reales, crear/editar/eliminar eventos, subir fotografías con previews, asociarlas a un evento, asignar precio y administrar precio, disponibilidad y borrado.

No incluye pagos reales, autenticación real, reconocimiento facial ni IA de identificación.

## Objetivo

Demostrar el ciclo funcional completo de un marketplace de fotografía deportiva:

1. El fotógrafo crea o administra un evento.
2. Carga fotografías y las asocia al evento.
3. Las imágenes quedan disponibles en una galería.
4. El deportista explora o busca el evento.
5. Consulta y amplía fotografías.
6. Selecciona imágenes y las agrega al carrito.
7. Completa una compra de demostración.
8. Consulta las fotografías adquiridas.

## Problemática

En carreras, maratones, competencias de ciclismo y otros eventos, los participantes pueden tener dificultades para encontrar sus fotografías entre galerías desorganizadas y grandes volúmenes de archivos. Los fotógrafos, a su vez, necesitan organizar, publicar, administrar y vender sus imágenes con menos trabajo manual.

**Causas:** carga manual, galerías desorganizadas, búsqueda difícil y procesos de compra/entrega fragmentados.

**Consecuencias:** pérdida de tiempo, mala experiencia de compra, menor eficiencia del fotógrafo y oportunidades comerciales perdidas.

## Usuarios

1. **Deportistas y participantes:** buscan, visualizan y adquieren fotografías de eventos.
2. **Fotógrafos deportivos:** cargan, organizan, publican y venden fotografías.
3. **Organizadores:** pueden beneficiarse de una distribución centralizada. El MVP prioriza deportistas y fotógrafos; no incluye un portal independiente para organizadores.

---

## Funcionalidades implementadas

### Deportista

- Landing con propuesta de valor, CTA, eventos destacados y fotografías destacadas (datos reales de la API).
- Exploración de eventos con búsqueda por nombre/ubicación y filtro por categoría deportiva.
- **Búsqueda de fotografía por código** (por ejemplo `DEMO-RUN-01`).
- Detalle de evento y galería responsive.
- Visualización ampliada (**lightbox**) con precio, código y disponibilidad.
- Carrito **persistente** en `localStorage`, con miniaturas, eliminación, subtotal y total.
- Revalidación de precio y disponibilidad contra la API al entrar al carrito/checkout.
- Checkout **DEMO** con validación de nombre y correo.
- Confirmación de pedido y consulta de **fotografías adquiridas por correo**.
- Estados de carga, vacío y error; notificaciones (toasts); diseño responsive.

### Fotógrafo (modo DEMO)

- Acceso identificado como **modo DEMO** (no es autenticación real).
- Dashboard con métricas reales derivadas de la API: eventos, fotografías, disponibles, no disponibles y valor publicado.
- Crear, listar, editar y eliminar eventos (con confirmación).
- Subida real de una o varias fotografías (multipart) con selección de archivos, previews, asociación a evento y asignación de precio.
- Listado y filtrado de fotografías por evento y disponibilidad.
- Edición de precio y disponibilidad.
- Eliminación de fotografías (registro + archivo físico) con confirmación.
- Si el evento no tiene portada, la primera foto subida se usa como `coverImage`.

### Backend / datos

- Modelo de datos con Prisma + SQLite y migraciones.
- Validaciones de entrada, códigos únicos, restricciones de integridad y códigos HTTP adecuados.
- Almacenamiento local de imágenes en `server/uploads/`, servido en `/uploads`.
- Pedidos DEMO con precios y totales calculados **en el backend** (no se confía en precios del cliente).
- Seed idempotente con datos DEMO.

### Calidad

- Pruebas unitarias (Vitest + Testing Library).
- Pruebas E2E (Playwright/Chromium) de los dos flujos, responsive y consola.
- Pruebas de integración del backend.
- Build de producción y servido del frontend compilado desde Express.

---

## Estado del proyecto

### Implementado

- Backend (P1–P5): modelo, migraciones, CRUD de eventos, fotografías con almacenamiento local, pedidos DEMO, seed y verificación.
- Frontend (P6–P8): sistema visual, experiencia del deportista y panel del fotógrafo.
- Integración y calidad (P9): producción servida por Express, búsqueda por código, Vitest, Playwright y regresión del backend.
- Documentación (P10): este README y la lista de evidencias del capítulo 7.

### Pendiente

- **Validación con participantes reales** (sesiones, encuestas, opiniones, métricas de uso). **No se ha realizado**; no hay resultados que reportar.
- Despliegue en un proveedor de hosting (no ejecutado).
- Autenticación/roles reales, pagos reales, portal de organizadores y demás funciones fuera del alcance.
- Auditoría de accesibilidad profunda y pruebas en navegadores distintos de Chromium.

### Validaciones por realizar (capítulo 7)

- Pruebas de usabilidad con deportistas y fotógrafos.
- Registro real de opiniones, resultados y mejoras derivadas.
- Métricas de uso o ventas reales.

> **No se inventan** participantes, encuestas, testimonios, ventas, ingresos, porcentajes ni resultados de validación.

---

## Tecnologías

### Frontend

| Tecnología | Versión usada |
|---|---|
| React / React DOM | 19.3.1 |
| TypeScript | 7.0.2 |
| Vite | 8.3.8 |
| React Router | 7.18.6 |
| Tailwind CSS + `@tailwindcss/vite` | 4.3.5 |
| lucide-react | 1.78.0 |
| @fontsource/inter + @fontsource/barlow-condensed | 5.3.0 |
| Vitest + Testing Library | 5.1.1 / 16.3.3 |
| Playwright (E2E) | 1.65.1 |
| oxlint | 1.95.0 |

### Backend

| Tecnología | Versión usada |
|---|---|
| Node.js | ≥ 20 (probado con 24.11.1) |
| Express | 5.3.0 |
| TypeScript | 5.9.3 |
| Prisma Client / CLI | 6.19.3 |
| SQLite | vía Prisma |
| multer | 2.5.0 |
| tsx | 4.23.15 |

### Raíz

| Herramienta | Versión |
|---|---|
| concurrently | 10.0.7 |
| Playwright | 1.65.1 |

---

## Arquitectura

Monolito sencillo: una SPA React servida por el mismo servidor Express que expone la API y las imágenes.

```
Navegador
  │
  ├── React SPA (client/dist) ── servida por Express en producción
  │
  ├── /api/*     → Express 5 + Prisma 6 → SQLite (server/prisma/dev.db)
  └── /uploads/* → archivos locales (server/uploads)
```

- **Desarrollo:** Vite en `:5173` con proxy de `/api` y `/uploads` hacia Express en `:4000`.
- **Producción local:** Express en `:4000` sirve API, `/uploads` y `client/dist` (con fallback SPA para rutas profundas).
- **Persistencia:** SQLite (un archivo) + archivos locales. Sin servicios cloud en runtime.
- **Autenticación:** no implementada. El “modo fotógrafo” es un acceso de demostración.

---

## Modelo de datos

SQLite no soporta `enum` nativo: `sportCategory` y `status` se modelan como `String` y se validan en la aplicación. Los montos (`price`, `subtotal`, `total`) son enteros en pesos COP sin decimales.

| Modelo | Campos principales | Restricciones |
|---|---|---|
| **Event** | `id`, `name`, `sportCategory`, `location`, `date`, `description?`, `coverImage?`, `status`, `createdAt`, `updatedAt` | índices por categoría y estado |
| **Photo** | `id`, `eventId`, `storagePath`, `code`, `price`, `available`, `createdAt` | `code` único; índice por evento y disponibilidad |
| **Order** | `id`, `orderNumber`, `customerName`, `customerEmail`, `subtotal`, `total`, `status`, `createdAt` | `orderNumber` único; índice por correo/estado |
| **OrderItem** | `id`, `orderId`, `photoId`, `price` | único `(orderId, photoId)`; índice por `photoId` |

**Relaciones y borrado**

- `Event 1→N Photo` — `ON DELETE CASCADE` (al borrar un evento se borran sus fotos y archivos).
- `Order 1→N OrderItem` — `ON DELETE CASCADE`.
- `OrderItem N→1 Photo` — `ON DELETE RESTRICT` (no se puede borrar una foto vendida).
- `OrderItem @@unique([orderId, photoId])` evita la misma foto dos veces en un pedido.

**Categorías:** `RUNNING`, `CYCLING`, `TRIATHLON`, `SWIMMING`, `OTHER`.
**Estados de evento:** `DRAFT`, `ACTIVE`, `ARCHIVED`.
**Estados de pedido:** `PENDING`, `COMPLETED`, `CANCELLED`.

Migraciones en `server/prisma/migrations/`:
- `20261124014219_init`
- `20261124021000_order_item_unique`

---

## Estructura del repositorio

```
Ruta04/
├── client/                     # SPA React + TypeScript + Vite
│   ├── src/
│   │   ├── components/         # layout, ui, feedback, events, photos, photographer
│   │   ├── context/            # carrito persistente
│   │   ├── hooks/              # useApi, useCartValidation, useDebouncedValue
│   │   ├── lib/                # api, format, cn
│   │   ├── pages/              # deportista, confirmación, panel del fotógrafo
│   │   ├── styles/             # Tailwind + tokens
│   │   ├── test/               # setup de Vitest
│   │   └── types/              # tipos de la API
│   ├── vite.config.ts          # proxy /api y /uploads
│   └── vitest.config.ts
├── server/                     # API Express + Prisma + SQLite
│   ├── prisma/                 # schema, migraciones, dev.db (generado)
│   ├── src/
│   │   ├── lib/                # prisma, storage, validación, errores
│   │   ├── routes/             # events, event-photos, photos, orders
│   │   ├── services/           # lógica de eventos, fotos, pedidos
│   │   └── scripts/            # seed, verify, tests, e2e-cleanup
│   ├── uploads/                # archivos subidos (generado, ignorado)
│   └── .env.example
├── e2e/                        # Playwright (flujos, responsive, consola)
├── docs/                       # evidencias del capítulo 7
├── playwright.config.ts
├── package.json                # orquestación raíz
├── contex.md                   # contexto permanente del proyecto
├── plan_desarollo_mvp.md       # plan secuencial de desarrollo
└── README.md
```

**Generado / ignorado por Git:** `node_modules/`, `client/dist/`, `server/dist/`, `server/uploads/`, `server/prisma/*.db`, `.env*`, `test-results/`, `playwright-report/`.

---

## Requisitos

- **Node.js ≥ 20** (probado con **24.11.1**).
- **npm ≥ 10** (probado con **11.6.2**).
- Sistema operativo: probado en **Windows 11**; los scripts son compatibles con Unix.
- Para E2E: Chromium de Playwright (se instala con un comando).

---

## Instalación

```bash
# 1. Dependencias (raíz, backend y frontend)
npm install
npm --prefix server install
npm --prefix client install

# 2. Variables de entorno del backend
#    Windows
copy server\.env.example server\.env
#    Unix/macOS
cp server/.env.example server/.env

# 3. Cliente Prisma + migraciones
npm --prefix server run db:generate
npm --prefix server run db:deploy

# 4. Datos DEMO
npm run seed
```

> El seed intenta descargar fotografías deportivas desde Wikimedia Commons y, si falla la red, genera placeholders SVG locales. Requiere red solo la primera vez; luego reutiliza los archivos.

Para E2E:

```bash
npx playwright install chromium
```

---

## Variables de entorno

### `server/.env` (obligatorio)

```env
PORT=4000
DATABASE_URL="file:./dev.db"
# UPLOAD_DIR=./uploads   # opcional; por defecto server/uploads
```

- `DATABASE_URL` es relativa al schema de Prisma (`server/prisma/dev.db`).
- `PORT` es el puerto de Express (por defecto 4000).
- No se deben versionar secretos: `.env` está en `.gitignore`.

### `client/.env` (opcional)

```env
VITE_API_BASE=
```

- Vacío = mismo origen. En desarrollo, el proxy de Vite redirige `/api` y `/uploads` a `http://localhost:4000`.
- Solo se necesita para apuntar a una API en otro origen.

---

## Ejecución

### Desarrollo (backend + frontend)

```bash
npm run dev
```

- API: `http://localhost:4000`
- Cliente: `http://localhost:5173` (proxy a la API)

También por separado:

```bash
npm run dev:server
npm run dev:client
```

### Producción local (un solo proceso)

```bash
npm run build
npm run seed
npm start
```

Abrir `http://localhost:4000`. Express sirve la API, `/uploads` y el frontend compilado.

---

## Build de producción

```bash
npm run build
```

Ejecuta:

- `server`: `tsc -p tsconfig.json` → `server/dist/`
- `client`: `tsc -b && vite build` → `client/dist/`

**Resultado real de la última ejecución (noviembre de 2026):**

| Artefacto | Tamaño |
|---|---|
| `client` JS | 347.41 kB (103.06 kB gzip) |
| `client` CSS | 37.41 kB (7.13 kB gzip) |
| `server` | compilación TypeScript sin errores |

---

## Deployment

**Estado real:** el build de producción fue comprobado **localmente** y Express sirve `client/dist` correctamente. **No se ha desplegado en ningún proveedor de hosting**; no existe URL pública ni pipeline de CI/CD.

Para ejecutarlo en un servidor propio:

1. Node.js ≥ 20 y npm.
2. Copiar el repositorio e instalar dependencias.
3. Configurar `server/.env` (`PORT`, `DATABASE_URL`).
4. `npm run build && npm run seed && npm start`.
5. Mantener persistencia de:
   - `server/prisma/dev.db` (base SQLite),
   - `server/uploads/` (archivos).
6. Usar un proxy inverso con HTTPS y un gestor de procesos (fuera del alcance del MVP).

> No afirmar un despliegue en hosting mientras no se ejecute y verifique.

---

## Modo DEMO

El MVP es una **demostración académica**:

- **No hay autenticación real.** “Modo fotógrafo” es un acceso DEMO señalizado; no protege rutas ni datos.
- **No hay pagos reales.** El checkout crea un pedido DEMO (`orderNumber` con prefijo `DEMO-`, `demo: true`) y no solicita datos de pago.
- **No hay ventas ni ingresos reales.** Los pedidos son simulaciones persistidas.
- **Los eventos e imágenes son DEMO.** No representan eventos reales ni resultados reales.
- El carrito se guarda en `localStorage` del navegador (por dispositivo; sin autenticación).
- La biblioteca de compras se consulta por correo, sin verificación de identidad.

---

## Datos DEMO

El seed (`server/src/scripts/seed.ts`) es idempotente (IDs deterministas). Carga:

| Evento (ficticio) | Categoría | Ubicación | Fotos |
|---|---|---|---|
| Maratón Nocturno DEMO – Bogotá | RUNNING | Bogotá, Cundinamarca | 6 |
| Gran Fondo Ciclismo DEMO – Medellín | CYCLING | Medellín, Antioquia | 6 |
| Triatlón Sprint DEMO – Cartagena | TRIATHLON | Cartagena, Bolívar | 6 |
| Copa de Natación DEMO – Cali | SWIMMING | Cali, Valle del Cauca | 6 |

- **24 fotografías**, 4 categorías, precios variados.
- Códigos únicos (`DEMO-RUN-01`, `DEMO-CYC-01`, `DEMO-TRI-01`, `DEMO-SWI-01`, …).
- Una foto no disponible por evento (para probar filtros y validaciones).
- Imágenes ilustrativas: descargadas de Wikimedia Commons (licencias libres) en la primera carga o placeholders SVG locales si la descarga falla. **No** son fotografías de los eventos ficticios.

---

## API

Base: `/api`. Respuestas de éxito: `{ "data": ..., "count"?: n }`. Errores: `{ "error": "...", "details"?: [...] }`.

### Salud

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servidor y conexión a la BD |

### Eventos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/events?q=&sport=` | Listar; buscar por nombre/ubicación; filtrar por deporte |
| GET | `/api/events/:id` | Consultar evento |
| POST | `/api/events` | Crear evento |
| PATCH | `/api/events/:id` | Editar evento |
| DELETE | `/api/events/:id` | Eliminar evento (cascada de fotos y archivos) |

**Campos de evento:** `name` (2–120), `sportCategory`, `location` (2–120), `date` (ISO 8601), `description?`, `coverImage?`, `status?`.

### Fotografías

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/events/:eventId/photos` | Subir 1..N fotos (multipart, campo `files`) + `price`; `code` opcional con un solo archivo |
| GET | `/api/events/:eventId/photos` | Galería del evento |
| GET | `/api/photos?eventId=&available=&code=` | Listar/filtrar por evento, disponibilidad y código |
| GET | `/api/photos/:id` | Consultar foto |
| PATCH | `/api/photos/:id` | Editar `price` y/o `available` |
| DELETE | `/api/photos/:id` | Eliminar registro y archivo |

**Subida:** JPG/JPEG/PNG/WEBP, máximo 5 MB por archivo y 20 archivos por petición. Los nombres se generan con UUID; el código único se genera si no se envía.

### Pedidos DEMO

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/orders` | Crear pedido con `customerName`, `customerEmail`, `photoIds` |
| GET | `/api/orders?email=` | Pedidos y fotos adquiridas por correo |
| GET | `/api/orders/:orderNumber` | Consultar pedido por número |

El backend valida existencia y disponibilidad, **calcula precios y totales desde la BD** (ignora precios del cliente), evita duplicados y genera un número único.

### Archivos y frontend

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/uploads/:archivo` | Imagen almacenada localmente |
| GET | `/*` | En producción, `client/dist` y fallback SPA (excepto `/api` y `/uploads`) |

---

## Pruebas

### Comandos

```bash
# Unitarias (Vitest + Testing Library)
npm run test:unit

# E2E (build + seed + Playwright contra el servidor de producción)
npm run test:e2e

# Unitarias + E2E
npm run test:all

# Backend (persistencia, demo, eventos, fotos, pedidos)
npm run test:backend

# Limpieza manual de datos E2E (si una ejecución se interrumpe)
npm --prefix server run e2e:cleanup
```

### Resultados reales (noviembre de 2026)

| Suite | Resultado |
|---|---|
| Unitarias (`Vitest`) | **3 archivos · 8 tests passed** |
| E2E (`Playwright`, Chromium) | **4 tests passed** (deportista, código, fotógrafo, responsive) |
| `verify` (persistencia) | **OK** |
| `verify:demo` | **31 ok · 0 fallidas** |
| `test:events` | **24 ok · 0 fallidas** |
| `test:photos` | **33 ok · 0 fallidas** |
| `test:orders` | **36 ok · 0 fallidas** |
| Consola del navegador (E2E) | **0 errores** |
| Responsive | **375×667** sin desbordamiento horizontal |
| Estado final tras pruebas | 4 eventos · 24 fotos · 0 pedidos · 24 archivos |

Los E2E cubren: búsqueda/filtros, galería, lightbox, carrito, validación de checkout, compra DEMO, confirmación, biblioteca, búsqueda por código, 404, dashboard del fotógrafo, creación/edición/eliminación de evento y carga/edición/eliminación de fotos.

> Limitación: los E2E solo se ejecutaron en **Chromium**.

---

## Limitaciones

- **Sin autenticación ni roles reales**: el modo fotógrafo es DEMO y no protege datos.
- **Sin pagos reales** ni pasarela; los pedidos son DEMO.
- **SQLite local**: adecuado para una demo de un solo proceso; no para múltiples instancias/serverless.
- **Archivos en disco local** (`server/uploads`): requiere disco persistente; no hay CDN ni almacenamiento cloud.
- **Carrito por dispositivo** (`localStorage`): no se sincroniza entre navegadores/dispositivos.
- **Búsqueda por tildes**: SQLite `LIKE` es insensible a mayúsculas en ASCII pero sensible a tildes (`Triatlón` ≠ `Triatlon`).
- **Validación de imágenes por MIME + extensión**, sin inspección profunda del contenido ni miniaturas/redimensionado.
- **Una misma fotografía puede comprarse en pedidos distintos**; la disponibilidad la controla el fotógrafo. Solo se evitan duplicados dentro del mismo pedido.
- **E2E solo en Chromium**; sin auditoría de accesibilidad profunda.
- **Sin despliegue en hosting** (solo build local comprobado).
- `npm audit` reporta alertas en dependencias de la **CLI de Prisma** (dev); no afectan el runtime del servidor.

---

## Funciones futuras

Fuera del alcance actual, propuestas para una versión posterior:

- Autenticación y roles reales (deportista, fotógrafo, organizador).
- Pagos reales, facturación y entrega de archivos en alta resolución.
- Portal de organizadores e integraciones con cronometraje/inscripciones.
- Reconocimiento facial/IA para encontrar deportistas (explícitamente fuera del MVP).
- Miniaturas, optimización y CDN de imágenes.
- Paginación y búsqueda avanzada.
- Notificaciones por correo y descargas.
- Despliegue con CI/CD, HTTPS y respaldos.
- Auditoría de accesibilidad y pruebas cross-browser.
- Código de descuento, paquetes o comisiones (no incluidas).

---

## Capturas para el capítulo 7

La lista detallada de capturas, rutas, datos sugeridos y leyendas está en:

**[`docs/capitulo-7-evidencias.md`](docs/capitulo-7-evidencias.md)**

Incluye las 10 capturas solicitadas (landing, exploración, detalle/galería, lightbox, carrito, checkout DEMO, confirmación y biblioteca, dashboard fotógrafo, creación de evento, carga y gestión de fotos) y capturas opcionales de evidencias técnicas.

---

## Integridad y veracidad

- Este README describe **solo lo implementado y probado**.
- Los eventos, imágenes y pedidos son **DEMO**; no representan eventos, ventas o ingresos reales.
- **No** se reportan participantes, encuestas, testimonios, resultados de validación ni porcentajes inventados.
- La validación con participantes reales y el despliegue en hosting están **pendientes**.
