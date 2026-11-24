import type { Prisma } from "@prisma/client";
import { AppError } from "../lib/http";
import { prisma } from "../lib/prisma";
import { withRecordNotFound } from "../lib/prisma-errors";
import { removeStoredFiles } from "../lib/storage";
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

/** Verifica que un evento exista (consulta ligera). */
export async function ensureEventExists(id: string): Promise<void> {
  const event = await prisma.event.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!event) {
    throw new AppError(404, "Evento no encontrado");
  }
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
  return withRecordNotFound(
    () => prisma.event.update({ where: { id }, data: input }),
    "Evento no encontrado",
  );
}

export async function deleteEvent(id: string): Promise<void> {
  // Se recogen las rutas antes del borrado en cascada para eliminar también
  // los archivos físicos. Si el borrado falla (p. ej. fotos ya vendidas), no
  // se tocan los archivos.
  const photos = await prisma.photo.findMany({
    where: { eventId: id },
    select: { storagePath: true },
  });

  await withRecordNotFound(
    () => prisma.event.delete({ where: { id } }),
    "Evento no encontrado",
  );

  await removeStoredFiles(photos.map((photo) => photo.storagePath));
}
