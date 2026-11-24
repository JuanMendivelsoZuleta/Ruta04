import { Prisma } from "@prisma/client";
import { AppError } from "./http";

/**
 * Ejecuta una operación de Prisma traduciendo P2025 (registro inexistente)
 * a un AppError 404 con mensaje de dominio.
 */
export async function withRecordNotFound<T>(
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
