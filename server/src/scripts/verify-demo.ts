import type { AddressInfo } from "node:net";
import { PrismaClient } from "@prisma/client";
import { app } from "../app";
import { prisma } from "../lib/prisma";

/**
 * Verificación integral de los datos DEMO y de los flujos del backend:
 * eventos, fotografías, búsquedas, filtros, pedido DEMO, consulta de compras
 * y persistencia. Solo elimina el pedido creado para la prueba; conserva el
 * seed para la demostración.
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

type EventRow = {
  id: string;
  name: string;
  sportCategory: string;
  location: string;
  coverImage: string | null;
  status: string;
};
type PhotoRow = {
  id: string;
  eventId: string;
  storagePath: string;
  code: string;
  price: number;
  available: boolean;
};
type OrderItemRow = { photoId: string; price: number; photo: PhotoRow };
type OrderRow = {
  orderNumber: string;
  subtotal: number;
  total: number;
  demo: boolean;
  items: OrderItemRow[];
};

type ApiResponse = { status: number; body: unknown };

async function run(): Promise<void> {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const { port } = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}`;
  const email = `verify.demo.${Date.now()}@example.com`;

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

  try {
    console.log("== Verificación de datos DEMO ==\n");

    const demoEventCount = await prisma.event.count({
      where: { id: { startsWith: "demo-event-" } },
    });
    const demoPhotoCount = await prisma.photo.count({
      where: { id: { startsWith: "demo-photo-" } },
    });
    check(demoEventCount === 4, "4 eventos DEMO en la BD", demoEventCount);
    check(demoPhotoCount >= 20, "al menos 20 fotografías DEMO en la BD", demoPhotoCount);

    const eventsRes = await request("GET", "/api/events");
    const events = ((eventsRes.body as { data?: EventRow[] }).data ?? []).filter((event) =>
      event.id.startsWith("demo-event-"),
    );
    check(eventsRes.status === 200 && events.length === 4, "GET /api/events incluye 4 eventos DEMO", events.length);
    check(
      new Set(events.map((event) => event.sportCategory)).size >= 3,
      "3 o más categorías deportivas",
      [...new Set(events.map((event) => event.sportCategory))],
    );
    check(events.every((event) => /DEMO/i.test(event.name)), "todos los eventos se identifican como DEMO");
    check(events.every((event) => event.status === "ACTIVE"), "todos los eventos DEMO están activos");

    const allPhotos: PhotoRow[] = [];
    for (const event of events) {
      const galleryRes = await request("GET", `/api/events/${event.id}/photos`);
      const photos = (galleryRes.body as { data?: PhotoRow[] }).data ?? [];
      check(
        galleryRes.status === 200 && photos.length === 6,
        `galería de ${event.name} tiene 6 fotos`,
        photos.length,
      );
      allPhotos.push(...photos);
    }
    check(allPhotos.length === 24, "24 fotografías en total", allPhotos.length);
    check(new Set(allPhotos.map((photo) => photo.code)).size === allPhotos.length, "todos los códigos son únicos");
    check(
      new Set(allPhotos.map((photo) => photo.price)).size >= 3,
      "precios variados",
      [...new Set(allPhotos.map((photo) => photo.price))],
    );
    check(
      allPhotos.some((photo) => photo.available) && allPhotos.some((photo) => !photo.available),
      "hay fotografías disponibles y no disponibles",
    );
    check(
      allPhotos.every((photo) => photo.storagePath.startsWith("https://")),
      "todas las imágenes tienen URL pública de Cloudinary",
    );

    for (const photo of allPhotos.slice(0, 4)) {
      const response = await fetch(photo.storagePath);
      check(
        response.status === 200 &&
          (response.headers.get("content-type") ?? "").startsWith("image/"),
        `imagen servida por HTTP: ${photo.code}`,
        response.status,
      );
    }

    const byLocation = await request("GET", `/api/events?q=${encodeURIComponent("Cundinamarca")}`);
    check(
      Boolean((byLocation.body as { data?: EventRow[] }).data?.some((event) => event.id === "demo-event-running")),
      "búsqueda por ubicación encuentra el evento de Bogotá",
    );

    const byName = await request("GET", `/api/events?q=${encodeURIComponent("Triatlón")}`);
    check(
      Boolean((byName.body as { data?: EventRow[] }).data?.some((event) => event.id === "demo-event-triathlon")),
      "búsqueda por nombre encuentra el triatlón",
    );

    const bySport = await request("GET", "/api/events?sport=CYCLING");
    const cyclingEvents = (bySport.body as { data?: EventRow[] }).data ?? [];
    check(
      bySport.status === 200 &&
        cyclingEvents.length > 0 &&
        cyclingEvents.every((event) => event.sportCategory === "CYCLING"),
      "filtro por categoría CYCLING",
      cyclingEvents.length,
    );

    const availablePhotos = allPhotos.filter((photo) => photo.available).slice(0, 2);
    const expectedSubtotal = availablePhotos.reduce((sum, photo) => sum + photo.price, 0);

    const orderRes = await request("POST", "/api/orders", {
      customerName: "Verificación DEMO",
      customerEmail: email,
      photoIds: availablePhotos.map((photo) => photo.id),
    });
    const order = (orderRes.body as { data?: OrderRow }).data;
    check(orderRes.status === 201, "crear pedido DEMO con fotos del seed", orderRes.status);
    check(
      order?.subtotal === expectedSubtotal && order?.total === expectedSubtotal,
      "subtotal y total calculados desde la BD",
      order?.subtotal,
    );
    check(order?.items.length === 2 && order?.demo === true, "pedido con 2 fotos y marcado demo");

    const byEmail = await request("GET", `/api/orders?email=${encodeURIComponent(email)}`);
    const orders = (byEmail.body as { data?: OrderRow[]; count?: number }).data ?? [];
    check(byEmail.status === 200 && orders.length === 1, "consulta por correo devuelve el pedido", orders.length);
    check(
      Boolean(orders[0]?.items.every((item) => availablePhotos.some((photo) => photo.id === item.photoId))),
      "fotografías adquiridas consultables por correo",
    );

    await prisma.$disconnect();
    const fresh = new PrismaClient();
    const persisted = await fresh.order.findUnique({
      where: { orderNumber: order!.orderNumber },
      include: { items: true },
    });
    check(persisted !== null && persisted.items.length === 2, "el pedido persiste tras cerrar la conexión");
    await fresh.$disconnect();

    await prisma.order.deleteMany({ where: { customerEmail: email } });
    check(
      (await prisma.order.count({ where: { customerEmail: email } })) === 0,
      "pedido de prueba eliminado",
    );
    check(
      (await prisma.event.count({ where: { id: { startsWith: "demo-event-" } } })) === 4,
      "los 4 eventos DEMO permanecen",
    );
    check(
      (await prisma.photo.count({ where: { id: { startsWith: "demo-photo-" } } })) >= 20,
      "las fotografías DEMO permanecen",
    );
  } finally {
    await prisma.order.deleteMany({ where: { customerEmail: email } }).catch(() => undefined);
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
  console.error("\nRESULTADO: la verificación de datos DEMO falló.");
  console.error(error);
  process.exitCode = 1;
});
