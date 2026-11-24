RUTA 04 --- PLAN SECUENCIAL DE DESARROLLO DEL MVP
Enviar los prompts en orden, uno por uno. No avanzar hasta verificar la
fase anterior. Leer primero CONTEXT.md.
Modelos y esfuerzo
  Modelo                  Uso                     Esfuerzo
  DeepSeek V4 Pro         Arquitectura, modelo de Alto
datos, almacenamiento,
pedidos e integración
compleja                

  DeepSeek V4.1 Flash     CRUD, seed data, tareas Medio
Free                    acotadas y
documentación           
DeepSeek Flash 2017     Correcciones pequeñas,  Bajo
textos, estilos y
documentación puntual
Reservar V4 Pro para decisiones estructurales. No usar Flash 2017 para
diseñar arquitectura.
Fase 0 --- Inspección
Prompt 0: diagnóstico
Modelo: DeepSeek V4 Pro · Esfuerzo: Alto
Actúa como Senior Software Architect. Lee CONTEXT.md.

En esta tarea NO implementes funcionalidades ni modifiques archivos.

Inspecciona el repositorio y diagnostica:
1. Estructura de carpetas.
2. Frameworks, lenguajes y dependencias.
3. Frontend y backend existentes.
4. Base de datos, ORM y migraciones.
5. APIs, rutas y modelos.
6. Almacenamiento de archivos.
7. Componentes y estilos reutilizables.
8. Scripts para ejecutar, probar y construir.
9. Errores y riesgos técnicos.

Respeta las tecnologías existentes. No crees otro backend o base de datos si ya existe una solución reutilizable.

Entrega arquitectura actual, arquitectura mínima recomendada, elementos reutilizables, cambios necesarios y orden de implementación. No escribas código todavía.
Fase 1 --- Backend
Prompt 1: modelo de datos y persistencia
Modelo: DeepSeek V4 Pro · Esfuerzo: Alto
Implementa el modelo de datos y persistencia del MVP según el diagnóstico aprobado. Revisa y reutiliza modelos existentes.

Entidades:
- Event: id, name, sportCategory, location, date, description, coverImage, status, createdAt, updatedAt.
- Photo: id, eventId, imageUrl o storagePath, code, price, available, createdAt.
- Order: id, orderNumber, customerName, customerEmail, subtotal, total, status, createdAt.
- OrderItem: id, orderId, photoId, price.

Relaciones: Event tiene muchas Photo; Photo pertenece a Event; Order tiene muchos OrderItem; OrderItem referencia una Photo.

Implementa relaciones, restricciones, validaciones básicas y migraciones o mecanismo equivalente. No agregues campos innecesarios. No implementes autenticación, pagos ni funciones avanzadas.

Ejecuta migraciones y comprueba conexión y consultas. Informa archivos modificados y resultados reales.
Prompt 2: CRUD de eventos
Modelo: DeepSeek V4.1 Flash Free · Esfuerzo: Medio
Implementa en el backend la gestión de eventos usando los modelos existentes:
- Crear, listar, consultar por ID, editar y eliminar.
- Buscar por nombre o ubicación.
- Filtrar por categoría deportiva.

Valida datos y existencia, maneja errores y usa códigos HTTP adecuados. Mantén el tipado, evita duplicación y dependencias innecesarias. No modifiques el frontend.

Prueba los endpoints y entrega rutas, ejemplos de solicitudes/respuestas, archivos modificados y resultados.
Prompt 3: fotografías y almacenamiento
Modelo: DeepSeek V4 Pro · Esfuerzo: Alto
Implementa la gestión real de fotografías. Revisa primero los modelos y el almacenamiento existentes.

Funciones:
- Subir una o varias fotografías.
- Asociarlas a un evento.
- Asignar precio y código único.
- Listar, consultar y filtrar por evento.
- Editar precio y disponibilidad.
- Eliminar fotografías.

Reutiliza almacenamiento existente. Si no existe, implementa almacenamiento local apropiado para el MVP, guardando físicamente los archivos y registrando sus rutas en la base de datos. Sirve las imágenes desde el servidor.

Valida JPG, JPEG, PNG y WEBP, tamaño y nombres de archivo. No uses servicios cloud ni APIs externas.

La subida debe guardar realmente los archivos. Prueba subida, consulta, asociación, edición y eliminación. Documenta limitaciones.
Prompt 4: pedidos DEMO
Modelo: DeepSeek V4 Pro · Esfuerzo: Alto
Implementa pedidos DEMO. No integres pasarelas ni proceses dinero.

El backend debe recibir datos básicos del comprador e IDs de fotografías; consultar precios en la base de datos; verificar existencia y disponibilidad; evitar duplicados; calcular subtotal y total en backend; generar número único; guardar Order y OrderItems; y permitir consultar pedidos y fotografías adquiridas por correo.

No confíes en precios enviados por frontend. Identifica pedidos como DEMO. No implementes autenticación. Los pedidos deben persistir tras reiniciar el servidor.

Prueba selección → creación → persistencia → consulta. Documenta endpoints y resultados reales.
Prompt 5: datos de demostración y revisión
Modelo: DeepSeek V4.1 Flash Free · Esfuerzo: Medio
Prepara datos DEMO:
- 4 eventos ficticios.
- 3 categorías deportivas o más.
- Al menos 20 fotografías.
- Precios variados.
- Datos útiles para búsquedas y filtros.

