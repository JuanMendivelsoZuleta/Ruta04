import type { AddressInfo } from "node:net";
import { app } from "../app";
import { prisma } from "../lib/prisma";

/**
 * Prueba de integración real de fotografías: subida multipart con archivos
 * físicos, servido estático, consulta, edición y eliminación (registro + archivo).
 */

let passed = 0;
let failed = 0;

function check(condition: boolean, message: string, received?: unknown): void {
  if (condition) {
    passed += 1;
    console.log(`  ok - ${message}`);
  } else {
    failed += 1;
    const suffix = received === undefined ? "" : ` (recibido: ${JSON.stringify(received)})`;
    console.error(`  FALLO - ${message}${suffix}`);
  }
}

// PNG 1x1 válido en base64
const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

type ApiResponse = { status: number; body: unknown };
type UploadFile = { content: Buffer; filename: string; type: string };
type PhotoRow = {
  id: string;
  eventId: string;
  storagePath: string;
  code: string;
  price: number;
  available: boolean;
};

async function run(): Promise<void> {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const { port } = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}`;

  const unique = Date.now();
  const eventName = `TEST Fotos ${unique}`;
  let eventId: string | undefined;

  const request = async (
    method: string,
    urlPath: string,
    body?: unknown,
  ): Promise<ApiResponse> => {
    const response = await fetch(`${base}${urlPath}`, {
      method,
      headers:
        body === undefined
          ? { Connection: "close" }
          : { "Content-Type": "application/json", Connection: "close" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : undefined };
  };

  const upload = async (
    targetEventId: string,
    fields: Record<string, string>,
    files: UploadFile[],
  ): Promise<ApiResponse> => {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      form.append(key, value);
    }
    for (const file of files) {
      form.append("files", new Blob([new Uint8Array(file.content)], { type: file.type }), file.filename);
    }
    const response = await fetch(`${base}/api/events/${targetEventId}/photos`, {
      method: "POST",
      headers: { Connection: "close" },
      body: form,
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : undefined };
  };

  try {
    console.log("== Pruebas de integración: fotografías ==\n");

    const health = await request("GET", "/api/health");
    check(health.status === 200, "GET /api/health responde 200", health.status);

    // Crear evento contenedor
    const createdEvent = await request("POST", "/api/events", {
      name: eventName,
      sportCategory: "CYCLING",
      location: "Pista de prueba",
      date: "2026-07-01T13:00:00.000Z",
    });
    const eventBody = createdEvent.body as { data?: { id?: string } };
    eventId = eventBody?.data?.id;
    check(createdEvent.status === 201 && typeof eventId === "string", "evento contenedor creado (201)");

    // 1. Subida múltiple (2 PNG) con precio
    const uploadFiles: UploadFile[] = [
      { content: PNG_BYTES, filename: "foto-uno.png", type: "image/png" },
      { content: PNG_BYTES, filename: "foto-dos.png", type: "image/png" },
    ];
    const batch = await upload(eventId!, { price: "15000" }, uploadFiles);
    const batchBody = batch.body as { data?: PhotoRow[]; count?: number };
    const batchPhotos = batchBody?.data ?? [];
    check(batch.status === 201 && batchBody?.count === 2, "subida múltiple de 2 fotos responde 201", batch.status);
    check(
      new Set(batchPhotos.map((photo) => photo.code)).size === batchPhotos.length,
      "cada foto recibe un código único",
    );
    check(
      batchPhotos.every((photo) => photo.price === 15000 && photo.available === true),
      "precio y disponibilidad guardados correctamente",
    );
    check(
      batchPhotos.every((photo) => photo.storagePath.startsWith("https://")),
      "storagePath es una URL pública de Cloudinary",
    );

    // 2. Galería del evento y listados
    const gallery = await request("GET", `/api/events/${eventId}/photos`);
    const galleryBody = gallery.body as { count?: number };
    check(gallery.status === 200 && galleryBody?.count === 2, "GET galería del evento devuelve 2 fotos", galleryBody?.count);

    const listByEvent = await request("GET", `/api/photos?eventId=${eventId}`);
    const listByEventBody = listByEvent.body as { count?: number };
    check(listByEvent.status === 200 && listByEventBody?.count === 2, "GET /api/photos?eventId filtra por evento", listByEventBody?.count);

    const listAvailable = await request("GET", `/api/photos?eventId=${eventId}&available=true`);
    const listAvailableBody = listAvailable.body as { count?: number };
    check(listAvailable.status === 200 && listAvailableBody?.count === 2, "filtro available=true funciona", listAvailableBody?.count);

    // 3. Consulta por ID
    const firstPhoto = batchPhotos[0];
    const detail = await request("GET", `/api/photos/${firstPhoto.id}`);
    const detailBody = detail.body as { data?: PhotoRow };
    check(detail.status === 200 && detailBody?.data?.id === firstPhoto.id, "GET /api/photos/:id responde 200");

    // 4. Archivo servido desde el servidor
    const served = await fetch(firstPhoto.storagePath);
    const servedBuffer = Buffer.from(await served.arrayBuffer());
    check(served.status === 200, "la imagen se sirve desde Cloudinary", served.status);
    check(
      served.headers.get("content-type")?.startsWith("image/") ?? false,
      "la imagen se sirve con content-type image/*",
      served.headers.get("content-type"),
    );
    check(servedBuffer.length > 0, "el contenido de la imagen no está vacío");

    // 5. Código explícito y unicidad
    const explicit = await upload(
      eventId!,
      { price: "22000", code: "mi-codigo-1" },
      [{ content: PNG_BYTES, filename: "foto-tres.png", type: "image/png" }],
    );
    const explicitBody = explicit.body as { data?: PhotoRow[] };
    check(
      explicit.status === 201 && explicitBody?.data?.[0]?.code === "MI-CODIGO-1",
      "código explícito se normaliza y guarda",
      explicitBody?.data?.[0]?.code,
    );

    const duplicate = await upload(
      eventId!,
      { price: "1000", code: "MI-CODIGO-1" },
      [{ content: PNG_BYTES, filename: "duplicada.png", type: "image/png" }],
    );
    check(duplicate.status === 409, "código duplicado responde 409", duplicate.status);

    // 6. Validación de tipo y tamaño
    const invalidType = await upload(
      eventId!,
      { price: "1000" },
      [{ content: Buffer.from("no soy una imagen"), filename: "archivo.txt", type: "text/plain" }],
    );
    check(invalidType.status === 400, "archivo .txt responde 400", invalidType.status);

    const gif = await upload(
      eventId!,
      { price: "1000" },
      [{ content: Buffer.from("GIF89a"), filename: "archivo.gif", type: "image/gif" }],
    );
    check(gif.status === 400, "archivo .gif responde 400", gif.status);

    const oversized = await upload(
      eventId!,
      { price: "1000" },
      [{ content: Buffer.alloc(5 * 1024 * 1024 + 1024, 0x89), filename: "grande.png", type: "image/png" }],
    );
    check(oversized.status === 400, "archivo >5MB responde 400", oversized.status);

    // 7. Evento inexistente -> 404 y sin huérfanos
    const missingEvent = await upload(
      "evento-no-existe",
      { price: "1000" },
      [{ content: PNG_BYTES, filename: "huerfana.png", type: "image/png" }],
    );
    check(missingEvent.status === 404, "subida a evento inexistente responde 404", missingEvent.status);

    // 8. Edición de precio y disponibilidad
    const updated = await request("PATCH", `/api/photos/${firstPhoto.id}`, {
      price: 99000,
      available: false,
    });
    const updatedBody = updated.body as { data?: PhotoRow };
    check(
      updated.status === 200 && updatedBody?.data?.price === 99000 && updatedBody?.data?.available === false,
      "PATCH actualiza precio y disponibilidad",
      { price: updatedBody?.data?.price, available: updatedBody?.data?.available },
    );

    const badPrice = await request("PATCH", `/api/photos/${firstPhoto.id}`, { price: -5 });
    check(badPrice.status === 400, "PATCH con precio inválido responde 400", badPrice.status);

    const emptyUpdate = await request("PATCH", `/api/photos/${firstPhoto.id}`, {});
    check(emptyUpdate.status === 400, "PATCH vacío responde 400", emptyUpdate.status);

    const updateMissing = await request("PATCH", "/api/photos/no-existe", { price: 1000 });
    check(updateMissing.status === 404, "PATCH de foto inexistente responde 404", updateMissing.status);

    // 9. Eliminar foto (registro + archivo)
    const deleted = await request("DELETE", `/api/photos/${firstPhoto.id}`);
    check(deleted.status === 204, "DELETE /api/photos/:id responde 204", deleted.status);

    const deleteAgain = await request("DELETE", `/api/photos/${firstPhoto.id}`);
    check(deleteAgain.status === 404, "DELETE repetido responde 404", deleteAgain.status);

    const galleryAfterDelete = await request("GET", `/api/events/${eventId}/photos`);
    const galleryAfterDeleteBody = galleryAfterDelete.body as { count?: number };
    check(
      galleryAfterDeleteBody?.count === 2,
      "la galería queda con 2 fotos tras eliminar una",
      galleryAfterDeleteBody?.count,
    );

    // 10. Eliminar evento limpia archivos restantes (cascada + disco)
    const deletedEvent = await request("DELETE", `/api/events/${eventId}`);
    check(deletedEvent.status === 204, "DELETE del evento responde 204", deletedEvent.status);
    eventId = undefined;
  } finally {
    if (eventId) {
      await request("DELETE", `/api/events/${eventId}`).catch(() => undefined);
    }
    await prisma.photo
      .deleteMany({ where: { event: { name: eventName } } })
      .catch(() => undefined);
    await prisma.event.deleteMany({ where: { name: eventName } }).catch(() => undefined);

    await new Promise<void>((resolve) => {
      server.close(() => resolve());
      server.closeAllConnections();
    });
    await prisma.$disconnect();
  }

  console.log(`\nRESULTADO: ${passed} ok, ${failed} fallidas.`);
  if (failed > 0) {
    process.exitCode = 1;
  }
}

run().catch((error: unknown) => {
  console.error("\nRESULTADO: la prueba de integración de fotos falló.");
  console.error(error);
  process.exitCode = 1;
});
