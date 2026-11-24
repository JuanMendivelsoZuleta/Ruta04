import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/http";
import { prisma } from "../lib/prisma";
import { withRecordNotFound } from "../lib/prisma-errors";
import { removeStoredFile, toStoragePath } from "../lib/storage";
import type { PhotoListQuery, PhotoUpdateInput } from "../lib/validation";
import { ensureEventExists } from "./event.service";

type UploadedFile = Express.Multer.File;

/** Lista fotografías, con filtros opcionales por evento y disponibilidad. */
export function listPhotos(filters: PhotoListQuery) {
  const where: Prisma.PhotoWhereInput = {};

  if (filters.eventId) {
    where.eventId = filters.eventId;
  }
  if (filters.available !== undefined) {
    where.available = filters.available;
  }

  return prisma.photo.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

/** Lista la galería de un evento, validando que el evento exista. */
export async function listPhotosByEvent(eventId: string) {
  await ensureEventExists(eventId);
  return listPhotos({ eventId });
}

export async function getPhotoById(id: string) {
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) {
    throw new AppError(404, "Fotografía no encontrada");
  }
  return photo;
}

/**
 * Crea una o varias fotografías para un evento. Los archivos ya fueron
 * guardados por multer; el handler de la ruta limpia los archivos si esta
 * operación falla.
 */
export async function createPhotos(
  eventId: string,
  files: UploadedFile[],
  price: number,
  code?: string,
) {
  await ensureEventExists(eventId);

  if (files.length === 0) {
    throw new AppError(400, "Datos inválidos", [
      "Debe adjuntar al menos un archivo en el campo 'files'",
    ]);
  }

  if (code !== undefined && files.length > 1) {
    throw new AppError(400, "Datos inválidos", [
      "code solo puede indicarse al subir una única fotografía",
    ]);
  }

  const codes = buildCodes(files.length, code);

  try {
    return await prisma.$transaction(
      files.map((file, index) =>
        prisma.photo.create({
          data: {
            eventId,
            storagePath: toStoragePath(file.filename),
            code: codes[index],
            price,
            available: true,
          },
        }),
      ),
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(409, "El código de fotografía ya existe");
    }
    throw error;
  }
}

export async function updatePhoto(id: string, input: PhotoUpdateInput) {
  return withRecordNotFound(
    () => prisma.photo.update({ where: { id }, data: input }),
    "Fotografía no encontrada",
  );
}

export async function deletePhoto(id: string): Promise<void> {
  const photo = await prisma.photo.findUnique({
    where: { id },
    select: { storagePath: true },
  });
  if (!photo) {
    throw new AppError(404, "Fotografía no encontrada");
  }

  // Si la foto está incluida en un pedido, Prisma lanza P2003 (Restrict) y el
  // handler responde 409 sin borrar el archivo.
  await withRecordNotFound(
    () => prisma.photo.delete({ where: { id } }),
    "Fotografía no encontrada",
  );

  await removeStoredFile(photo.storagePath);
}

/** Genera códigos únicos para una carga; respeta el código explícito. */
function buildCodes(count: number, provided?: string): string[] {
  if (provided !== undefined) {
    return [provided];
  }

  const codes = new Set<string>();
  while (codes.size < count) {
    codes.add(`PH-${randomBytes(4).toString("hex").toUpperCase()}`);
  }
  return [...codes];
}
