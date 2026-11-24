import { readdirSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { PrismaClient } from "@prisma/client";
import { app } from "../app";
import { prisma } from "../lib/prisma";
import { UPLOAD_DIR } from "../lib/storage";

/**
 * Prueba de integración real de pedidos DEMO: selección de fotos, cálculo en
 * backend, validaciones, consulta por correo y persistencia tras cerrar y
 * reabrir la conexión a la base SQLite.
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

const PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

type ApiResponse = { status: number; body: unknown };
type PhotoRow = { id: string; code: string; price: number };
type OrderItemRow = { photoId: string; price: number; photo: PhotoRow };
type OrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  total: number;
  status: string;
  demo: boolean;
  items: OrderItemRow[];
};

function fileCount(): number {
  return readdirSync(UPLOAD_DIR).length;
}

async function run(): Promise<void> {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const { port } = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}`;

  const unique = Date.now();
  const eventName = `TEST Pedidos ${unique}`;
  const customerEmail = `comprador.${unique}@example.com`;
  const baselineFiles = fileCount();
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
    price: string,
    code: string,
    filename: string,
  ): Promise<PhotoRow> => {
    const form = new FormData();
    form.append("price", price);
    form.append("code", code);
    form.append("files", new Blob([new Uint8Array(PNG_BYTES)], { type: "image/png" }), filename);
    const response = await fetch(`${base}/api/events/${targetEventId}/photos`, {
      method: "POST",
      headers: { Connection: "close" },
      body: form,
    });
    const body = (await response.json()) as { data?: PhotoRow[] };
    if (response.status !== 201 || !body.data?.[0]) {
      throw new Error(`No se pudo subir la foto ${code} (status ${response.status})`);
    }
    return body.data[0];
  };

  try {
    console.log("== Pruebas de integración: pedidos DEMO ==\n");

    const health = await request("GET", "/api/health");
    check(health.status === 200, "GET /api/health responde 200", health.status);

    // Preparar evento y fotografías con precios distintos
    const createdEvent = await request("POST", "/api/events", {
      name: eventName,
      sportCategory: "TRIATHLON",
      location: "Circuito de prueba",
      date: "2026-09-01T13:00:00.000Z",
    });
    const eventBody = createdEvent.body as { data?: { id?: string } };
    eventId = eventBody?.data?.id;
    check(createdEvent.status === 201 && typeof eventId === "string", "evento contenedor creado (201)");

    const photo1 = await upload(eventId!, "12000", "ORD-P1", "pedido-1.png");
    const photo2 = await upload(eventId!, "18000", "ORD-P2", "pedido-2.png");
    const photo3 = await upload(eventId!, "5000", "ORD-P3", "pedido-3.png");
    const disable = await request("PATCH", `/api/photos/${photo3.id}`, { available: false });
    check(disable.status === 200, "tercera foto marcada como no disponible", disable.status);

    // Validaciones de entrada
    const missingName = await request("POST", "/api/orders", {
      customerEmail,
      photoIds: [photo1.id],
    });
    check(missingName.status === 400, "pedido sin customerName responde 400", missingName.status);

    const badEmail = await request("POST", "/api/orders", {
      customerName: "Comprador Demo",
      customerEmail: "no-es-correo",
      photoIds: [photo1.id],
    });
    check(badEmail.status === 400, "pedido con correo inválido responde 400", badEmail.status);

    const emptySelection = await request("POST", "/api/orders", {
      customerName: "Comprador Demo",
      customerEmail,
      photoIds: [],
    });
    check(emptySelection.status === 400, "pedido sin fotos responde 400", emptySelection.status);

    const missingPhoto = await request("POST", "/api/orders", {
      customerName: "Comprador Demo",
      customerEmail,
      photoIds: ["foto-no-existe"],
    });
    const missingPhotoBody = missingPhoto.body as { details?: string[] };
    check(
      missingPhoto.status === 400 && Boolean(missingPhotoBody?.details?.includes("foto-no-existe")),
      "foto inexistente responde 400 con detalle",
      missingPhoto.status,
    );

    const unavailable = await request("POST", "/api/orders", {
      customerName: "Comprador Demo",
      customerEmail,
      photoIds: [photo3.id],
    });
    check(unavailable.status === 409, "foto no disponible responde 409", unavailable.status);

    // Evitar duplicados: misma foto repetida en la selección
    const dedupe = await request("POST", "/api/orders", {
      customerName: "Comprador Demo",
      customerEmail,
      photoIds: [photo1.id, photo1.id, photo2.id],
    });
    const dedupeBody = dedupe.body as { data?: OrderRow };
    const dedupeOrder = dedupeBody?.data;
    check(dedupe.status === 201, "pedido con IDs repetidos responde 201", dedupe.status);
    check(dedupeOrder?.items.length === 2, "la misma foto no se duplica en el pedido", dedupeOrder?.items.length);
    check(dedupeOrder?.subtotal === 30000, "subtotal deduplicado = 30000", dedupeOrder?.subtotal);

    // Restricción única a nivel de BD
    let uniqueEnforced = false;
    try {
      await prisma.orderItem.create({
        data: { orderId: dedupeOrder!.id, photoId: photo1.id, price: 1 },
      });
    } catch {
      uniqueEnforced = true;
    }
    check(uniqueEnforced, "la BD rechaza una foto duplicada en el mismo pedido");

    // Pedido principal con precios falsos enviados por el cliente
    const main = await request("POST", "/api/orders", {
      customerName: "Comprador Demo",
      customerEmail,
      photoIds: [photo1.id, photo2.id],
      subtotal: 1,
      total: 1,
      prices: [1, 1],
      status: "PAGADO",
    });
    const mainBody = main.body as { data?: OrderRow };
    const order = mainBody?.data;
    check(main.status === 201, "POST /api/orders responde 201", main.status);
    check(order?.orderNumber.startsWith("DEMO-") ?? false, "el número de pedido lleva prefijo DEMO-", order?.orderNumber);
    check(order?.demo === true, "la respuesta identifica el pedido como demo");
    check(order?.status === "COMPLETED", "estado del pedido es COMPLETED (flujo DEMO)", order?.status);
    check(order?.customerEmail === customerEmail, "correo normalizado se guarda");
    check(order?.subtotal === 30000, "subtotal calculado en backend = 30000", order?.subtotal);
    check(order?.total === 30000, "total calculado en backend = 30000", order?.total);
    check(order?.items.length === 2, "se guardaron 2 OrderItems", order?.items.length);
    check(
      Boolean(order?.items.every((item) => item.price === item.photo.price)),
      "el precio de cada item proviene de la BD",
    );

    const acquiredCodes = order?.items.map((item) => item.photo.code).sort() ?? [];
    check(
      acquiredCodes.length === 2 && acquiredCodes[0] === "ORD-P1" && acquiredCodes[1] === "ORD-P2",
      "el pedido incluye las fotografías adquiridas",
      acquiredCodes,
    );

    // Consulta por correo
    const byEmail = await request("GET", `/api/orders?email=${encodeURIComponent(customerEmail)}`);
    const byEmailBody = byEmail.body as { data?: OrderRow[]; count?: number };
    check(byEmail.status === 200 && (byEmailBody?.count ?? 0) >= 2, "consulta por correo devuelve los pedidos", byEmailBody?.count);
    check(
      Boolean(byEmailBody?.data?.some((o) => o.orderNumber === order?.orderNumber)),
      "la consulta por correo incluye el pedido principal",
    );

    const upperEmail = await request("GET", `/api/orders?email=${encodeURIComponent(customerEmail.toUpperCase())}`);
    const upperEmailBody = upperEmail.body as { count?: number };
    check(upperEmail.status === 200 && (upperEmailBody?.count ?? 0) >= 2, "la consulta por correo es insensible a mayúsculas", upperEmailBody?.count);

    const missingEmail = await request("GET", "/api/orders");
    check(missingEmail.status === 400, "consulta sin email responde 400", missingEmail.status);

    const invalidEmail = await request("GET", "/api/orders?email=no-es-correo");
    check(invalidEmail.status === 400, "consulta con email inválido responde 400", invalidEmail.status);

    // Consulta por número de pedido
    const byNumber = await request("GET", `/api/orders/${order?.orderNumber}`);
    check(byNumber.status === 200, "GET /api/orders/:orderNumber responde 200", byNumber.status);

    const unknownOrder = await request("GET", "/api/orders/DEMO-NO-EXISTE");
    check(unknownOrder.status === 404, "pedido inexistente responde 404", unknownOrder.status);

    // Persistencia: cerrar la conexión y leer con un cliente nuevo
    await prisma.$disconnect();
    const fresh = new PrismaClient();
    const persisted = await fresh.order.findUnique({
      where: { orderNumber: order!.orderNumber },
      include: { items: { include: { photo: true } } },
    });
    check(persisted !== null, "el pedido persiste tras cerrar la conexión");
    check(persisted?.total === 30000, "el total persistido es 30000", persisted?.total);
    check(persisted?.items.length === 2, "los OrderItems persisten", persisted?.items.length);
    await fresh.$disconnect();

    const afterReconnect = await request("GET", `/api/orders?email=${encodeURIComponent(customerEmail)}`);
    const afterReconnectBody = afterReconnect.body as { count?: number };
    check(afterReconnect.status === 200 && (afterReconnectBody?.count ?? 0) >= 2, "el pedido se consulta tras reconectar");

    // Limpieza controlada (pedidos primero para liberar la restricción de fotos)
    await prisma.order.deleteMany({ where: { customerEmail } });
    const deletedEvent = await request("DELETE", `/api/events/${eventId}`);
    check(deletedEvent.status === 204, "evento de prueba eliminado (204)", deletedEvent.status);
    eventId = undefined;
    check(fileCount() === baselineFiles, "no quedan archivos huérfanos", fileCount());

    const remainingOrders = await prisma.order.count({ where: { customerEmail } });
    check(remainingOrders === 0, "no quedan pedidos de prueba", remainingOrders);
  } finally {
    await prisma.order.deleteMany({ where: { customerEmail } }).catch(() => undefined);
    if (eventId) {
      await request("DELETE", `/api/events/${eventId}`).catch(() => undefined);
    }
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
  console.error("\nRESULTADO: la prueba de integración de pedidos falló.");
  console.error(error);
  process.exitCode = 1;
});
