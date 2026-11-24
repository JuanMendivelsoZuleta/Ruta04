import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/http";
import { prisma } from "../lib/prisma";
import { withRecordNotFound } from "../lib/prisma-errors";
import { removeStoredFile, removeStoredFiles, uploadPhotoFile } from "../lib/storage";
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
  if (filters.code) {
    // Búsqueda insensible a mayúsculas/minúsculas (PostgreSQL).
    where.code = { contains: filters.code, mode: "insensitive" };
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
 * Crea una o varias fotografías para un evento. Los archivos llegan en memoria
 * (multer); se suben a Cloudinary y se guarda la URL pública. Si algo falla, se
 * eliminan los assets ya subidos para no dejar huérfanos.
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
  const uploadedUrls: string[] = [];

  try {
    // 1) Subir cada archivo a Cloudinary (almacenamiento persistente).
    for (const file of files) {
      const url = await uploadPhotoFile(file);
      uploadedUrls.push(url);
    }

    // 2) Registrar las fotografías guardando la URL pública de Cloudinary.
    return await prisma.$transaction(
      uploadedUrls.map((url, index) =>
        prisma.photo.create({
          data: {
            eventId,
            storagePath: url,
            code: codes[index],
            price,
            available: true,
          },
        }),
      ),
    );
  } catch (error) {
    // Evita assets huérfanos en Cloudinary si la inserción falla.
    await removeStoredFiles(uploadedUrls);
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
