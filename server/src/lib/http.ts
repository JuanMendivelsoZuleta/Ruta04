import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

/**
 * Error de aplicación con código HTTP explícito.
 * Permite que servicios y validaciones comuniquen errores sin acoplarse a Express.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly details?: string[];

  constructor(statusCode: number, message: string, details?: string[]) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Ruta no encontrada" });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      res.status(404).json({ error: "Recurso no encontrado" });
      return;
    }
    if (err.code === "P2002") {
      res.status(409).json({ error: "Conflicto de unicidad" });
      return;
    }
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "JSON inválido" });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
}
