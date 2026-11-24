import { Prisma } from "@prisma/client";
import { AppError } from "../lib/http";
import { prisma } from "../lib/prisma";
import type {
  EventCreateInput,
  EventListQuery,
  EventUpdateInput,
} from "../lib/validation";

/** Lista eventos con búsqueda por nombre/ubicación y filtro por deporte. */
export function listEvents(filters: EventListQuery) {
  const where: Prisma.EventWhereInput = {};

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q } },
      { location: { contains: filters.q } },
    ];
  }

  if (filters.sport) {
    where.sportCategory = filters.sport;
  }

  return prisma.event.findMany({
    where,
    orderBy: { date: "desc" },
  });
}

export async function getEventById(id: string) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    throw new AppError(404, "Evento no encontrado");
  }
  return event;
}

export function createEvent(input: EventCreateInput) {
  return prisma.event.create({ data: input });
}

export async function updateEvent(id: string, input: EventUpdateInput) {
  return withNotFound(
    () => prisma.event.update({ where: { id }, data: input }),
    "Evento no encontrado",
  );
}

export async function deleteEvent(id: string): Promise<void> {
  await withNotFound(
    () => prisma.event.delete({ where: { id } }),
    "Evento no encontrado",
  );
}

/** Traduce el error P2025 de Prisma (registro inexistente) a un 404. */
async function withNotFound<T>(
  operation: () => Promise<T>,
  message: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError(404, message);
    }
    throw error;
  }
}
