import { randomUUID } from "node:crypto";
import { mkdirSync, promises as fs } from "node:fs";
import path from "node:path";
import multer from "multer";
import { AppError } from "./http";

/**
 * Almacenamiento local de la demo (sin servicios cloud).
 * Los archivos se guardan en `server/uploads/` y se sirven en `/uploads/*`.
 * En la base de datos se registra la ruta pública: `/uploads/<archivo>`.
 */

const DEFAULT_UPLOAD_DIR = path.resolve(__dirname, "../../uploads");

export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.cwd(), process.env.UPLOAD_DIR)
  : DEFAULT_UPLOAD_DIR;

export const UPLOAD_URL_PREFIX = "/uploads";

mkdirSync(UPLOAD_DIR, { recursive: true });

const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB por archivo
export const MAX_FILES = 20;

const diskStorage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, UPLOAD_DIR),
  filename: (_req, file, callback) => {
    // Nombre generado por el servidor: nunca se usa el nombre original para
    // evitar colisiones y path traversal.
    const extension = MIME_EXTENSION[file.mimetype] ?? ".bin";
    callback(null, `${randomUUID()}${extension}`);
  },
});

const uploader = multer({
  storage: diskStorage,
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

/** Convierte el nombre de archivo en la ruta pública almacenada en la BD. */
export function toStoragePath(filename: string): string {
  return `${UPLOAD_URL_PREFIX}/${filename}`;
}

/** Elimina un archivo físico iguiendo ENOENT (idempotente). */
export async function removeStoredFile(storagePath: string): Promise<void> {
  const filename = path.basename(storagePath);
  if (!filename) {
    return;
  }
  const fullPath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(fullPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

export async function removeStoredFiles(storagePaths: string[]): Promise<void> {
  await Promise.all(storagePaths.map((storagePath) => removeStoredFile(storagePath)));
}
