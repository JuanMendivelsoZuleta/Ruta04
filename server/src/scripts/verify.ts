import { prisma } from "../lib/prisma";
import { isEventStatus, isOrderStatus, isSportCategory } from "../lib/domain";

/**
 * Verificación real de persistencia: conexión, migraciones, relaciones,
 * restricciones e integridad. Crea datos temporales, los consulta y los
 * elimina al final para no contaminar la base de la demo.
 */

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`FALLO: ${message}`);
  }
  console.log(`  ok - ${message}`);
}

async function main(): Promise<void> {
  console.log("== Verificación de persistencia Ruta 04 ==\n");

  // 1. Conexión y tablas creadas por la migración
  const tables = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM sqlite_master
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `;
  const tableNames = tables.map((t) => t.name);
  console.log("Tablas:", tableNames.join(", "));
  for (const expected of ["Event", "Photo", "Order", "OrderItem"]) {
    assert(tableNames.includes(expected), `existe la tabla ${expected}`);
  }

  // 2. Constantes de dominio
  assert(isSportCategory("RUNNING"), "categoría RUNNING válida");
  assert(!isSportCategory("FOOTBALL"), "categoría FOOTBALL rechazada");
  assert(isEventStatus("ACTIVE"), "estado de evento ACTIVE válido");
  assert(isOrderStatus("PENDING"), "estado de pedido PENDING válido");

  // 3. Crear Event con Photos (relación 1:N)
  const event = await prisma.event.create({
    data: {
      name: "VERIFY - Evento temporal",
      sportCategory: "RUNNING",
      location: "Bogotá (verificación)",
      date: new Date("2026-01-01T00:00:00.000Z"),
      description: "Registro temporal de verificación",
      status: "DRAFT",
      photos: {
        create: [
          { storagePath: "/uploads/verify-a.jpg", code: "VERIFY-A", price: 12000 },
          { storagePath: "/uploads/verify-b.jpg", code: "VERIFY-B", price: 18000, available: false },
        ],
      },
    },
    include: { photos: true },
  });
  assert(event.photos.length === 2, "Event tiene 2 Photos relacionadas");
  assert(event.updatedAt instanceof Date, "Event expone updatedAt");

  const [photoA, photoB] = event.photos;

  // 4. Crear Order con OrderItems (relación 1:N y referencia a Photo)
  const order = await prisma.order.create({
    data: {
      orderNumber: `VERIFY-${Date.now()}`,
      customerName: "Cliente de verificación",
      customerEmail: "verify@example.com",
      subtotal: photoA.price + photoB.price,
      total: photoA.price + photoB.price,
      status: "PENDING",
      items: {
        create: [
          { photoId: photoA.id, price: photoA.price },
          { photoId: photoB.id, price: photoB.price },
        ],
      },
    },
    include: { items: { include: { photo: true } } },
  });
  assert(order.items.length === 2, "Order tiene 2 OrderItems");
  assert(
    order.items.every((item) => item.photo !== null),
    "cada OrderItem referencia su Photo",
  );
  assert(
    order.subtotal === order.items.reduce((sum, item) => sum + item.price, 0),
    "subtotal coincide con la suma de OrderItems",
  );

  // 5. Consultas por relaciones e índices
  const photoCount = await prisma.photo.count({ where: { eventId: event.id } });
  assert(photoCount === 2, "consulta por eventId devuelve 2 fotos");

  const byEmail = await prisma.order.findMany({
    where: { customerEmail: "verify@example.com" },
    include: { items: true },
  });
  assert(byEmail.length === 1, "consulta de pedidos por correo funciona");

  const byCode = await prisma.photo.findUnique({ where: { code: "VERIFY-A" } });
  assert(byCode?.id === photoA.id, "búsqueda de foto por código único funciona");

  // 6. Restricción de unicidad en Photo.code
  let uniqueEnforced = false;
  try {
    await prisma.photo.create({
      data: { eventId: event.id, storagePath: "/uploads/dup.jpg", code: "VERIFY-A", price: 1000 },
    });
  } catch {
    uniqueEnforced = true;
  }
  assert(uniqueEnforced, "Photo.code duplicado es rechazado (unique)");

  // 7. Restricción de integridad: no borrar foto incluida en un pedido
  let restrictEnforced = false;
  try {
    await prisma.photo.delete({ where: { id: photoA.id } });
  } catch {
    restrictEnforced = true;
  }
  assert(restrictEnforced, "no se puede borrar una Photo usada en un OrderItem (Restrict)");

  // 8. Limpieza (orden seguro por claves foráneas)
  await prisma.order.delete({ where: { id: order.id } }); // elimina OrderItems en cascada
  await prisma.event.delete({ where: { id: event.id } }); // elimina Photos en cascada
  const leftover = await prisma.event.count({ where: { name: "VERIFY - Evento temporal" } });
  assert(leftover === 0, "limpieza de datos temporales completada");

  console.log("\nRESULTADO: verificación de persistencia completada correctamente.");
}

main()
  .catch((error: unknown) => {
    console.error("\nRESULTADO: la verificación falló.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
