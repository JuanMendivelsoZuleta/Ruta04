import type { AddressInfo } from "node:net";
import { app } from "../app";
import { prisma } from "../lib/prisma";

/**
 * Prueba de integración real del CRUD de eventos sobre el servidor Express y
 * la base SQLite. Levanta la app en un puerto efímero, ejercita los endpoints
 * con fetch y limpia los datos creados.
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

type ApiResponse = { status: number; body: unknown };

async function run(): Promise<void> {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const { port } = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}`;

  const unique = Date.now();
  const eventName = `TEST Evento ${unique}`;
  const location = `Ciudad Test ${unique}`;
  let createdId: string | undefined;

  const request = async (
    method: string,
    path: string,
    body?: unknown,
  ): Promise<ApiResponse> => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers:
        body === undefined ? { Connection: "close" } : { "Content-Type": "application/json", Connection: "close" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : undefined };
  };

  try {
    console.log("== Pruebas de integración: CRUD de eventos ==\n");

    const health = await request("GET", "/api/health");
    const healthBody = health.body as { status?: string; database?: string };
    check(
      health.status === 200 && healthBody?.status === "ok" && healthBody?.database === "connected",
      "GET /api/health responde 200 y base conectada",
      health.status,
    );

    // Crear (201)
    const created = await request("POST", "/api/events", {
      name: eventName,
      sportCategory: "RUNNING",
      location,
      date: "2026-05-10T13:00:00.000Z",
      description: "Evento de prueba (no real)",
    });
    const createdBody = created.body as { data?: { id?: string; status?: string } };
    createdId = createdBody?.data?.id;
    check(created.status === 201, "POST /api/events responde 201", created.status);
    check(typeof createdId === "string", "la respuesta incluye id");
    check(createdBody?.data?.status === "ACTIVE", "status por defecto es ACTIVE", createdBody?.data?.status);

    // Validaciones de creación (400)
    const missingName = await request("POST", "/api/events", {
      sportCategory: "RUNNING",
      location,
      date: "2026-05-10T13:00:00.000Z",
    });
    check(missingName.status === 400, "POST sin name responde 400", missingName.status);
    const missingNameBody = missingName.body as { details?: unknown };
    check(Array.isArray(missingNameBody?.details), "error 400 incluye details");

    const badSport = await request("POST", "/api/events", {
      name: "Evento inválido",
      sportCategory: "FOOTBALL",
      location,
      date: "2026-05-10T13:00:00.000Z",
    });
    check(badSport.status === 400, "POST con sportCategory inválida responde 400", badSport.status);

    const badDate = await request("POST", "/api/events", {
      name: "Evento inválido",
      sportCategory: "RUNNING",
      location,
      date: "no-es-fecha",
    });
    check(badDate.status === 400, "POST con fecha inválida responde 400", badDate.status);

    const malformed = await fetch(`${base}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Connection: "close" },
      body: "{ json invalido",
    });
    check(malformed.status === 400, "POST con JSON malformado responde 400", malformed.status);

    // Listar
    const list = await request("GET", "/api/events");
    const listBody = list.body as { data?: Array<{ id: string }>; count?: number };
    check(list.status === 200, "GET /api/events responde 200", list.status);
    check(
      Array.isArray(listBody?.data) && listBody.data.some((e) => e.id === createdId),
      "el listado incluye el evento creado",
    );

    // Búsqueda por nombre (case-insensitive en SQLite)
    const byName = await request("GET", `/api/events?q=${encodeURIComponent(`evento ${unique}`)}`);
    const byNameBody = byName.body as { data?: Array<{ id: string }> };
    check(
      byName.status === 200 && Boolean(byNameBody?.data?.some((e) => e.id === createdId)),
      "búsqueda por nombre encuentra el evento (case-insensitive)",
    );

    // Búsqueda por ubicación
    const byLocation = await request(
      "GET",
      `/api/events?q=${encodeURIComponent(`ciudad test ${unique}`)}`,
    );
    const byLocationBody = byLocation.body as { data?: Array<{ id: string }> };
    check(
      byLocation.status === 200 && Boolean(byLocationBody?.data?.some((e) => e.id === createdId)),
      "búsqueda por ubicación encuentra el evento",
    );

    // Filtro por categoría
    const bySport = await request("GET", "/api/events?sport=RUNNING");
    const bySportBody = bySport.body as { data?: Array<{ id: string }> };
    check(
      bySport.status === 200 && Boolean(bySportBody?.data?.some((e) => e.id === createdId)),
      "filtro sport=RUNNING devuelve el evento",
    );

    const badFilter = await request("GET", "/api/events?sport=FOOTBALL");
    check(badFilter.status === 400, "filtro con sport inválido responde 400", badFilter.status);

    // Consultar por ID
    const detail = await request("GET", `/api/events/${createdId}`);
    const detailBody = detail.body as { data?: { id?: string } };
    check(detail.status === 200 && detailBody?.data?.id === createdId, "GET /api/events/:id responde 200");

    const notFound = await request("GET", "/api/events/no-existe");
    check(notFound.status === 404, "GET de evento inexistente responde 404", notFound.status);

    // Editar (parcial)
    const updated = await request("PATCH", `/api/events/${createdId}`, {
      name: `${eventName} editado`,
      status: "ARCHIVED",
    });
    const updatedBody = updated.body as { data?: { name?: string; status?: string } };
    check(
      updated.status === 200 && updatedBody?.data?.name === `${eventName} editado`,
      "PATCH actualiza el nombre",
    );
    check(updatedBody?.data?.status === "ARCHIVED", "PATCH actualiza el status");

    const updateMissing = await request("PATCH", "/api/events/no-existe", { name: "Inexistente" });
    check(updateMissing.status === 404, "PATCH de evento inexistente responde 404", updateMissing.status);

    const emptyUpdate = await request("PATCH", `/api/events/${createdId}`, {});
    check(emptyUpdate.status === 400, "PATCH sin campos responde 400", emptyUpdate.status);

    // Eliminar
    const idToDelete = createdId;
    const deleted = await request("DELETE", `/api/events/${idToDelete}`);
    check(deleted.status === 204, "DELETE /api/events/:id responde 204", deleted.status);

    const deleteAgain = await request("DELETE", `/api/events/${idToDelete}`);
    check(deleteAgain.status === 404, "DELETE repetido responde 404", deleteAgain.status);
    createdId = undefined;

    const afterDelete = await request("GET", "/api/events");
    const afterDeleteBody = afterDelete.body as { data?: Array<{ id: string }> };
    check(
      !afterDeleteBody?.data?.some((e) => e.id === idToDelete),
      "el evento eliminado ya no aparece en el listado",
    );
  } finally {
    if (createdId) {
      await prisma.event.deleteMany({ where: { id: createdId } }).catch(() => undefined);
    }
    await prisma.event
      .deleteMany({ where: { name: { startsWith: "TEST Evento" } } })
      .catch(() => undefined);

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
  console.error("\nRESULTADO: la prueba de integración falló.");
  console.error(error);
  process.exitCode = 1;
});
