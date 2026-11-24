import "./env";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Cliente Prisma único. Se reutiliza entre recargas de `tsx watch` en
 * desarrollo para no abrir múltiples conexiones a SQLite.
 */
export const prisma =
  globalForPrisma.prisma ??
  // El errorHandler de la app registra los errores inesperados. Evitamos que
  // Prisma duplique el log de errores esperados (p. ej. P2025 -> 404).
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? [] : ["warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
