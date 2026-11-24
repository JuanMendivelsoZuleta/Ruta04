# Capítulo 7 — Evidencias y capturas del MVP Ruta 04

Documento de apoyo para la sección de evidencias del trabajo académico. Describe **qué capturar**, **en qué ruta**, **qué debe verse** y una **leyenda sugerida**, usando los datos DEMO realmente cargados por el seed.

> **Importante:** las capturas deben tomarse del MVP implementado, con datos DEMO. No editar la interfaz para simular funciones inexistentes ni inventar participantes, ventas, ingresos, opiniones, porcentajes o resultados de validación.

---

## 1. Preparación del entorno

```bash
# Desde la raíz del repositorio
npm run seed          # datos DEMO (4 eventos, 24 fotos)
npm run dev           # desarrollo: cliente :5173 + API :4000
# o producción local:
npm run build && npm start   # todo en http://localhost:4000
```

- **Viewport escritorio:** 1440 × 900 (o 1366 × 768).
- **Viewport móvil (opcional):** 390 × 844.
- **Correo DEMO sugerido para capturas:** `demo.capturas@example.com`.
- Realizar las capturas con el seed limpio (4 eventos, 24 fotos).
- Las capturas de compra crean un pedido DEMO persistido. Si se desea limpiar después:
  ```bash
  npm --prefix server run e2e:cleanup   # elimina pedidos con correo e2e.* (no borra demo.capturas@…)
  ```
  Para un pedido de capturas, se puede eliminar manualmente con Prisma Studio (`npm --prefix server run db:studio`) o dejarlo como evidencia DEMO.

---

## 2. Capturas obligatorias

| # | Captura | Ruta | Acción / estado a mostrar | Qué debe verse | Leyenda sugerida |
|---|---|---|---|---|---|
| 1 | **Landing** | `/` | Cargar la página con el seed | Hero, propuesta de valor “Tu carrera. Tu momento. Tu fotografía.”, CTA “Explorar eventos” y “Modo fotógrafo”, eventos destacados y fotos destacadas | “Landing del marketplace DEMO con propuesta de valor, eventos y fotografías destacadas.” |
| 2 | **Exploración de eventos** | `/events` | Escribir “Bogot” en el buscador y seleccionar deporte `Running` | Barra de búsqueda y filtro, resultado del evento “Maratón Nocturno DEMO – Bogotá”, tarjeta con categoría, ubicación y fecha | “Exploración de eventos con búsqueda por ubicación y filtro por categoría deportiva.” |
| 3 | **Detalle y galería** | `/events/demo-event-running` | Abrir el evento desde la exploración | Portada, nombre, categoría, ubicación, fecha, aviso DEMO y grilla de 6 fotografías con código y precio | “Detalle del evento DEMO y galería de fotografías con precio y disponibilidad.” |
| 4 | **Lightbox** | Misma ruta, foto `DEMO-RUN-01` | Hacer clic en una fotografía | Modal con imagen ampliada, evento, código, precio, disponibilidad y botón “Agregar al carrito” | “Visualización ampliada (lightbox) de una fotografía DEMO.” |
| 5 | **Carrito** | `/cart` | Agregar una foto y abrir el carrito | Miniatura, evento, código, precio, acción “Quitar”, resumen con subtotal, total y aviso de compra DEMO | “Carrito persistente con miniaturas, subtotal, total y acciones de edición.” |
| 6 | **Checkout DEMO** | `/checkout` | Ir al checkout; mostrar validación (campos vacíos) y luego el formulario completo | Formulario de nombre/correo, resumen del pedido, precio, aviso “no se procesa ningún pago real” | “Checkout DEMO con validación del comprador y resumen del pedido.” |
| 7 | **Confirmación de pedido** | `/orders/DEMO-...` | Completar la compra DEMO con `demo.capturas@example.com` | Banner “Pedido confirmado”, aviso DEMO, número de pedido, fotografías adquiridas, subtotal y total | “Confirmación de pedido DEMO con número único y detalle de fotografías.” |
| 8 | **Biblioteca de compras** | `/library` | Consultar con `demo.capturas@example.com` | Campo de correo, tarjeta de pedido, estado DEMO, miniaturas/códigos de fotos y total | “Biblioteca de compras consultable por correo con pedidos y fotografías adquiridas.” |
| 9 | **Dashboard del fotógrafo** | `/photographer` | Entrar al modo DEMO | Badge “Modo fotógrafo · DEMO”, aviso de que no es autenticación real, métricas reales (eventos, fotos, disponibles, no disponibles, valor publicado) y eventos recientes | “Dashboard del fotógrafo en modo DEMO con métricas derivadas de los datos reales.” |
| 10 | **Creación de evento** | `/photographer/events/new` | Completar el formulario con datos ficticios | Formulario: nombre, categoría, ubicación, fecha/hora, estado y descripción; botones Cancelar/Crear | “Formulario de creación de evento del panel del fotógrafo (DEMO).” |
| 11 | **Carga y gestión de fotos** | `/photographer/photos/upload` y `/photographer/photos` | Seleccionar 1–2 imágenes, mostrar previews y precio; luego mostrar la gestión con filtros | Selector de evento, precio, previews de archivos; y en gestión: filtros por evento/disponibilidad, edición de precio y eliminación | “Carga real de fotografías con previews y gestión de precio/disponibilidad en modo DEMO.” |

