import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/http";
import { prisma } from "../lib/prisma";
import type { OrderCreateInput } from "../lib/validation";

const ORDER_INCLUDE = Prisma.validator<Prisma.OrderInclude>()({
  items: { include: { photo: true } },
});

type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;
type DemoOrder = OrderWithItems & { demo: true };

/**
 * Crea un pedido DEMO. Los precios y totales se calculan exclusivamente con
 * los datos de la base de datos; cualquier precio enviado por el cliente se
 * ignora. No se integra ninguna pasarela de pago.
 */
export async function createOrder(input: OrderCreateInput): Promise<DemoOrder> {
  const photos = await prisma.photo.findMany({
    where: { id: { in: input.photoIds } },
    select: { id: true, price: true, available: true, code: true },
  });

  const foundIds = new Set(photos.map((photo) => photo.id));
  const missing = input.photoIds.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    throw new AppError(400, "Una o más fotografías no existen", missing);
  }

  const unavailable = photos.filter((photo) => !photo.available);
  if (unavailable.length > 0) {
    throw new AppError(
      409,
      "Una o más fotografías no están disponibles",
      unavailable.map((photo) => `${photo.code} no está disponible`),
    );
  }

  const subtotal = photos.reduce((sum, photo) => sum + photo.price, 0);
  const total = subtotal;

  const order = await persistOrder(input, photos, subtotal, total);
  return toDemoOrder(order);
}

/** Consulta los pedidos de un correo, con sus fotos adquiridas. */
export async function listOrdersByEmail(email: string): Promise<DemoOrder[]> {
  const orders = await prisma.order.findMany({
    where: { customerEmail: email },
    orderBy: { createdAt: "desc" },
    include: ORDER_INCLUDE,
  });
  return orders.map(toDemoOrder);
}

export async function getOrderByNumber(orderNumber: string): Promise<DemoOrder> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: ORDER_INCLUDE,
  });
  if (!order) {
    throw new AppError(404, "Pedido no encontrado");
  }
  return toDemoOrder(order);
}

async function persistOrder(
  input: OrderCreateInput,
  photos: Array<{ id: string; price: number }>,
  subtotal: number,
  total: number,
): Promise<OrderWithItems> {
  // Reintenta ante una colisión extremadamente improbable del orderNumber.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          subtotal,
          total,
          status: "COMPLETED",
          items: {
            create: photos.map((photo) => ({
              photoId: photo.id,
              price: photo.price,
            })),
          },
        },
        include: ORDER_INCLUDE,
      });
    } catch (error) {
      const isCollision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";
      if (isCollision && attempt < 2) {
        continue;
      }
      throw error;
    }
  }

  throw new AppError(500, "No se pudo generar un número de pedido único");
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(4).toString("hex").toUpperCase();
  return `DEMO-${timestamp}-${random}`;
}

function toDemoOrder(order: OrderWithItems): DemoOrder {
  return { ...order, demo: true };
}
