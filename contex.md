RUTA 04 --- CONTEXT.md
Documento permanente de contexto para cualquier IA que trabaje en este
repositorio. Leer antes de modificar código.
Identidad
Ruta 04 es un MVP académico de marketplace de fotografía deportiva.
Conecta deportistas que desean encontrar y adquirir fotografías de
eventos con fotógrafos que necesitan organizar, publicar y comercializar
su contenido.

Propuesta de comunicación: "Tu carrera. Tu momento. Tu fotografía."
Problema
En carreras, maratones, competencias de ciclismo y otros eventos, los
participantes pueden tener dificultades para encontrar sus fotografías
entre galerías desorganizadas y grandes volúmenes de archivos. Los
fotógrafos, a su vez, necesitan organizar, publicar, administrar y
vender sus imágenes con menos trabajo manual.

Causas: carga manual, galerías desorganizadas, búsqueda difícil y
procesos de compra/entrega fragmentados.

Consecuencias: pérdida de tiempo, mala experiencia de compra, menor
eficiencia del fotógrafo y oportunidades comerciales perdidas.
Usuarios
1. Deportistas y participantes: buscan, visualizan y adquieren
   fotografías de eventos.
2. Fotógrafos deportivos: cargan, organizan, publican y venden
   fotografías.
3. Organizadores: pueden beneficiarse de una distribución
   centralizada. El MVP prioriza deportistas y fotógrafos; no requiere
   un portal independiente para organizadores.
Objetivo y flujo principal
Demostrar este ciclo funcional: 1. El fotógrafo crea o administra un
evento. 2. Carga fotografías y las asocia al evento. 3. Las imágenes
quedan disponibles en una galería. 4. El deportista explora o busca el
evento. 5. Consulta y amplía fotografías. 6. Selecciona imágenes y las
agrega al carrito. 7. Completa una compra de demostración. 8. Consulta
las fotografías adquiridas.
Alcance incluido
Deportista
- Landing page.
- Exploración y búsqueda de eventos.
- Filtros básicos por deporte.
- Detalle de evento y galería.
- Visualización ampliada (lightbox).
- Búsqueda por código de fotografía, si los datos lo permiten.
- Carrito persistente.
- Checkout DEMO.
- Consulta de pedidos y fotografías adquiridas.
Fotógrafo
- Acceso mediante modo de demostración.
- Dashboard básico con datos existentes.
- Crear, listar, editar y eliminar eventos.
- Cargar una o varias fotografías.
- Asociar imágenes a eventos.
- Editar precios y disponibilidad.
- Consultar y eliminar fotografías.
Datos de demostración
- Al menos 4 eventos ficticios.
- 3 categorías deportivas o más.
- Al menos 20 fotografías.
- Precios variados.
- Identificar claramente los datos como DEMO. No afirmar que los
  eventos ficticios ocurrieron realmente.
Fuera del alcance
No implementar salvo solicitud expresa: - Reconocimiento facial o
biométrico. - IA para identificar deportistas. - Aplicación móvil
nativa. - Pagos reales o pasarelas de pago. - Autenticación completa o
recuperación de contraseñas. - Roles empresariales complejos. -
Comisiones, facturación o analítica avanzada. - Integraciones externas
con organizadores. - Microservicios, Kubernetes o infraestructura
innecesaria.
Principios técnicos
- Inspeccionar el repositorio antes de modificarlo.
- Reutilizar tecnologías, componentes, APIs y arquitectura existentes.
- No crear un segundo backend, base de datos o estructura paralela sin
  justificación.
- Preferir una arquitectura monolítica sencilla.
- Si el repositorio está vacío, considerar React, TypeScript y Vite
  para el frontend; elegir backend y persistencia según el
  diagnóstico.
- SQLite y almacenamiento local son opciones posibles para una demo si
  encajan, documentando sus límites.
- Persistir eventos, fotografías, carrito y pedidos DEMO.
- Validar en backend precios y disponibilidad al crear pedidos.
- Mantener secretos fuera del código.
- Evitar dependencias innecesarias y mantener tipado correcto.
La arquitectura definitiva se decide después de inspeccionar el
repositorio; no debe asumirse por adelantado.
Integridad y veracidad
- No inventar usuarios, ventas, ingresos, encuestas, testimonios ni
  resultados de validación.
- No presentar un pago simulado como pago real.
- No presentar el selector de modo como autenticación real.
- No presentar imágenes de demostración como fotografías de eventos
  reales.
- No afirmar que una prueba, build o despliegue fue exitoso si no se
  ejecutó.
- Distinguir entre implementado, pendiente y propuesto.
Criterios de aceptación
Flujo deportista: evento → galería → visualizar fotografía → carrito
→ compra DEMO → consultar compra.

Flujo fotógrafo: modo fotógrafo → crear evento → cargar fotografías
→ asociarlas al evento → administrar galería.

Además: búsqueda funcional, persistencia, formularios validados,
ausencia de botones principales inertes, diseño responsive, build
comprobado e instrucciones de ejecución.
Contexto académico
El MVP será evidencia para el capítulo 7 del trabajo académico: -
Descripción del MVP. - Características y funcionalidades. - Diseño y
desarrollo. - Tecnologías y arquitectura. - Capturas y evidencias. -
Validación con participantes reales. - Resultados y opiniones reales. -
Mejoras derivadas de la validación.

No redactar resultados de validación antes de realizar pruebas reales.
Forma de trabajo de la IA
- Ser precisa y conservadora con los cambios.
- Inspeccionar archivos relacionados antes de editarlos.
- Utilizar Smart commits para cada implementacion que hagamos, el usuario te indicara cuando realizar push 
- Trabajar en incrementos pequeños.
- No reescribir archivos completos si basta un cambio localizado.
- No adelantarse a fases no solicitadas.
- No agregar funcionalidades fuera del alcance.
- Ejecutar pruebas relevantes y reportar resultados reales.
- Resolver mediante inspección antes de preguntar, salvo decisiones
  que requieran al usuario.
- Al terminar cada tarea, informar archivos modificados,
  comportamiento implementado, pruebas ejecutadas y pendientes.
Prioridad absoluta: completar correctamente los dos flujos
principales antes de ampliar el producto.