> La captura 7 y 8 pueden presentarse juntas si el formato del documento lo requiere; se mantienen separadas para mayor claridad.

---

## 3. Capturas opcionales (refuerzan la evidencia)

| # | Captura | Cómo obtenerla | Valor para el capítulo |
|---|---|---|---|
| A | **Búsqueda por código** | `/events` → escribir `DEMO-RUN-01` en “Código de fotografía” | Demuestra búsqueda por código contra la API |
| B | **Navegación móvil** | Viewport 390×844 → abrir menú | Demuestra diseño responsive |
| C | **404** | Abrir una ruta inexistente | Demuestra manejo de rutas |
| D | **Estado de error de API** | Detener el backend y recargar `/events` | Demuestra `ErrorState` y reintento |
| E | **Terminal de pruebas** | Ejecutar `npm run test:unit`, `npm run test:e2e`, `npm run test:backend` | Evidencia de pruebas reales |
| F | **Build de producción** | Ejecutar `npm run build` y `npm start`; mostrar la app en `:4000` | Evidencia de build/servido de producción local |

---

## 4. Checklist de calidad de las capturas

- [ ] Mostrar la **URL** o el contexto de navegación (barra del navegador) cuando aporte.
- [ ] Mantener visible la identificación **DEMO** (badges, textos, prefijo `DEMO-`).
- [ ] No usar datos personales reales; usar el correo DEMO sugerido.
- [ ] Usar un conjunto de datos consistente (seed recién cargado).
- [ ] No recortar de forma que se oculte el aviso de demostración.
- [ ] Incluir al menos una captura móvil.
- [ ] Guardar las imágenes en `docs/capturas/` con nombres como `01-landing.png`, `02-exploracion.png`, etc.
- [ ] Registrar fecha y entorno de las capturas (por ejemplo, “noviembre de 2026, Windows 11, Chromium”).

---

## 5. Qué NO afirmar en el capítulo 7

- No afirmar que los eventos DEMO ocurrieron realmente.
- No presentar las imágenes como fotografías de eventos reales.
- No afirmar que hubo participantes, encuestas, testimonios, ventas, ingresos o resultados de validación: **no se han realizado**.
- No presentar la compra DEMO como un pago real.
- No presentar el modo fotógrafo como autenticación real.
- No afirmar un despliegue en hosting: **solo se comprobó el build y la ejecución local**.
- No reportar porcentajes, métricas de uso o mejoras derivadas de validación sin evidencia real.

---

## 6. Relación con las pruebas ejecutadas

Evidencia técnica disponible (noviembre de 2026):

- `npm run test:unit`: 3 archivos, 8 tests.
- `npm run test:e2e`: 4 tests (deportista, código, fotógrafo, responsive) con consola sin errores.
- `npm run test:backend`: persistencia OK; demo 31; eventos 24; fotos 33; pedidos 36.
- `npm run build`: compilación correcta de server y client.
- `npm start`: Express sirve API, `/uploads` y `client/dist`.

Estos resultados pueden citarse como **pruebas técnicas ejecutadas**, sin confundirlos con **validación con usuarios reales**, que sigue pendiente.
