import "./env";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { AppError } from "./http";

/**
 * Almacenamiento de fotografías en Cloudinary (CDN).
 *
 * Los servicios de hosting gratuitos usan un sistema de archivos efímero: los
 * archivos guardados en disco se pierden en cada reinicio o despliegue. Por eso
 * las imágenes se suben a Cloudinary y en la base de datos se guarda la URL
 * pública (`secure_url`). El frontend ya renderiza `storagePath` como `<img src>`,
 * así que una URL absoluta funciona sin cambios.
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB por archivo
export const MAX_FILES = 20;

// Los archivos se mantienen en memoria el tiempo necesario para subirlos; no se
// escriben en el disco efímero del servidor.
const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  fileFilter: (_req, file, callback) => {
    const originalExtension = path.extname(file.originalname ?? "").toLowerCase();
    const mimeExtension = MIME_EXTENSION[file.mimetype];
    if (!mimeExtension || !ALLOWED_EXTENSIONS.has(originalExtension)) {
      callback(
        new AppError(400, "Archivo no permitido", [
          "Solo se aceptan archivos JPG, JPEG, PNG y WEBP",
        ]),
      );
      return;
    }
    callback(null, true);
  },
});

/** Middleware que acepta uno o varios archivos en el campo `files`. */
export const uploadPhotos = uploader.array("files", MAX_FILES);

export type UploadOptions = {
  /** public_id determinista (sin extensión) para sobrescribir sin duplicar. */
  publicId?: string;
  folder?: string;
  format?: string;
};

/** Sube un buffer a Cloudinary y devuelve la URL pública. */
export function uploadBufferToCloudinary(
  buffer: Buffer,
  options: UploadOptions = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder ?? "ruta04/photos",
        resource_type: "image",
        ...(options.publicId
          ? { public_id: options.publicId, overwrite: true, invalidate: true }
          : {}),
        ...(options.format ? { format: options.format } : {}),
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          // Log del error real de Cloudinary en el servidor (no se expone al cliente).
          console.error("[cloudinary] error al subir:", error?.message ?? error);
          reject(
            new AppError(502, "No se pudo almacenar la imagen", [
              "Intenta de nuevo en unos segundos",
            ]),
          );
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

/** Sube un archivo recibido por multer (en memoria). */
export function uploadPhotoFile(file: Express.Multer.File): Promise<string> {
  return uploadBufferToCloudinary(file.buffer, { folder: "ruta04/photos" });
}

/** Extrae el public_id de una URL de Cloudinary; null si no es de Cloudinary. */
export function cloudinaryPublicId(url: string): string | null {
  if (!url.startsWith("http")) {
    return null;
  }
  const marker = "/upload/";
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }
  let rest = url.slice(index + marker.length);
  rest = rest.replace(/^v\d+\//, ""); // quita la versión (p. ej. v1740000000/)
  rest = rest.replace(/\.[^/.]+$/, ""); // quita la extensión
  return rest || null;
}

/** Elimina un asset de Cloudinary a partir de su URL pública (idempotente). */
export async function removeStoredFile(storagePath: string): Promise<void> {
  const publicId = cloudinaryPublicId(storagePath);
  if (!publicId) {
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: "image",
    });
  } catch {
    // Si el asset ya no existe, no se considera un error para el MVP.
  }
}

export async function removeStoredFiles(storagePaths: string[]): Promise<void> {
  await Promise.all(storagePaths.map((storagePath) => removeStoredFile(storagePath)));
}