Identifica eventos como DEMO. No afirmes que ocurrieron realmente. Usa fotografías deportivas apropiadas, evita repetir la misma imagen y añade fallbacks si las imágenes externas fallan.

Verifica CRUD de eventos, carga y consulta de fotos, asociaciones, búsquedas, pedidos DEMO, consulta de compras y persistencia. Corrige solo errores del alcance.

Entrega endpoints, comandos de inicio, carga de datos, pruebas ejecutadas y pendientes.
Punto de control: no comenzar frontend hasta que eventos,
fotografías y pedidos puedan probarse independientemente.
Fase 2 --- Frontend
Prompt 6: sistema visual y navegación
Modelo: DeepSeek V4 Pro · Esfuerzo: Alto
Comienza el frontend. Revisa y respeta tecnologías y estructura existentes. No modifiques backend.

Prepara rutas, layout, navegación, componentes reutilizables, botones, inputs, tarjetas, notificaciones y estados loading/empty/error.

Dirección visual: marketplace profesional de fotografía deportiva; diseño moderno y limpio; fotografías protagonistas; negro o azul oscuro, blanco, grises y acento lima/verde; tipografía e iconografía consistentes; responsive.

No construyas todavía todas las funcionalidades. Deja una base visual coherente. Evita dashboards y elementos decorativos sin propósito.
Prompt 7: experiencia del deportista
Modelo: DeepSeek V4 Pro · Esfuerzo: Alto
Implementa la experiencia del deportista conectada a los endpoints reales. No sustituyas la API por datos estáticos.

Pantallas:
1. Landing con propuesta de valor, CTA, eventos y fotos destacadas.
2. Exploración de eventos con búsqueda y filtros.
3. Detalle de evento y galería.
4. Grid responsive, lightbox, precio y selección.
5. Carrito con miniaturas, eliminación, subtotal y total.
6. Checkout DEMO con validación.
7. Confirmación de pedido.
8. Biblioteca de compras consultable por correo.

Valida precios y disponibilidad en backend. No simules pago ni autenticación. Persiste carrito cuando corresponda. Maneja loading, errores y resultados vacíos. No dejes acciones principales inertes.

Prueba evento → galería → foto → carrito → compra DEMO → biblioteca.
Prompt 8: panel del fotógrafo
Modelo: DeepSeek V4.1 Flash Free · Esfuerzo: Medio
Implementa el panel del fotógrafo con el sistema visual y endpoints existentes. El acceso será un modo DEMO claramente identificado, no autenticación real.

Incluye dashboard con datos existentes; listado, creación, edición y eliminación de eventos; selección de archivos y previews; asociación a evento; asignación de precio; carga real al backend; listado y filtrado de fotos; edición de precio y disponibilidad; eliminación.

No inventes métricas ni guardes datos únicamente en estado visual. Usa API y persistencia. No agregues funciones avanzadas.

Prueba creación/edición/eliminación de eventos y carga/administración de fotografías.
Fase 3 --- Integración y calidad
Prompt 9: pruebas integrales
Modelo: DeepSeek V4 Pro · Esfuerzo: Alto
Revisa integralmente el MVP sin reescribir módulos completos ni rediseñar sin justificación.

Prueba flujo deportista: landing, búsqueda de eventos, galería, visualizar fotos, carrito, compra DEMO y consulta de compra.

Prueba flujo fotógrafo: modo DEMO, crear/editar evento, cargar fotos, asociarlas, consultar galería, modificar precio/disponibilidad y eliminar.

Comprueba persistencia, validaciones, errores, navegación, responsive, consola y build de producción. Corrige errores que bloqueen los flujos principales. No agregues funciones fuera del alcance.

Entrega pruebas realmente ejecutadas, resultados, errores corregidos, pendientes, comandos, limitaciones y estado real del build/deployment.
Fase 4 --- Documentación académica
Prompt 10: README y capítulo 7
Modelo: DeepSeek V4.1 Flash Free · Esfuerzo: Medio
Documenta el MVP a partir del código realmente implementado.

Actualiza README con descripción, objetivo, problemática, usuarios, funcionalidades, tecnologías, arquitectura, modelo de datos, estructura, requisitos, instalación, variables de entorno, ejecución, build, deployment, modo DEMO, limitaciones y funciones futuras.

Prepara lista de capturas para el capítulo 7:
- Landing.
- Exploración de eventos.
- Detalle y galería.
- Lightbox.
- Carrito.
- Checkout DEMO.
- Confirmación y biblioteca.
- Dashboard fotógrafo.
- Creación de evento.
- Carga y gestión de fotos.

No inventes participantes, encuestas, opiniones, resultados, ventas ni porcentajes. Separa lo implementado, pendiente y validaciones por realizar. No afirmes despliegue sin evidencia.
Reglas permanentes de ejecución
1. Enviar un prompt por vez.
2. Revisar cambios y ejecutar pruebas antes de avanzar.
3. Corregir errores de la fase actual primero.
4. Mantener el mismo repositorio y contexto.
5. No permitir que el agente implemente fases futuras sin autorización.
6. Usar Flash 2017 para correcciones pequeñas, no para arquitectura.
7. Ante una limitación, pedir explicación y solución mínima antes de
   ampliar alcance.
Criterio final
El MVP está listo para demostración cuando funcionen ambos recorridos:
- Deportista: evento → galería → fotografía → carrito → compra
  DEMO.
- Fotógrafo: crear evento → cargar fotografías → asociarlas →
  administrar galería.
El objetivo es un MVP funcional y validable, no una plataforma comercial
completa.